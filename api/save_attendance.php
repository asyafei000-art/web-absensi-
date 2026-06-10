<?php
/**
 * Save/Add Attendance API
 * Endpoint: /api/save_attendance.php
 * Method: POST
 * 
 * Required parameters:
 * - nama: Employee name
 * - email: Employee email
 * - status: Attendance status (Hadir, Tidak Hadir, Izin, Sakit)
 * 
 * Optional parameters:
 * - foto: Photo (base64 encoded)
 * - lokasi: Location
 * - latitude: GPS latitude
 * - longitude: GPS longitude
 * - catatan: Notes
 */

require_once 'config.php';

header('Content-Type: application/json');

try {
    // Check if POST request
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Invalid request method');
    }

    // Get JSON data
    $input = json_decode(file_get_contents('php://input'), true);

    if (!$input) {
        throw new Exception('Invalid JSON input');
    }

    // Validate required fields
    if (empty($input['nama']) || empty($input['email']) || empty($input['status'])) {
        throw new Exception('Nama, email, dan status wajib diisi');
    }

    // Sanitize input
    $id = 'ABS-' . time();
    $nama = sanitize($input['nama']);
    $email = sanitize($input['email']);
    $status = sanitize($input['status']);
    $catatan = isset($input['catatan']) ? sanitize($input['catatan']) : null;
    $lokasi = isset($input['lokasi']) ? sanitize($input['lokasi']) : 'Unknown';
    $latitude = isset($input['latitude']) ? (float)$input['latitude'] : null;
    $longitude = isset($input['longitude']) ? (float)$input['longitude'] : null;
    $tanggal = date('Y-m-d');
    $waktu_masuk = date('H:i:s');

    // Process foto if provided
    $foto = null;
    if (!empty($input['foto'])) {
        try {
            // Remove data:image/jpeg;base64, prefix if present
            $base64 = preg_replace('/^data:image\/\w+;base64,/', '', $input['foto']);
            $foto = base64_decode($base64, true);
            
            if ($foto === false) {
                throw new Exception('Invalid base64 encoding');
            }
        } catch (Exception $e) {
            logError('Error processing foto', $e->getMessage());
            $foto = null;
        }
    }

    // Prepare SQL statement
    $sql = "INSERT INTO attendance 
            (id, nama, email, tanggal, waktu_masuk, foto, latitude, longitude, lokasi, status, catatan) 
            VALUES 
            (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

    $stmt = $conn->prepare($sql);

    if (!$stmt) {
        throw new Exception('Prepare failed: ' . $conn->error);
    }

    // Bind parameters
    $stmt->bind_param(
        'sssssdddsss',
        $id,
        $nama,
        $email,
        $tanggal,
        $waktu_masuk,
        $foto,
        $latitude,
        $longitude,
        $lokasi,
        $status,
        $catatan
    );

    // Execute
    if (!$stmt->execute()) {
        throw new Exception('Execute failed: ' . $stmt->error);
    }

    $stmt->close();

    // Log successful attendance
    logError('Attendance saved', "ID: $id, Email: $email, Status: $status");

    echo json_encode([
        'success' => true,
        'message' => 'Absensi berhasil disimpan',
        'data' => [
            'id' => $id,
            'nama' => $nama,
            'email' => $email,
            'tanggal' => $tanggal,
            'waktu_masuk' => $waktu_masuk,
            'status' => $status,
            'lokasi' => $lokasi
        ]
    ]);

} catch (Exception $e) {
    logError('Error in save_attendance.php', $e->getMessage());
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage()
    ]);
}

function sanitize($input) {
    return htmlspecialchars(strip_tags(trim($input)), ENT_QUOTES, 'UTF-8');
}

$conn->close();
?>

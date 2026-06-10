<?php
/**
 * Update Attendance API
 * Endpoint: /api/update_attendance.php
 * Method: POST
 * 
 * Required parameters:
 * - id: Attendance ID
 * - status: New status
 * 
 * Optional parameters:
 * - nama: Employee name
 * - email: Employee email
 * - catatan: Notes
 * - waktu_keluar: Check out time
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
    if (empty($input['id'])) {
        throw new Exception('ID absensi wajib diisi');
    }

    // Sanitize input
    $id = sanitize($input['id']);
    $status = isset($input['status']) ? sanitize($input['status']) : null;
    $catatan = isset($input['catatan']) ? sanitize($input['catatan']) : null;
    $waktu_keluar = isset($input['waktu_keluar']) ? sanitize($input['waktu_keluar']) : null;
    $nama = isset($input['nama']) ? sanitize($input['nama']) : null;
    $email = isset($input['email']) ? sanitize($input['email']) : null;

    // Build update query
    $updates = [];
    $types = '';
    $params = [];

    if ($status !== null) {
        $updates[] = 'status = ?';
        $types .= 's';
        $params[] = $status;
    }

    if ($catatan !== null) {
        $updates[] = 'catatan = ?';
        $types .= 's';
        $params[] = $catatan;
    }

    if ($waktu_keluar !== null) {
        $updates[] = 'waktu_keluar = ?';
        $types .= 's';
        $params[] = $waktu_keluar;
    }

    if ($nama !== null) {
        $updates[] = 'nama = ?';
        $types .= 's';
        $params[] = $nama;
    }

    if ($email !== null) {
        $updates[] = 'email = ?';
        $types .= 's';
        $params[] = $email;
    }

    if (empty($updates)) {
        throw new Exception('Tidak ada data untuk diupdate');
    }

    // Add updated_at
    $updates[] = 'updated_at = CURRENT_TIMESTAMP';

    // Prepare SQL
    $sql = "UPDATE attendance SET " . implode(', ', $updates) . " WHERE id = ?";

    $stmt = $conn->prepare($sql);

    if (!$stmt) {
        throw new Exception('Prepare failed: ' . $conn->error);
    }

    // Add id to params
    $types .= 's';
    $params[] = $id;

    // Bind parameters
    $stmt->bind_param($types, ...$params);

    // Execute
    if (!$stmt->execute()) {
        throw new Exception('Execute failed: ' . $stmt->error);
    }

    // Check if record was updated
    if ($stmt->affected_rows === 0) {
        throw new Exception('ID absensi tidak ditemukan');
    }

    $stmt->close();

    logError('Attendance updated', "ID: $id");

    echo json_encode([
        'success' => true,
        'message' => 'Absensi berhasil diperbarui',
        'id' => $id
    ]);

} catch (Exception $e) {
    logError('Error in update_attendance.php', $e->getMessage());
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage()
    ]);
}

function sanitize($input) {
    if (is_null($input)) return null;
    return htmlspecialchars(strip_tags(trim($input)), ENT_QUOTES, 'UTF-8');
}

$conn->close();
?>

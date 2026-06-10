<?php
/**
 * Get Attendance Statistics API
 * Endpoint: /api/get_statistics.php
 * Method: GET
 * 
 * Optional parameters:
 * - tanggal_awal: Start date (YYYY-MM-DD)
 * - tanggal_akhir: End date (YYYY-MM-DD)
 * - email: Filter by email
 */

require_once 'config.php';

try {
    // Get query parameters
    $tanggal_awal = isset($_GET['tanggal_awal']) ? sanitize($_GET['tanggal_awal']) : null;
    $tanggal_akhir = isset($_GET['tanggal_akhir']) ? sanitize($_GET['tanggal_akhir']) : null;
    $email = isset($_GET['email']) ? sanitize($_GET['email']) : null;

    // Build WHERE clause
    $where = [];
    $types = '';
    $params = [];

    if ($tanggal_awal) {
        $where[] = 'tanggal >= ?';
        $types .= 's';
        $params[] = $tanggal_awal;
    }

    if ($tanggal_akhir) {
        $where[] = 'tanggal <= ?';
        $types .= 's';
        $params[] = $tanggal_akhir;
    }

    if ($email) {
        $where[] = 'email = ?';
        $types .= 's';
        $params[] = $email;
    }

    $whereClause = !empty($where) ? 'WHERE ' . implode(' AND ', $where) : '';

    // Get overall statistics
    $sql = "SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'Hadir' THEN 1 ELSE 0 END) as hadir,
                SUM(CASE WHEN status = 'Tidak Hadir' THEN 1 ELSE 0 END) as tidak_hadir,
                SUM(CASE WHEN status = 'Izin' THEN 1 ELSE 0 END) as izin,
                SUM(CASE WHEN status = 'Sakit' THEN 1 ELSE 0 END) as sakit
            FROM attendance 
            $whereClause";

    $stmt = $conn->prepare($sql);

    if (!$stmt) {
        throw new Exception('Prepare failed: ' . $conn->error);
    }

    if (!empty($types)) {
        $stmt->bind_param($types, ...$params);
    }

    if (!$stmt->execute()) {
        throw new Exception('Execute failed: ' . $stmt->error);
    }

    $result = $stmt->get_result();
    $stats = $result->fetch_assoc();
    $stmt->close();

    // Calculate percentages
    $total = (int)$stats['total'];
    $hadir = (int)($stats['hadir'] ?? 0);
    $tidak_hadir = (int)($stats['tidak_hadir'] ?? 0);
    $izin = (int)($stats['izin'] ?? 0);
    $sakit = (int)($stats['sakit'] ?? 0);

    $persentase_hadir = $total > 0 ? round(($hadir / $total) * 100, 2) : 0;

    // Get daily statistics
    $sql = "SELECT 
                tanggal,
                COUNT(*) as total,
                SUM(CASE WHEN status = 'Hadir' THEN 1 ELSE 0 END) as hadir,
                SUM(CASE WHEN status = 'Tidak Hadir' THEN 1 ELSE 0 END) as tidak_hadir,
                SUM(CASE WHEN status = 'Izin' THEN 1 ELSE 0 END) as izin,
                SUM(CASE WHEN status = 'Sakit' THEN 1 ELSE 0 END) as sakit
            FROM attendance 
            $whereClause
            GROUP BY tanggal
            ORDER BY tanggal DESC
            LIMIT 30";

    $stmt = $conn->prepare($sql);

    if (!$stmt) {
        throw new Exception('Prepare failed: ' . $conn->error);
    }

    if (!empty($types)) {
        $stmt->bind_param($types, ...$params);
    }

    if (!$stmt->execute()) {
        throw new Exception('Execute failed: ' . $stmt->error);
    }

    $result = $stmt->get_result();
    $daily_stats = [];

    while ($row = $result->fetch_assoc()) {
        $daily_stats[] = $row;
    }

    $stmt->close();

    // Get employee statistics
    $sql = "SELECT 
                email,
                COUNT(*) as total,
                SUM(CASE WHEN status = 'Hadir' THEN 1 ELSE 0 END) as hadir,
                SUM(CASE WHEN status = 'Tidak Hadir' THEN 1 ELSE 0 END) as tidak_hadir,
                SUM(CASE WHEN status = 'Izin' THEN 1 ELSE 0 END) as izin,
                SUM(CASE WHEN status = 'Sakit' THEN 1 ELSE 0 END) as sakit
            FROM attendance 
            $whereClause
            GROUP BY email
            ORDER BY total DESC";

    $stmt = $conn->prepare($sql);

    if (!$stmt) {
        throw new Exception('Prepare failed: ' . $conn->error);
    }

    if (!empty($types)) {
        $stmt->bind_param($types, ...$params);
    }

    if (!$stmt->execute()) {
        throw new Exception('Execute failed: ' . $stmt->error);
    }

    $result = $stmt->get_result();
    $employee_stats = [];

    while ($row = $result->fetch_assoc()) {
        $row['persentase_hadir'] = $row['total'] > 0 ? round(($row['hadir'] / $row['total']) * 100, 2) : 0;
        $employee_stats[] = $row;
    }

    $stmt->close();

    echo json_encode([
        'success' => true,
        'message' => 'Statistik berhasil diambil',
        'summary' => [
            'total' => $total,
            'hadir' => $hadir,
            'tidak_hadir' => $tidak_hadir,
            'izin' => $izin,
            'sakit' => $sakit,
            'persentase_hadir' => $persentase_hadir
        ],
        'daily_stats' => $daily_stats,
        'employee_stats' => $employee_stats
    ]);

} catch (Exception $e) {
    logError('Error in get_statistics.php', $e->getMessage());
    http_response_code(500);
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

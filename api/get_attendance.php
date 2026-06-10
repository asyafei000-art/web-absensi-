<?php
/**
 * Get Attendance Data API
 * Endpoint: /api/get_attendance.php
 * Method: GET
 * 
 * Parameters (optional):
 * - email: Filter by email
 * - tanggal: Filter by date (YYYY-MM-DD)
 * - status: Filter by status
 * - limit: Number of records (default: 1000)
 * - offset: Offset for pagination (default: 0)
 */

require_once 'config.php';

try {
    // Get query parameters
    $email = isset($_GET['email']) ? sanitize($_GET['email']) : null;
    $tanggal = isset($_GET['tanggal']) ? sanitize($_GET['tanggal']) : null;
    $status = isset($_GET['status']) ? sanitize($_GET['status']) : null;
    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 1000;
    $offset = isset($_GET['offset']) ? (int)$_GET['offset'] : 0;

    // Build WHERE clause
    $where = [];
    $types = '';
    $params = [];

    if ($email) {
        $where[] = 'email = ?';
        $types .= 's';
        $params[] = $email;
    }

    if ($tanggal) {
        $where[] = 'tanggal = ?';
        $types .= 's';
        $params[] = $tanggal;
    }

    if ($status) {
        $where[] = 'status = ?';
        $types .= 's';
        $params[] = $status;
    }

    $whereClause = !empty($where) ? 'WHERE ' . implode(' AND ', $where) : '';

    // Prepare and execute query
    $sql = "SELECT 
                id, nama, email, tanggal, waktu_masuk, waktu_keluar, 
                foto, latitude, longitude, lokasi, status, catatan, 
                created_at, updated_at 
            FROM attendance 
            $whereClause 
            ORDER BY tanggal DESC, waktu_masuk DESC 
            LIMIT ? OFFSET ?";

    $stmt = $conn->prepare($sql);
    
    if (!$stmt) {
        throw new Exception('Prepare failed: ' . $conn->error);
    }

    // Add limit and offset to params
    $types .= 'ii';
    $params[] = $limit;
    $params[] = $offset;

    // Bind parameters
    if (!empty($types)) {
        $stmt->bind_param($types, ...$params);
    }

    // Execute
    if (!$stmt->execute()) {
        throw new Exception('Execute failed: ' . $stmt->error);
    }

    $result = $stmt->get_result();

    // Fetch data
    $data = [];
    while ($row = $result->fetch_assoc()) {
        // Convert binary foto to base64
        if ($row['foto']) {
            $row['foto'] = 'data:image/jpeg;base64,' . base64_encode($row['foto']);
        }
        $data[] = $row;
    }

    // Get total count
    $countSql = "SELECT COUNT(*) as total FROM attendance $whereClause";
    $countStmt = $conn->prepare($countSql);
    
    if (!empty($where)) {
        $countTypes = substr($types, 0, -2); // Remove limit and offset types
        $countParams = array_slice($params, 0, -2);
        if (!empty($countTypes)) {
            $countStmt->bind_param($countTypes, ...$countParams);
        }
    }

    $countStmt->execute();
    $countResult = $countStmt->get_result();
    $countRow = $countResult->fetch_assoc();
    $total = $countRow['total'];

    $stmt->close();
    $countStmt->close();

    // Send response
    echo json_encode([
        'success' => true,
        'message' => 'Data berhasil diambil',
        'data' => $data,
        'total' => $total,
        'count' => count($data)
    ]);

} catch (Exception $e) {
    logError('Error in get_attendance.php', $e->getMessage());
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

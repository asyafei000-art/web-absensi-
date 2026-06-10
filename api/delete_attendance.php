<?php
/**
 * Delete Attendance API
 * Endpoint: /api/delete_attendance.php
 * Method: POST
 * 
 * Required parameters:
 * - id: Attendance ID to delete
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

    // Prepare SQL
    $sql = "DELETE FROM attendance WHERE id = ?";

    $stmt = $conn->prepare($sql);

    if (!$stmt) {
        throw new Exception('Prepare failed: ' . $conn->error);
    }

    // Bind parameters
    $stmt->bind_param('s', $id);

    // Execute
    if (!$stmt->execute()) {
        throw new Exception('Execute failed: ' . $stmt->error);
    }

    // Check if record was deleted
    if ($stmt->affected_rows === 0) {
        throw new Exception('ID absensi tidak ditemukan');
    }

    $stmt->close();

    logError('Attendance deleted', "ID: $id");

    echo json_encode([
        'success' => true,
        'message' => 'Absensi berhasil dihapus',
        'id' => $id
    ]);

} catch (Exception $e) {
    logError('Error in delete_attendance.php', $e->getMessage());
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

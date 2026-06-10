<?php
/**
 * Database Configuration
 * File konfigurasi koneksi database MySQL
 */

// Database Configuration
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASSWORD', '');
define('DB_NAME', 'web_absensi');
define('DB_CHARSET', 'utf8mb4');

// Timezone
date_default_timezone_set('Asia/Jakarta');

// Error reporting (disable in production)
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/error.log');

// CORS headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');

// Create database connection
try {
    $conn = new mysqli(DB_HOST, DB_USER, DB_PASSWORD);

    // Check connection
    if ($conn->connect_error) {
        throw new Exception('Connection failed: ' . $conn->connect_error);
    }

    // Set charset
    $conn->set_charset(DB_CHARSET);

    // Create database if not exists
    $sql = "CREATE DATABASE IF NOT EXISTS " . DB_NAME;
    if (!$conn->query($sql)) {
        throw new Exception('Error creating database: ' . $conn->error);
    }

    // Select database
    $conn->select_db(DB_NAME);

    // Create tables if not exists
    createTables($conn);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database connection error: ' . $e->getMessage()
    ]);
    die();
}

/**
 * Create required tables
 */
function createTables($conn) {
    // Attendance table
    $sql = "CREATE TABLE IF NOT EXISTS attendance (
        id VARCHAR(20) PRIMARY KEY,
        nama VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL,
        tanggal DATE NOT NULL,
        waktu_masuk TIME,
        waktu_keluar TIME,
        foto LONGBLOB,
        latitude DECIMAL(10, 8),
        longitude DECIMAL(11, 8),
        lokasi VARCHAR(255),
        status VARCHAR(50) NOT NULL DEFAULT 'Hadir',
        catatan TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_tanggal (tanggal),
        INDEX idx_status (status)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";

    if (!$conn->query($sql)) {
        throw new Exception('Error creating attendance table: ' . $conn->error);
    }

    // Users table (optional)
    $sql = "CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        nama VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        no_hp VARCHAR(15),
        departemen VARCHAR(50),
        jabatan VARCHAR(50),
        foto VARCHAR(255),
        status VARCHAR(20) DEFAULT 'Aktif',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_email (email)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";

    if (!$conn->query($sql)) {
        // Table might already exist, skip error
    }

    // Attendance Summary table (optional)
    $sql = "CREATE TABLE IF NOT EXISTS attendance_summary (
        id INT PRIMARY KEY AUTO_INCREMENT,
        email VARCHAR(100) NOT NULL,
        tanggal DATE NOT NULL,
        total_hadir INT DEFAULT 0,
        total_tidakhadir INT DEFAULT 0,
        total_izin INT DEFAULT 0,
        total_sakit INT DEFAULT 0,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_email_date (email, tanggal),
        INDEX idx_email (email),
        INDEX idx_tanggal (tanggal)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";

    if (!$conn->query($sql)) {
        // Table might already exist, skip error
    }
}

/**
 * Helper functions
 */

function getResponse($success, $message = '', $data = null) {
    $response = [
        'success' => $success,
        'message' => $message
    ];

    if ($data !== null) {
        $response['data'] = $data;
    }

    return json_encode($response);
}

function logError($message, $error = '') {
    $log = "["  . date('Y-m-d H:i:s') . "] " . $message;
    if (!empty($error)) {
        $log .= " - Error: " . $error;
    }
    error_log($log);
}

?>

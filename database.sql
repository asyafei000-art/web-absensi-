-- ============================================
-- Web Absensi Database Setup
-- ============================================
-- Jalankan script ini di phpMyAdmin untuk membuat struktur database

-- ============================================
-- CREATE DATABASE
-- ============================================
CREATE DATABASE IF NOT EXISTS `web_absensi` 
    DEFAULT CHARACTER SET utf8mb4 
    COLLATE utf8mb4_unicode_ci;

USE `web_absensi`;

-- ============================================
-- TABLE: ATTENDANCE (Riwayat Absensi)
-- ============================================
CREATE TABLE IF NOT EXISTS `attendance` (
    `id` VARCHAR(20) PRIMARY KEY COMMENT 'ID unik absensi (format: ABS-timestamp)',
    `nama` VARCHAR(100) NOT NULL COMMENT 'Nama karyawan',
    `email` VARCHAR(100) NOT NULL COMMENT 'Email karyawan',
    `tanggal` DATE NOT NULL COMMENT 'Tanggal absensi',
    `waktu_masuk` TIME NULL COMMENT 'Waktu masuk/check-in',
    `waktu_keluar` TIME NULL COMMENT 'Waktu keluar/check-out',
    `foto` LONGBLOB NULL COMMENT 'Foto wajah (binary data)',
    `latitude` DECIMAL(10, 8) NULL COMMENT 'Koordinat GPS latitude',
    `longitude` DECIMAL(11, 8) NULL COMMENT 'Koordinat GPS longitude',
    `lokasi` VARCHAR(255) NULL DEFAULT 'Unknown' COMMENT 'Lokasi absensi',
    `status` VARCHAR(50) NOT NULL DEFAULT 'Hadir' 
        COMMENT 'Status absensi (Hadir/Tidak Hadir/Izin/Sakit)',
    `catatan` TEXT NULL COMMENT 'Catatan tambahan',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Waktu record dibuat',
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
        ON UPDATE CURRENT_TIMESTAMP COMMENT 'Waktu record diupdate',
    
    -- INDEXES
    KEY `idx_email` (`email`),
    KEY `idx_tanggal` (`tanggal`),
    KEY `idx_status` (`status`),
    KEY `idx_email_tanggal` (`email`, `tanggal`)
    
) ENGINE=InnoDB 
DEFAULT CHARSET=utf8mb4 
COLLATE=utf8mb4_unicode_ci
COMMENT='Tabel riwayat absensi karyawan';

-- ============================================
-- TABLE: USERS (Data Karyawan)
-- ============================================
CREATE TABLE IF NOT EXISTS `users` (
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `nama` VARCHAR(100) NOT NULL COMMENT 'Nama karyawan',
    `email` VARCHAR(100) UNIQUE NOT NULL COMMENT 'Email karyawan (unik)',
    `no_hp` VARCHAR(15) NULL COMMENT 'Nomor HP',
    `departemen` VARCHAR(50) NULL COMMENT 'Departemen',
    `jabatan` VARCHAR(50) NULL COMMENT 'Jabatan',
    `foto` VARCHAR(255) NULL COMMENT 'Path foto profile',
    `status` VARCHAR(20) DEFAULT 'Aktif' 
        COMMENT 'Status karyawan (Aktif/Nonaktif)',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- INDEXES
    KEY `idx_email` (`email`),
    KEY `idx_departemen` (`departemen`),
    KEY `idx_status` (`status`)
    
) ENGINE=InnoDB 
DEFAULT CHARSET=utf8mb4 
COLLATE=utf8mb4_unicode_ci
COMMENT='Tabel data karyawan';

-- ============================================
-- TABLE: ATTENDANCE_SUMMARY (Ringkasan Absensi)
-- ============================================
CREATE TABLE IF NOT EXISTS `attendance_summary` (
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `email` VARCHAR(100) NOT NULL,
    `tanggal` DATE NOT NULL,
    `total_hadir` INT DEFAULT 0,
    `total_tidakhadir` INT DEFAULT 0,
    `total_izin` INT DEFAULT 0,
    `total_sakit` INT DEFAULT 0,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- CONSTRAINTS
    UNIQUE KEY `unique_email_date` (`email`, `tanggal`),
    
    -- INDEXES
    KEY `idx_email` (`email`),
    KEY `idx_tanggal` (`tanggal`)
    
) ENGINE=InnoDB 
DEFAULT CHARSET=utf8mb4 
COLLATE=utf8mb4_unicode_ci
COMMENT='Ringkasan absensi harian per karyawan';

-- ============================================
-- TABLE: PERMISSIONS (Izin Khusus)
-- ============================================
CREATE TABLE IF NOT EXISTS `permissions` (
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `email` VARCHAR(100) NOT NULL,
    `tanggal_awal` DATE NOT NULL,
    `tanggal_akhir` DATE NOT NULL,
    `tipe` VARCHAR(50) NOT NULL 
        COMMENT 'Tipe izin (Cuti/Sakit/Dinas)',
    `alasan` TEXT,
    `status` VARCHAR(20) DEFAULT 'Pending' 
        COMMENT 'Status approval (Pending/Approved/Rejected)',
    `disetujui_oleh` VARCHAR(100) NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- INDEXES
    KEY `idx_email` (`email`),
    KEY `idx_status` (`status`),
    KEY `idx_tipe` (`tipe`)
    
) ENGINE=InnoDB 
DEFAULT CHARSET=utf8mb4 
COLLATE=utf8mb4_unicode_ci
COMMENT='Tabel permintaan izin karyawan';

-- ============================================
-- TABLE: AUDIT_LOG (Log Aktivitas)
-- ============================================
CREATE TABLE IF NOT EXISTS `audit_log` (
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `aksi` VARCHAR(50) NOT NULL 
        COMMENT 'Tipe aksi (INSERT/UPDATE/DELETE)',
    `tabel` VARCHAR(50) NOT NULL 
        COMMENT 'Nama tabel yang dimodifikasi',
    `record_id` VARCHAR(100) NOT NULL 
        COMMENT 'ID record yang dimodifikasi',
    `user` VARCHAR(100) NULL 
        COMMENT 'User yang melakukan aksi',
    `data_lama` JSON NULL 
        COMMENT 'Data sebelum perubahan (JSON)',
    `data_baru` JSON NULL 
        COMMENT 'Data sesudah perubahan (JSON)',
    `ip_address` VARCHAR(45) NULL,
    `user_agent` TEXT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- INDEXES
    KEY `idx_tabel` (`tabel`),
    KEY `idx_record_id` (`record_id`),
    KEY `idx_created_at` (`created_at`)
    
) ENGINE=InnoDB 
DEFAULT CHARSET=utf8mb4 
COLLATE=utf8mb4_unicode_ci
COMMENT='Log audit untuk tracking perubahan data';

-- ============================================
-- INSERT SAMPLE DATA
-- ============================================

-- Insert sample users
INSERT INTO `users` 
    (`nama`, `email`, `no_hp`, `departemen`, `jabatan`) 
VALUES 
    ('John Doe', 'john.doe@company.com', '081234567890', 'IT', 'Developer'),
    ('Jane Smith', 'jane.smith@company.com', '081234567891', 'HR', 'Manager'),
    ('Bob Johnson', 'bob.johnson@company.com', '081234567892', 'Finance', 'Accountant'),
    ('Alice Williams', 'alice.williams@company.com', '081234567893', 'IT', 'Analyst')
ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP;

-- Insert sample attendance records (last 30 days)
INSERT INTO `attendance` 
    (`id`, `nama`, `email`, `tanggal`, `waktu_masuk`, `status`, `lokasi`) 
VALUES 
    ('ABS-1717963200', 'John Doe', 'john.doe@company.com', '2024-06-10', '08:15:00', 'Hadir', 'Jakarta Pusat'),
    ('ABS-1717963201', 'Jane Smith', 'jane.smith@company.com', '2024-06-10', '08:05:00', 'Hadir', 'Jakarta Pusat'),
    ('ABS-1717963202', 'Bob Johnson', 'bob.johnson@company.com', '2024-06-10', '08:45:00', 'Hadir', 'Jakarta Pusat'),
    ('ABS-1717963203', 'Alice Williams', 'alice.williams@company.com', '2024-06-10', '08:25:00', 'Hadir', 'Jakarta Pusat'),
    ('ABS-1717876800', 'John Doe', 'john.doe@company.com', '2024-06-09', '08:10:00', 'Hadir', 'Jakarta Pusat'),
    ('ABS-1717876801', 'Jane Smith', 'jane.smith@company.com', '2024-06-09', '08:00:00', 'Hadir', 'Jakarta Pusat'),
    ('ABS-1717876802', 'Bob Johnson', 'bob.johnson@company.com', '2024-06-09', '08:30:00', 'Izin', 'Unknown'),
    ('ABS-1717876803', 'Alice Williams', 'alice.williams@company.com', '2024-06-09', '08:20:00', 'Sakit', 'Unknown')
ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP;

-- ============================================
-- CREATE VIEWS (Optional)
-- ============================================

-- View: Daily Summary
CREATE OR REPLACE VIEW `vw_daily_summary` AS
SELECT 
    DATE(a.tanggal) as tanggal,
    COUNT(*) as total_absensi,
    SUM(CASE WHEN a.status = 'Hadir' THEN 1 ELSE 0 END) as jumlah_hadir,
    SUM(CASE WHEN a.status = 'Tidak Hadir' THEN 1 ELSE 0 END) as jumlah_tidak_hadir,
    SUM(CASE WHEN a.status = 'Izin' THEN 1 ELSE 0 END) as jumlah_izin,
    SUM(CASE WHEN a.status = 'Sakit' THEN 1 ELSE 0 END) as jumlah_sakit,
    ROUND(
        (SUM(CASE WHEN a.status = 'Hadir' THEN 1 ELSE 0 END) / COUNT(*)) * 100, 
        2
    ) as persentase_kehadiran
FROM attendance a
GROUP BY DATE(a.tanggal)
ORDER BY tanggal DESC;

-- View: Employee Summary
CREATE OR REPLACE VIEW `vw_employee_summary` AS
SELECT 
    u.email,
    u.nama,
    u.departemen,
    COUNT(a.id) as total_absensi,
    SUM(CASE WHEN a.status = 'Hadir' THEN 1 ELSE 0 END) as jumlah_hadir,
    SUM(CASE WHEN a.status = 'Tidak Hadir' THEN 1 ELSE 0 END) as jumlah_tidak_hadir,
    SUM(CASE WHEN a.status = 'Izin' THEN 1 ELSE 0 END) as jumlah_izin,
    SUM(CASE WHEN a.status = 'Sakit' THEN 1 ELSE 0 END) as jumlah_sakit,
    ROUND(
        (SUM(CASE WHEN a.status = 'Hadir' THEN 1 ELSE 0 END) / COUNT(a.id)) * 100,
        2
    ) as persentase_kehadiran,
    MAX(a.tanggal) as absensi_terakhir
FROM users u
LEFT JOIN attendance a ON u.email = a.email
GROUP BY u.email, u.nama, u.departemen
ORDER BY persentase_kehadiran DESC;

-- ============================================
-- STORED PROCEDURES (Optional)
-- ============================================

-- Procedure: Get Employee Attendance by Date Range
DELIMITER //

CREATE PROCEDURE IF NOT EXISTS `sp_get_attendance_by_range`(
    IN p_email VARCHAR(100),
    IN p_start_date DATE,
    IN p_end_date DATE
)
BEGIN
    SELECT 
        id,
        nama,
        email,
        tanggal,
        waktu_masuk,
        waktu_keluar,
        lokasi,
        status,
        catatan
    FROM attendance
    WHERE 
        (p_email IS NULL OR email = p_email)
        AND tanggal BETWEEN p_start_date AND p_end_date
    ORDER BY tanggal DESC, waktu_masuk DESC;
END //

DELIMITER ;

-- ============================================
-- INDEXES untuk Performance
-- ============================================

-- Analyze tables untuk optimization
ANALYZE TABLE `attendance`;
ANALYZE TABLE `users`;
ANALYZE TABLE `attendance_summary`;
ANALYZE TABLE `permissions`;
ANALYZE TABLE `audit_log`;

-- ============================================
-- BACKUP/RESTORE INSTRUCTIONS
-- ============================================

/*
BACKUP DATABASE:
    mysqldump -u root -p web_absensi > backup_web_absensi_$(date +%Y%m%d_%H%M%S).sql

RESTORE DATABASE:
    mysql -u root -p web_absensi < backup_web_absensi_20240610_120000.sql

EXPORT DATA TO CSV:
    SELECT * INTO OUTFILE '/tmp/attendance.csv'
    FIELDS TERMINATED BY ','
    ENCLOSED BY '"'
    LINES TERMINATED BY '\n'
    FROM attendance;
*/

-- ============================================
-- DATABASE INFO
-- ============================================
-- Database: web_absensi
-- Tables: 6 (attendance, users, attendance_summary, permissions, audit_log, dan 2 views)
-- Views: 2 (vw_daily_summary, vw_employee_summary)
-- Stored Procedures: 1 (sp_get_attendance_by_range)
-- Default Charset: utf8mb4
-- Collation: utf8mb4_unicode_ci
-- ============================================

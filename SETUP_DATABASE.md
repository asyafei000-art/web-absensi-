# 🗄️ SETUP DATABASE & PHPMYADMIN

Panduan lengkap setup database MySQL dan integrasi dengan aplikasi Web Absensi.

## 📋 Daftar Isi

1. [Requirement](#requirement)
2. [Setup Database](#setup-database)
3. [Konfigurasi API](#konfigurasi-api)
4. [Testing API](#testing-api)
5. [Troubleshooting](#troubleshooting)

---

## 🔧 Requirement

- **MySQL Server** (v5.7+)
- **Apache/Nginx** (untuk menjalankan PHP)
- **PHP** (v7.4+)
- **phpMyAdmin** (untuk management database)
- **Web Browser** (Chrome, Firefox, Edge, Safari)

### Instalasi di Windows/Mac/Linux

#### Windows:
- Download **XAMPP** dari [https://www.apachefriends.org/](https://www.apachefriends.org/)
- Install dan jalankan Apache + MySQL

#### Mac:
```bash
brew install mysql php apache2
```

#### Linux (Ubuntu):
```bash
sudo apt-get install mysql-server php apache2
sudo apt-get install phpmyadmin
```

---

## 💾 Setup Database

### Metode 1: Menggunakan phpMyAdmin (GUI - Recommended)

1. **Buka phpMyAdmin**
   - Akses: `http://localhost/phpmyadmin`
   - Login dengan username: `root`, password: kosong (default)

2. **Import Database Script**
   - Klik menu **"Import"** di phpMyAdmin
   - Pilih file `database.sql` dari folder project
   - Klik tombol **"Go"** untuk menjalankan script
   - Database `web_absensi` akan otomatis terbuat dengan semua tabel

3. **Verifikasi Database**
   - Di sebelah kiri, pilih database `web_absensi`
   - Lihat semua tabel yang telah terbuat:
     - `attendance` - Riwayat absensi
     - `users` - Data karyawan
     - `attendance_summary` - Ringkasan absensi
     - `permissions` - Permintaan izin
     - `audit_log` - Log aktivitas

### Metode 2: Menggunakan Command Line (Terminal)

```bash
# Masuk ke terminal MySQL
mysql -u root -p

# Jika diminta password, tekan ENTER (kosong)
# Kemudian jalankan script
source /path/to/database.sql;

# Atau bisa juga:
mysql -u root < database.sql

# Verifikasi database terbuat
SHOW DATABASES;
USE web_absensi;
SHOW TABLES;
```

### Metode 3: Manual Setup

Jika ingin membuat table secara manual:

1. Buka phpMyAdmin
2. Buat database baru: `web_absensi`
3. Copy-paste code SQL dari `database.sql` ke tab **"SQL"**
4. Jalankan query

---

## ⚙️ Konfigurasi API

### 1. Update File Konfigurasi

Edit file `api/config.php` sesuai dengan setup MySQL Anda:

```php
<?php
// Database Configuration
define('DB_HOST', 'localhost');      // Host database
define('DB_USER', 'root');           // Username MySQL
define('DB_PASSWORD', '');           // Password MySQL (kosong/blank)
define('DB_NAME', 'web_absensi');   // Nama database
define('DB_CHARSET', 'utf8mb4');    // Charset
?>
```

### 2. Struktur Folder

Pastikan struktur folder sudah benar:

```
web-absensi/
├── index.html              # Aplikasi scan wajah
├── riwayat.html            # Halaman riwayat absensi
├── styles.css
├── script.js
├── riwayat.css
├── riwayat.js
├── database.sql            # Script database
├── api/                    # Folder API
│   ├── config.php          # Konfigurasi database
│   ├── get_attendance.php  # GET data absensi
│   ├── save_attendance.php # POST/INSERT absensi
│   ├── update_attendance.php # UPDATE absensi
│   ├── delete_attendance.php # DELETE absensi
│   └── get_statistics.php  # GET statistik
└── README.md
```

### 3. Izin Folder (Linux/Mac)

```bash
# Beri izin read-write ke folder api
chmod 755 api/
chmod 644 api/*.php

# Jika ada folder uploads
chmod 777 uploads/ (opsional)
```

---

## 🧪 Testing API

### 1. Test Database Connection

Buka file `api/config.php` di browser:
```
http://localhost/web-absensi/api/config.php
```

Jika berhasil, akan melihat respons JSON.

### 2. Test GET Attendance API

```
http://localhost/web-absensi/api/get_attendance.php
```

Expected response:
```json
{
  "success": true,
  "message": "Data berhasil diambil",
  "data": [
    {
      "id": "ABS-1717963200",
      "nama": "John Doe",
      "email": "john.doe@company.com",
      ...
    }
  ],
  "total": 8,
  "count": 8
}
```

### 3. Test POST Save Attendance API

Gunakan Postman atau curl:

```bash
curl -X POST http://localhost/web-absensi/api/save_attendance.php \
  -H "Content-Type: application/json" \
  -d '{
    "nama": "Test User",
    "email": "test@company.com",
    "status": "Hadir",
    "lokasi": "Jakarta",
    "catatan": "Test absensi"
  }'
```

Expected response:
```json
{
  "success": true,
  "message": "Absensi berhasil disimpan",
  "data": {
    "id": "ABS-1717963204",
    "nama": "Test User",
    ...
  }
}
```

### 4. Test GET Statistics API

```
http://localhost/web-absensi/api/get_statistics.php
```

Atau dengan filter:
```
http://localhost/web-absensi/api/get_statistics.php?tanggal_awal=2024-06-01&tanggal_akhir=2024-06-30
```

---

## 🔗 Integrasi dengan Aplikasi Web

### Update script.js untuk Save Attendance

Edit bagian `script.js` untuk menambahkan code save ke database:

```javascript
async function saveAttendanceToDatabase() {
    try {
        // Ambil data dari form atau canvas
        const attendanceData = {
            nama: document.getElementById('userName').value,
            email: document.getElementById('userEmail').value,
            status: 'Hadir',
            foto: canvas.toDataURL('image/jpeg', 0.8), // Base64
            lokasi: 'Jakarta Pusat', // Atau dari geolocation
            latitude: null, // Dari geolocation
            longitude: null, // Dari geolocation
            catatan: 'Absensi melalui web app'
        };

        // Send ke API
        const response = await fetch('./api/save_attendance.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(attendanceData)
        });

        const result = await response.json();

        if (result.success) {
            console.log('✓ Absensi berhasil disimpan:', result.data);
            showSuccess('Absensi berhasil dicatat');
        } else {
            console.error('✗ Error:', result.message);
            showError(result.message);
        }
    } catch (error) {
        console.error('Error:', error);
        showError('Error: ' + error.message);
    }
}
```

### Tambahkan Tombol Save di index.html

```html
<button class="btn btn-success" onclick="saveAttendanceToDatabase()" id="saveBtn" disabled>
    💾 Simpan ke Database
</button>
```

---

## 📊 Manajemen Database di phpMyAdmin

### 1. Melihat Data Absensi

- Login ke phpMyAdmin
- Pilih database `web_absensi`
- Pilih tabel `attendance`
- Klik tab **"Browse"** untuk melihat data

### 2. Menambah Data Manual

- Pilih tabel `attendance`
- Klik **"Insert"**
- Isi form dengan data
- Klik **"Go"**

### 3. Mengedit Data

- Pilih tabel `attendance`
- Klik tombol **edit** (pensil) pada row yang ingin diedit
- Ubah data
- Klik **"Go"**

### 4. Menghapus Data

- Pilih row yang ingin dihapus
- Klik tombol **delete** (X)
- Konfirmasi hapus

### 5. Export Data

- Pilih tabel
- Klik **"Export"**
- Pilih format (CSV, Excel, PDF, dll)
- Klik **"Go"**

### 6. Backup Database

- Pilih database `web_absensi`
- Klik **"Export"**
- Pilih opsi:
  - Format: **"SQL"**
  - Pilih semua tabel
  - Klik **"Go"**
- File SQL akan di-download

---

## 🐛 Troubleshooting

### Error: Connection Refused

**Penyebab:** MySQL server tidak running

**Solusi:**
```bash
# Start MySQL service
# Windows: Start XAMPP > Click Start button for MySQL
# Linux: sudo service mysql start
# Mac: brew services start mysql

# Verify MySQL is running
mysql -u root -p
```

### Error: Access Denied for user 'root'

**Penyebab:** Password MySQL salah

**Solusi:**
1. Edit `api/config.php`
2. Ubah `DB_PASSWORD` sesuai password MySQL Anda
3. Atau reset password MySQL:

```bash
# Windows (XAMPP)
cd "C:\xampp\mysql\bin"
mysqld --skip-grant-tables

# Di terminal lain:
mysql -u root
FLUSH PRIVILEGES;
ALTER USER 'root'@'localhost' IDENTIFIED BY 'new_password';
```

### Error: Unknown Database 'web_absensi'

**Penyebab:** Database belum di-create

**Solusi:**
1. Import file `database.sql` melalui phpMyAdmin
2. Atau jalankan di terminal:
```bash
mysql -u root -p < database.sql
```

### API Returns Empty Data

**Penyebab:** Tidak ada data di database atau query error

**Solusi:**
1. Verifikasi database dan tabel sudah terbuat
2. Check error log di `api/error.log`
3. Test query langsung di phpMyAdmin:
```sql
SELECT * FROM attendance LIMIT 10;
```

### Foto Tidak Muncul

**Penyebab:** Base64 encoding error atau ukuran file terlalu besar

**Solusi:**
1. Kompres foto sebelum save:
```javascript
const imageData = canvas.toDataURL('image/jpeg', 0.7); // Kualitas 70%
```
2. Ubah ukuran maksimal di `api/save_attendance.php`:
```php
// Limit foto size to 2MB
if (strlen($foto) > 2097152) {
    throw new Exception('Ukuran foto terlalu besar');
}
```

### CORS Error saat Fetch

**Penyebab:** Cross-origin request diblokir

**Solusi:**
Pastikan di `api/config.php` sudah ada:
```php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
```

---

## 📈 Query Berguna

Beberapa query berguna untuk analisis data:

### Total Absensi per Status (Current Month)
```sql
SELECT status, COUNT(*) as total
FROM attendance
WHERE MONTH(tanggal) = MONTH(CURDATE())
GROUP BY status
ORDER BY total DESC;
```

### Kehadiran per Karyawan
```sql
SELECT 
    email,
    nama,
    COUNT(*) as total,
    SUM(CASE WHEN status = 'Hadir' THEN 1 ELSE 0 END) as hadir,
    ROUND((SUM(CASE WHEN status = 'Hadir' THEN 1 ELSE 0 END) / COUNT(*)) * 100, 2) as persentase
FROM attendance
GROUP BY email
ORDER BY persentase DESC;
```

### Absensi Harian
```sql
SELECT 
    tanggal,
    COUNT(*) as total,
    SUM(CASE WHEN status = 'Hadir' THEN 1 ELSE 0 END) as hadir,
    SUM(CASE WHEN status = 'Tidak Hadir' THEN 1 ELSE 0 END) as tidak_hadir
FROM attendance
GROUP BY tanggal
ORDER BY tanggal DESC;
```

### Karyawan Tidak Hadir Hari Ini
```sql
SELECT DISTINCT nama, email, status
FROM attendance
WHERE tanggal = CURDATE() 
  AND status != 'Hadir'
ORDER BY nama;
```

---

## 📞 Support & Resources

- [MySQL Documentation](https://dev.mysql.com/doc/)
- [phpMyAdmin Docs](https://docs.phpmyadmin.net/)
- [PHP MySQL Tutorial](https://www.w3schools.com/php/php_mysql_intro.asp)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/mysql+php)

---

**Last Updated:** June 2026

🎉 Database setup selesai! Aplikasi Anda sekarang siap terintegrasi dengan MySQL database.

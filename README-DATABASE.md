# 📱 Web Absensi - Aplikasi Scan Wajah dengan Database

Aplikasi web modern untuk deteksi wajah real-time dan manajemen absensi dengan MySQL database integration.

## ✨ Fitur Utama

### 1. **Scan Wajah Real-time** 📹
- Deteksi wajah menggunakan Face-API.js + TensorFlow.js
- Menampilkan kotak deteksi dengan landmark points
- Info usia, gender, ekspresi wajah real-time
- FPS counter untuk monitoring performa

### 2. **Riwayat Absensi** 📋
- Dashboard lengkap dengan filter pencarian
- Pagination untuk navigasi data
- Export ke CSV
- View & Edit data absensi
- Hapus record absensi

### 3. **Statistik & Laporan** 📊
- Grafik kehadiran harian
- Distribusi status absensi
- Laporan per periode
- Data statistik detail

### 4. **Database MySQL** 🗄️
- Penyimpanan data terstruktur
- phpMyAdmin integration
- Backup & restore support
- 6 tabel dengan relationships

---

## 📁 Struktur Project

```
web-absensi/
│
├── 📄 index.html              ← Aplikasi scan wajah utama
├── 📄 riwayat.html            ← Halaman riwayat absensi
├── 📄 styles.css              ← Stylesheet utama
├── 📄 riwayat.css             ← Stylesheet riwayat
├── 📄 script.js               ← Logic scan wajah
├── 📄 riwayat.js              ← Logic riwayat absensi
│
├── 📁 api/                    ← REST API Backend
│   ├── config.php             ← Database config
│   ├── get_attendance.php     ← GET /api/get_attendance
│   ├── save_attendance.php    ← POST /api/save_attendance
│   ├── update_attendance.php  ← POST /api/update_attendance
│   ├── delete_attendance.php  ← POST /api/delete_attendance
│   └── get_statistics.php     ← GET /api/get_statistics
│
├── 📄 database.sql            ← Script setup database
├── 📄 DOKUMENTASI.md          ← Dokumentasi aplikasi
├── 📄 SETUP_DATABASE.md       ← Panduan setup database
└── 📄 README.md               ← File ini
```

---

## 🚀 Quick Start

### 1. **Clone/Download Project**
```bash
# Jika menggunakan git
git clone <repository-url>
cd web-absensi

# Atau download ZIP dan extract
```

### 2. **Setup Database MySQL**

**Opsi A: phpMyAdmin (Recommended)**
- Buka: `http://localhost/phpmyadmin`
- Menu → Import
- Pilih file `database.sql`
- Klik Go

**Opsi B: Terminal**
```bash
mysql -u root -p < database.sql
```

### 3. **Update Konfigurasi Database**

Edit `api/config.php`:
```php
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASSWORD', ''); // Ganti sesuai password Anda
define('DB_NAME', 'web_absensi');
```

### 4. **Jalankan Aplikasi**

**Dengan XAMPP:**
- Copy folder `web-absensi` ke `htdocs/`
- Akses: `http://localhost/web-absensi/`

**Dengan Server PHP Local:**
```bash
cd web-absensi
php -S localhost:8000
# Akses: http://localhost:8000
```

### 5. **Mulai Scan Wajah**
- Buka `http://localhost/web-absensi/`
- Klik "Mulai Kamera"
- Izinkan akses webcam
- Wajah akan terdeteksi otomatis

### 6. **Lihat Riwayat Absensi**
- Buka `http://localhost/web-absensi/riwayat.html`
- Semua data absensi akan dimuat dari database

---

## 📊 Database Schema

### Tabel Utama

#### 1. `attendance` (Riwayat Absensi)
```sql
id VARCHAR(20)              -- ID unik absensi
nama VARCHAR(100)           -- Nama karyawan
email VARCHAR(100)          -- Email karyawan
tanggal DATE                -- Tanggal absensi
waktu_masuk TIME            -- Waktu check-in
waktu_keluar TIME           -- Waktu check-out
foto LONGBLOB               -- Foto wajah (binary)
latitude DECIMAL(10, 8)     -- GPS latitude
longitude DECIMAL(11, 8)    -- GPS longitude
lokasi VARCHAR(255)         -- Lokasi absensi
status VARCHAR(50)          -- Hadir/Tidak Hadir/Izin/Sakit
catatan TEXT                -- Catatan tambahan
created_at TIMESTAMP        -- Waktu dibuat
updated_at TIMESTAMP        -- Waktu diupdate
```

#### 2. `users` (Data Karyawan)
```sql
id INT                      -- ID unik
nama VARCHAR(100)           -- Nama karyawan
email VARCHAR(100)          -- Email (unique)
no_hp VARCHAR(15)           -- Nomor HP
departemen VARCHAR(50)      -- Departemen
jabatan VARCHAR(50)         -- Jabatan
foto VARCHAR(255)           -- Path foto profile
status VARCHAR(20)          -- Aktif/Nonaktif
created_at TIMESTAMP
updated_at TIMESTAMP
```

#### 3. Tabel Lainnya
- `attendance_summary` - Ringkasan absensi harian
- `permissions` - Permintaan izin
- `audit_log` - Log aktivitas

---

## 🔌 API Endpoints

### GET Endpoints

#### 1. **Get All Attendance**
```
GET /api/get_attendance.php
```

Query Parameters:
```
?email=john@company.com          -- Filter by email
&tanggal=2024-06-10              -- Filter by date
&status=Hadir                     -- Filter by status
&limit=50                         -- Records per page
&offset=0                         -- Pagination offset
```

Response:
```json
{
  "success": true,
  "message": "Data berhasil diambil",
  "data": [
    {
      "id": "ABS-1717963200",
      "nama": "John Doe",
      "email": "john@company.com",
      "tanggal": "2024-06-10",
      "waktu_masuk": "08:15:00",
      "waktu_keluar": null,
      "foto": "data:image/jpeg;base64,...",
      "lokasi": "Jakarta",
      "status": "Hadir",
      "catatan": null
    }
  ],
  "total": 100,
  "count": 10
}
```

#### 2. **Get Statistics**
```
GET /api/get_statistics.php
```

Query Parameters:
```
?tanggal_awal=2024-06-01
&tanggal_akhir=2024-06-30
&email=john@company.com
```

Response:
```json
{
  "success": true,
  "message": "Statistik berhasil diambil",
  "summary": {
    "total": 20,
    "hadir": 18,
    "tidak_hadir": 1,
    "izin": 1,
    "sakit": 0,
    "persentase_hadir": 90.00
  },
  "daily_stats": [...],
  "employee_stats": [...]
}
```

### POST Endpoints

#### 1. **Save New Attendance**
```
POST /api/save_attendance.php
Content-Type: application/json
```

Request Body:
```json
{
  "nama": "John Doe",
  "email": "john@company.com",
  "status": "Hadir",
  "foto": "data:image/jpeg;base64,...",
  "lokasi": "Jakarta Pusat",
  "latitude": -6.2088,
  "longitude": 106.8456,
  "catatan": "Absensi melalui web app"
}
```

Response:
```json
{
  "success": true,
  "message": "Absensi berhasil disimpan",
  "data": {
    "id": "ABS-1717963200",
    "nama": "John Doe",
    "email": "john@company.com",
    "tanggal": "2024-06-10",
    "waktu_masuk": "08:15:00",
    "status": "Hadir"
  }
}
```

#### 2. **Update Attendance**
```
POST /api/update_attendance.php
Content-Type: application/json
```

Request Body:
```json
{
  "id": "ABS-1717963200",
  "status": "Tidak Hadir",
  "catatan": "Sakit",
  "waktu_keluar": "17:00:00"
}
```

#### 3. **Delete Attendance**
```
POST /api/delete_attendance.php
Content-Type: application/json
```

Request Body:
```json
{
  "id": "ABS-1717963200"
}
```

---

## 🛠️ Teknologi Stack

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Modern styling dengan flexbox/grid
- **JavaScript ES6+** - Core logic
- **Face-API.js** - Face detection library
- **TensorFlow.js** - ML framework
- **Chart.js** - Data visualization

### Backend
- **PHP 7.4+** - Server-side logic
- **MySQL 5.7+** - Database
- **Apache/Nginx** - Web server

### Tools
- **phpMyAdmin** - Database management
- **VS Code** - Development editor
- **Postman** - API testing

---

## 📱 Browser Support

| Browser | Version | Support |
|---------|---------|---------|
| Chrome  | Latest  | ✅ Full |
| Edge    | Latest  | ✅ Full |
| Firefox | Latest  | ✅ Full |
| Safari  | 15+     | ✅ Full |
| Opera   | Latest  | ✅ Full |
| IE 11   | -       | ❌ No   |

---

## 🔒 Security Best Practices

✅ **Implemented:**
- Input sanitization di semua API endpoints
- SQL prepared statements untuk prevent SQL injection
- CORS headers untuk cross-origin requests
- Error logging untuk debugging

⚠️ **Recommended untuk Production:**
- Gunakan HTTPS (SSL Certificate)
- Tambahkan authentication (JWT/OAuth)
- Rate limiting pada API endpoints
- Add password hashing untuk users table
- Enable database backup automation
- Monitor error logs secara berkala

---

## 📝 Dokumentasi Lengkap

Untuk informasi lebih detail, baca:
- **[DOKUMENTASI.md](DOKUMENTASI.md)** - Dokumentasi aplikasi scan wajah
- **[SETUP_DATABASE.md](SETUP_DATABASE.md)** - Panduan setup database MySQL

---

## 🐛 Troubleshooting

### Masalah Umum

**Q: Webcam tidak terdeteksi**
- A: Cek browser permissions, gunakan HTTPS/localhost, coba browser lain

**Q: Wajah tidak terdeteksi**
- A: Pastikan pencahayaan cukup, hadapkan wajah ke kamera, tunggu model load

**Q: Database connection error**
- A: Cek MySQL running, verifikasi credentials di `api/config.php`

**Q: API returns empty data**
- A: Import database.sql terlebih dahulu, cek error log di `api/error.log`

Untuk troubleshooting lebih detail, lihat **[SETUP_DATABASE.md](SETUP_DATABASE.md#-troubleshooting)**

---

## 📞 Dukungan

- 📧 Email: support@web-absensi.local
- 💬 Issues: Buka issue di GitHub
- 📚 Wiki: Lihat dokumentasi lengkap

---

## 📄 License

MIT License - Bebas digunakan untuk proyek pribadi dan komersial

---

## 👥 Contributors

- **Initial Release** - Tim Development

---

## 📊 Stats

- ⭐ Star jika berguna
- 🍴 Fork untuk kontribusi
- 🐛 Report issues untuk improvement

---

## 🎯 Roadmap

- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] Multi-location support
- [ ] Geofencing attendance
- [ ] Biometric integration
- [ ] Automated reporting
- [ ] API documentation (Swagger)

---

**Dibuat dengan ❤️ untuk Web Absensi**

Last Updated: June 2026 | Version: 1.0.0

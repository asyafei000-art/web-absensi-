# 🔌 API Reference - Web Absensi

Dokumentasi lengkap REST API endpoints untuk aplikasi Web Absensi.

**Base URL:** `http://localhost/web-absensi/api/`

**Timezone:** Asia/Jakarta

---

## 📋 Daftar Endpoints

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | [/get_attendance.php](#get-get_attendancephp) | Ambil data absensi |
| POST | [/save_attendance.php](#post-save_attendancephp) | Simpan absensi baru |
| POST | [/update_attendance.php](#post-update_attendancephp) | Update data absensi |
| POST | [/delete_attendance.php](#post-delete_attendancephp) | Hapus data absensi |
| GET | [/get_statistics.php](#get-get_statisticsphp) | Ambil statistik absensi |

---

## GET /get_attendance.php

Mengambil data riwayat absensi dari database dengan filter opsional.

### Request

```
GET /api/get_attendance.php?email=john@company.com&tanggal=2024-06-10
```

### Query Parameters

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| email | string | No | Filter by employee email | `john@company.com` |
| tanggal | date | No | Filter by date (YYYY-MM-DD) | `2024-06-10` |
| status | string | No | Filter by status | `Hadir` |
| limit | integer | No | Max records returned (default: 1000) | `50` |
| offset | integer | No | Pagination offset (default: 0) | `0` |

### Status Values

- `Hadir` - Present
- `Tidak Hadir` - Absent
- `Izin` - Permission/Leave
- `Sakit` - Sick Leave

### Response (Success)

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
      "waktu_keluar": "17:30:00",
      "foto": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
      "latitude": "-6.2088",
      "longitude": "106.8456",
      "lokasi": "Jakarta Pusat",
      "status": "Hadir",
      "catatan": null,
      "created_at": "2024-06-10 08:15:30",
      "updated_at": "2024-06-10 17:30:45"
    }
  ],
  "total": 100,
  "count": 1
}
```

### Response (Error)

```json
{
  "success": false,
  "message": "Error message here"
}
```

### Examples

#### Get all attendance records
```bash
curl "http://localhost/web-absensi/api/get_attendance.php"
```

#### Get by email
```bash
curl "http://localhost/web-absensi/api/get_attendance.php?email=john@company.com"
```

#### Get by date and status
```bash
curl "http://localhost/web-absensi/api/get_attendance.php?tanggal=2024-06-10&status=Hadir"
```

#### Get with pagination
```bash
curl "http://localhost/web-absensi/api/get_attendance.php?limit=10&offset=0"
```

---

## POST /save_attendance.php

Menyimpan record absensi baru ke database.

### Request

```
POST /api/save_attendance.php
Content-Type: application/json
```

### Request Body

```json
{
  "nama": "John Doe",
  "email": "john@company.com",
  "status": "Hadir",
  "foto": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
  "lokasi": "Jakarta Pusat",
  "latitude": -6.2088,
  "longitude": 106.8456,
  "catatan": "Absensi melalui web app"
}
```

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| nama | string | Yes | Employee name |
| email | string | Yes | Employee email |
| status | string | Yes | Attendance status |
| foto | string | No | Photo (base64 encoded) |
| lokasi | string | No | Location name |
| latitude | number | No | GPS latitude |
| longitude | number | No | GPS longitude |
| catatan | string | No | Additional notes |

### Response (Success)

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
    "status": "Hadir",
    "lokasi": "Jakarta Pusat"
  }
}
```

### Response (Error)

```json
{
  "success": false,
  "message": "Nama, email, dan status wajib diisi"
}
```

### Examples

#### Simple save
```bash
curl -X POST http://localhost/web-absensi/api/save_attendance.php \
  -H "Content-Type: application/json" \
  -d '{
    "nama": "John Doe",
    "email": "john@company.com",
    "status": "Hadir"
  }'
```

#### Save with all fields
```bash
curl -X POST http://localhost/web-absensi/api/save_attendance.php \
  -H "Content-Type: application/json" \
  -d '{
    "nama": "John Doe",
    "email": "john@company.com",
    "status": "Hadir",
    "foto": "data:image/jpeg;base64,...",
    "lokasi": "Jakarta Pusat",
    "latitude": -6.2088,
    "longitude": 106.8456,
    "catatan": "Tepat waktu"
  }'
```

#### JavaScript Example
```javascript
async function saveAttendance() {
  const response = await fetch('api/save_attendance.php', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      nama: 'John Doe',
      email: 'john@company.com',
      status: 'Hadir',
      foto: canvas.toDataURL(),
      lokasi: 'Jakarta'
    })
  });
  
  const data = await response.json();
  console.log(data);
}
```

---

## POST /update_attendance.php

Memperbarui data absensi yang sudah ada.

### Request

```
POST /api/update_attendance.php
Content-Type: application/json
```

### Request Body

```json
{
  "id": "ABS-1717963200",
  "status": "Tidak Hadir",
  "catatan": "Sakit"
}
```

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | Attendance record ID |
| nama | string | No | Employee name |
| email | string | No | Employee email |
| status | string | No | New status |
| catatan | string | No | Notes |
| waktu_keluar | time | No | Check-out time (HH:MM:SS) |

### Response (Success)

```json
{
  "success": true,
  "message": "Absensi berhasil diperbarui",
  "id": "ABS-1717963200"
}
```

### Response (Error)

```json
{
  "success": false,
  "message": "ID absensi tidak ditemukan"
}
```

### Examples

#### Update status
```bash
curl -X POST http://localhost/web-absensi/api/update_attendance.php \
  -H "Content-Type: application/json" \
  -d '{
    "id": "ABS-1717963200",
    "status": "Sakit"
  }'
```

#### Update multiple fields
```bash
curl -X POST http://localhost/web-absensi/api/update_attendance.php \
  -H "Content-Type: application/json" \
  -d '{
    "id": "ABS-1717963200",
    "status": "Tidak Hadir",
    "catatan": "Sakit",
    "waktu_keluar": "17:00:00"
  }'
```

---

## POST /delete_attendance.php

Menghapus record absensi dari database.

### Request

```
POST /api/delete_attendance.php
Content-Type: application/json
```

### Request Body

```json
{
  "id": "ABS-1717963200"
}
```

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | Attendance record ID |

### Response (Success)

```json
{
  "success": true,
  "message": "Absensi berhasil dihapus",
  "id": "ABS-1717963200"
}
```

### Response (Error)

```json
{
  "success": false,
  "message": "ID absensi tidak ditemukan"
}
```

### Examples

```bash
curl -X POST http://localhost/web-absensi/api/delete_attendance.php \
  -H "Content-Type: application/json" \
  -d '{"id": "ABS-1717963200"}'
```

---

## GET /get_statistics.php

Mengambil statistik dan laporan absensi.

### Request

```
GET /api/get_statistics.php?tanggal_awal=2024-06-01&tanggal_akhir=2024-06-30
```

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| tanggal_awal | date | No | Start date (YYYY-MM-DD) |
| tanggal_akhir | date | No | End date (YYYY-MM-DD) |
| email | string | No | Filter by employee email |

### Response (Success)

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
  "daily_stats": [
    {
      "tanggal": "2024-06-10",
      "total": 4,
      "hadir": 4,
      "tidak_hadir": 0,
      "izin": 0,
      "sakit": 0
    }
  ],
  "employee_stats": [
    {
      "email": "john@company.com",
      "total": 20,
      "hadir": 18,
      "tidak_hadir": 1,
      "izin": 1,
      "sakit": 0,
      "persentase_hadir": 90.00
    }
  ]
}
```

### Examples

#### Get overall statistics
```bash
curl "http://localhost/web-absensi/api/get_statistics.php"
```

#### Get statistics for a period
```bash
curl "http://localhost/web-absensi/api/get_statistics.php?tanggal_awal=2024-06-01&tanggal_akhir=2024-06-30"
```

#### Get for specific employee
```bash
curl "http://localhost/web-absensi/api/get_statistics.php?email=john@company.com"
```

---

## 🔐 Error Codes

| Code | Status | Meaning |
|------|--------|---------|
| 200 | OK | Success |
| 400 | Bad Request | Invalid input data |
| 500 | Server Error | Database or server error |

---

## 💡 Best Practices

### 1. Request Format
- Always use `Content-Type: application/json`
- Always include `User-Agent` header
- For GET requests, use query parameters

### 2. Error Handling
```javascript
try {
  const response = await fetch('api/get_attendance.php');
  const data = await response.json();
  
  if (!data.success) {
    console.error('API Error:', data.message);
    return;
  }
  
  console.log('Success:', data.data);
} catch (error) {
  console.error('Network Error:', error);
}
```

### 3. Base64 Photo Handling
```javascript
// Compress before sending
const canvas = document.getElementById('canvas');
const photo = canvas.toDataURL('image/jpeg', 0.8); // 80% quality

// Size check (max 2MB)
if (photo.length > 2097152) {
  console.warn('Photo too large, compressing...');
  const compressed = canvas.toDataURL('image/jpeg', 0.5); // Lower quality
  // Use compressed
}
```

### 4. Pagination
```javascript
// Get 10 records per page
const page = 1;
const limit = 10;
const offset = (page - 1) * limit;

const url = `api/get_attendance.php?limit=${limit}&offset=${offset}`;
```

---

## 🧪 Testing with cURL

### cURL Installation
```bash
# Windows: Already included in modern Windows 10+
# macOS: brew install curl
# Linux: sudo apt-get install curl
```

### Test GET Request
```bash
curl -v "http://localhost/web-absensi/api/get_attendance.php"
```

### Test POST Request
```bash
curl -X POST "http://localhost/web-absensi/api/save_attendance.php" \
  -H "Content-Type: application/json" \
  -d @- << EOF
{
  "nama": "Test User",
  "email": "test@company.com",
  "status": "Hadir"
}
EOF
```

### Test with File
```bash
curl -X POST "http://localhost/web-absensi/api/save_attendance.php" \
  -H "Content-Type: application/json" \
  -d @request.json
```

---

## 📊 Response Time

Typical response times:
- GET /get_attendance.php: 50-150ms
- POST /save_attendance.php: 100-250ms
- GET /get_statistics.php: 200-500ms

---

## 🔗 Related Documentation

- [Database Setup Guide](SETUP_DATABASE.md)
- [Full Documentation](DOKUMENTASI.md)
- [README](README-DATABASE.md)

---

**Last Updated:** June 2026 | API Version: 1.0

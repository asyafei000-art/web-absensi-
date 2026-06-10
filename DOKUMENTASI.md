
# 📹 Aplikasi Web Scan Wajah

Aplikasi web modern untuk mendeteksi wajah secara real-time melalui webcam dengan teknologi machine learning.

## ✨ Fitur

### Fitur Utama
- ✅ **Deteksi Wajah Real-time** - Mendeteksi wajah menggunakan Face-API.js dengan TensorFlow.js
- ✅ **Kotak Deteksi Dinamis** - Menampilkan kotak dengan landmark points di sekitar wajah
- ✅ **Informasi Wajah** - Menampilkan usia, gender, dan ekspresi wajah
- ✅ **Tangkap Foto** - Simpan foto wajah yang terdeteksi
- ✅ **FPS Counter** - Menampilkan performa aplikasi secara real-time
- ✅ **Responsif** - Desain mobile-first yang bekerja di semua ukuran layar
- ✅ **Dark Mode** - Dukungan tema gelap otomatis
- ✅ **Keyboard Shortcuts** - Space untuk capture, ESC untuk tutup

### Informasi yang Ditampilkan
- Jumlah wajah terdeteksi
- Kualitas deteksi (confidence score)
- Posisi wajah (koordinat X, Y)
- Ukuran wajah terdeteksi
- Perkiraan usia dan gender
- Ekspresi wajah (happy, sad, angry, dll)
- FPS (frame per second) untuk performa

## 🚀 Cara Menggunakan

### 1. Akses Aplikasi
- Buka file `index.html` di browser modern
- Atau upload ke web server dan akses melalui URL

### 2. Mulai Mendeteksi Wajah
1. Klik tombol **"🎬 Mulai Kamera"** untuk mengaktifkan webcam
2. Browser akan meminta izin akses kamera - klik **"Izinkan"**
3. Aplikasi otomatis mendeteksi wajah Anda
4. Kotak hijau akan muncul di sekitar wajah Anda

### 3. Tangkap Foto
- Klik tombol **"📸 Tangkap Foto"** untuk menyimpan foto wajah
- Atau tekan **SPACE** untuk cara cepat
- Foto akan ditampilkan di modal popup

### 4. Hentikan & Reset
- Klik **"⏹️ Hentikan Kamera"** untuk menutup webcam
- Klik **"🔄 Reset"** untuk reset semua informasi

## 📁 Struktur Folder

```
web-absensi/
├── index.html          # Halaman utama (struktur HTML)
├── styles.css          # Stylesheet (desain modern)
├── script.js           # JavaScript (logika deteksi)
├── backend.gs          # Google Apps Script (opsional, untuk backend)
└── README.md           # Dokumentasi ini
```

## 💻 Teknologi yang Digunakan

### Frontend
- **HTML5** - Struktur halaman dan video element
- **CSS3** - Styling modern dengan gradients dan animations
- **JavaScript (ES6+)** - Logika aplikasi
- **Face-API.js** - Library deteksi wajah berbasis TensorFlow.js
- **TensorFlow.js** - Machine learning framework

### Backend (Opsional)
- **Google Apps Script** - Integrasi dengan Google Sheets
- **Google Sheets** - Database absensi

## 🔧 Instalasi & Setup

### Requirement
- Browser modern yang mendukung:
  - WebRTC (getUserMedia API)
  - Canvas API
  - Web Workers (untuk TensorFlow)
- Koneksi internet (untuk load model ML)

### Instalasi Lokal
1. Download atau clone repository
2. Buka `index.html` di browser (langsung atau melalui web server)
3. Izinkan akses kamera saat diminta

### Instalasi di Web Server
1. Upload semua file ke web server:
   ```
   index.html
   styles.css
   script.js
   backend.gs (opsional)
   ```
2. Akses melalui URL: `https://your-domain.com/index.html`

## 📊 Integrasi dengan Google Sheets (Backend)

### Setup Google Apps Script
1. Buat Google Sheet baru
2. Buka **Extensions > Apps Script**
3. Copy paste kode dari `backend.gs` ke editor
4. Ganti `SPREADSHEET_ID` dengan ID Sheet Anda:
   ```javascript
   const SPREADSHEET_ID = 'your-sheet-id-here';
   ```
5. Jalankan fungsi `testGoogleAppsScript()` untuk test
6. Deploy sebagai Web App:
   - Klik **Deploy > New Deployment**
   - Type: **Web app**
   - Execute as: Pilih email Anda
   - Who has access: **Anyone**
   - Copy URL deployment ID

### Integrasi di Frontend
Tambahkan kode ini di `script.js` setelah capture foto:
```javascript
const GAS_URL = 'https://script.google.com/macros/d/YOUR_DEPLOYMENT_ID/usercalc';

async function sendToGoogleSheets(data) {
    try {
        const response = await fetch(GAS_URL, {
            method: 'POST',
            body: JSON.stringify({
                nama: 'Nama Pengguna',
                email: 'user@example.com',
                foto: data.foto,
                latitude: data.latitude,
                longitude: data.longitude,
                lokasi: 'Lokasi',
                catatan: 'Absensi web app'
            })
        });
        const result = await response.json();
        console.log('Absensi berhasil disimpan:', result);
    } catch (error) {
        console.error('Error:', error);
    }
}
```

## 🎨 Kustomisasi

### Mengubah Warna
Edit file `styles.css`, bagian `:root`:
```css
:root {
    --primary-color: #3b82f6;      /* Biru */
    --secondary-color: #10b981;    /* Hijau */
    --danger-color: #ef4444;       /* Merah */
    /* ... */
}
```

### Mengubah Ukuran Video
Edit di `index.html`:
```javascript
video: {
    width: { ideal: 1280 },        // Ubah width
    height: { ideal: 720 },        // Ubah height
}
```

### Mengubah Model Deteksi
Edit URL model di `script.js`:
```javascript
const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/';
```

## 🐛 Troubleshooting

### Kamera Tidak Bisa Diakses
- ✅ Pastikan browser memiliki izin akses kamera
- ✅ Periksa HTTPS (kamera hanya bekerja di HTTPS atau localhost)
- ✅ Coba browser lain (Chrome, Firefox, Safari)
- ✅ Restart browser dan coba lagi

### Wajah Tidak Terdeteksi
- ✅ Pastikan pencahayaan cukup terang
- ✅ Hadapkan wajah langsung ke kamera
- ✅ Pastikan wajah tidak terlalu jauh dari kamera
- ✅ Tunggu beberapa detik untuk model load
- ✅ Refresh halaman

### Model Gagal Load
- ✅ Periksa koneksi internet
- ✅ Coba refresh halaman
- ✅ Buka console (F12) untuk melihat error detail
- ✅ Gunakan CDN alternatif jika CDN utama tidak tersedia

### Performance Lambat
- ✅ Tutup tab lain yang heavy
- ✅ Kurangi resolusi video
- ✅ Gunakan browser dengan WebGL support (Chrome, Edge)
- ✅ Periksa CPU usage

## 📱 Browser Compatibility

| Browser | Support | Catatan |
|---------|---------|---------|
| Chrome | ✅ | Recommended, full support |
| Edge | ✅ | Full support |
| Firefox | ✅ | Full support |
| Safari | ✅ | iOS 15+, macOS 12+ |
| Opera | ✅ | Full support |
| IE 11 | ❌ | Tidak didukung |

## 🔒 Keamanan & Privacy

- 🛡️ **Data Lokal** - Semua data pemrosesan terjadi di browser Anda
- 🛡️ **Tidak Ada Tracking** - Tidak ada cookie atau tracking
- 🛡️ **Webcam Privacy** - Akses webcam hanya saat tombol ditekan
- 🛡️ **HTTPS** - Gunakan HTTPS di production untuk keamanan
- 🛡️ **Google Sheets** - Data hanya disimpan jika Anda mengirimnya

## ⚡ Performance

- **Model Load Time**: 2-5 detik (first time)
- **Detection Speed**: 20-30 FPS (tergantung device)
- **Model Size**: ~2MB total
- **Memory Usage**: 100-300MB (tergantuk device)

## 🚀 Deployment

### Deploy ke Vercel
1. Push ke GitHub
2. Hubungkan ke Vercel
3. Deploy dengan satu klik

### Deploy ke Netlify
```bash
netlify deploy --prod
```

### Deploy ke GitHub Pages
```bash
git add .
git commit -m "Deploy web absensi"
git push
```

## 📝 License

MIT License - Bebas digunakan untuk proyek pribadi dan komersial

## 🤝 Kontribusi

Pull requests welcome! Untuk perubahan besar, silakan buka issue terlebih dahulu.

## 📧 Support

Untuk bantuan atau pertanyaan, silakan:
- Buka issue di GitHub
- Email: support@example.com
- Chat: Hubungi melalui website

## 📚 Resources

- [Face-API.js Documentation](https://github.com/vladmandic/face-api)
- [TensorFlow.js](https://www.tensorflow.org/js)
- [MDN WebRTC API](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API)
- [Google Apps Script Reference](https://developers.google.com/apps-script)

---

**Dibuat dengan ❤️ untuk Web Absensi**

Terakhir diupdate: Juni 2026

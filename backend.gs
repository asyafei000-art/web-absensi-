/**
 * Web Absensi - Google Apps Script Backend
 * 
 * Script ini menangani:
 * - Penyimpanan data absensi ke Google Sheets
 * - Pengambilan data absensi
 * - Integrasi dengan aplikasi web
 */

// ============================================
// KONFIGURASI
// ============================================
const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID'; // Ganti dengan ID Sheets Anda
const SHEET_NAME = 'Absensi';
const TIMEZONE = 'Asia/Jakarta';

// ============================================
// INISIALISASI SHEET
// ============================================
function initializeSheet() {
    try {
        const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
        let sheet = ss.getSheetByName(SHEET_NAME);
        
        if (!sheet) {
            sheet = ss.addSheet(SHEET_NAME);
            createHeaders(sheet);
        }
        
        return sheet;
    } catch (error) {
        Logger.log('Error initializing sheet: ' + error);
        throw new Error('Gagal inisialisasi sheet');
    }
}

// ============================================
// BUAT HEADER SHEET
// ============================================
function createHeaders(sheet) {
    const headers = [
        'ID',
        'Nama',
        'Email',
        'Tanggal',
        'Waktu',
        'Foto Base64',
        'Latitude',
        'Longitude',
        'Lokasi',
        'Status',
        'Catatan'
    ];
    
    sheet.appendRow(headers);
    
    // Format header
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setBackground('#667eea');
    headerRange.setFontColor('white');
    headerRange.setFontWeight('bold');
}

// ============================================
// SIMPAN ABSENSI
// ============================================
function doPost(e) {
    try {
        const data = JSON.parse(e.postData.contents);
        
        // Validasi data
        if (!data.nama || !data.email) {
            return ContentService.createTextOutput(
                JSON.stringify({ 
                    success: false, 
                    message: 'Nama dan email wajib diisi' 
                })
            ).setMimeType(ContentService.MimeType.JSON);
        }

        // Inisialisasi sheet
        const sheet = initializeSheet();
        
        // Generate ID
        const id = 'ABS-' + new Date().getTime();
        
        // Ambil waktu saat ini
        const now = new Date();
        const tanggal = Utilities.formatDate(now, TIMEZONE, 'yyyy-MM-dd');
        const waktu = Utilities.formatDate(now, TIMEZONE, 'HH:mm:ss');
        
        // Ambil lokasi jika ada
        const latitude = data.latitude || '-';
        const longitude = data.longitude || '-';
        const lokasi = data.lokasi || 'Unknown';
        
        // Simpan baris baru
        sheet.appendRow([
            id,
            data.nama,
            data.email,
            tanggal,
            waktu,
            data.foto || '', // Base64 foto
            latitude,
            longitude,
            lokasi,
            'Hadir', // Status
            data.catatan || ''
        ]);
        
        // Response sukses
        return ContentService.createTextOutput(
            JSON.stringify({ 
                success: true, 
                message: 'Absensi berhasil disimpan',
                id: id,
                timestamp: new Date().toISOString()
            })
        ).setMimeType(ContentService.MimeType.JSON);
        
    } catch (error) {
        Logger.log('Error in doPost: ' + error);
        return ContentService.createTextOutput(
            JSON.stringify({ 
                success: false, 
                message: 'Error: ' + error.toString()
            })
        ).setMimeType(ContentService.MimeType.JSON);
    }
}

// ============================================
// AMBIL DATA ABSENSI
// ============================================
function getAttendanceData(email) {
    try {
        const sheet = initializeSheet();
        const data = sheet.getDataRange().getValues();
        const result = [];
        
        // Skip header row
        for (let i = 1; i < data.length; i++) {
            if (data[i][2] === email) { // Email di kolom 3 (index 2)
                result.push({
                    id: data[i][0],
                    nama: data[i][1],
                    email: data[i][2],
                    tanggal: data[i][3],
                    waktu: data[i][4],
                    lokasi: data[i][8],
                    status: data[i][9],
                    catatan: data[i][10]
                });
            }
        }
        
        return result;
    } catch (error) {
        Logger.log('Error getting attendance: ' + error);
        return [];
    }
}

// ============================================
// AMBIL ABSENSI HARI INI
// ============================================
function getTodayAttendance() {
    try {
        const sheet = initializeSheet();
        const data = sheet.getDataRange().getValues();
        const today = Utilities.formatDate(new Date(), TIMEZONE, 'yyyy-MM-dd');
        const result = [];
        
        // Skip header row
        for (let i = 1; i < data.length; i++) {
            if (data[i][3] === today) { // Tanggal di kolom 4 (index 3)
                result.push({
                    id: data[i][0],
                    nama: data[i][1],
                    email: data[i][2],
                    waktu: data[i][4],
                    lokasi: data[i][8],
                    status: data[i][9]
                });
            }
        }
        
        return result;
    } catch (error) {
        Logger.log('Error getting today attendance: ' + error);
        return [];
    }
}

// ============================================
// UPDATE STATUS ABSENSI
// ============================================
function updateAttendanceStatus(id, status) {
    try {
        const sheet = initializeSheet();
        const data = sheet.getDataRange().getValues();
        
        for (let i = 1; i < data.length; i++) {
            if (data[i][0] === id) { // ID di kolom 1 (index 0)
                sheet.getRange(i + 1, 10).setValue(status); // Status di kolom 10
                return { success: true, message: 'Status berhasil diupdate' };
            }
        }
        
        return { success: false, message: 'ID tidak ditemukan' };
    } catch (error) {
        Logger.log('Error updating status: ' + error);
        return { success: false, message: 'Error: ' + error.toString() };
    }
}

// ============================================
// HAPUS ABSENSI
// ============================================
function deleteAttendance(id) {
    try {
        const sheet = initializeSheet();
        const data = sheet.getDataRange().getValues();
        
        for (let i = 1; i < data.length; i++) {
            if (data[i][0] === id) { // ID di kolom 1 (index 0)
                sheet.deleteRow(i + 1);
                return { success: true, message: 'Data berhasil dihapus' };
            }
        }
        
        return { success: false, message: 'ID tidak ditemukan' };
    } catch (error) {
        Logger.log('Error deleting attendance: ' + error);
        return { success: false, message: 'Error: ' + error.toString() };
    }
}

// ============================================
// STATISTIK ABSENSI
// ============================================
function getAttendanceStats() {
    try {
        const sheet = initializeSheet();
        const data = sheet.getDataRange().getValues();
        const today = Utilities.formatDate(new Date(), TIMEZONE, 'yyyy-MM-dd');
        
        let totalHadir = 0;
        let totalTidakHadir = 0;
        let totalHariIni = 0;
        
        for (let i = 1; i < data.length; i++) {
            if (data[i][9] === 'Hadir') totalHadir++;
            if (data[i][9] === 'Tidak Hadir') totalTidakHadir++;
            if (data[i][3] === today) totalHariIni++;
        }
        
        return {
            totalHadir: totalHadir,
            totalTidakHadir: totalTidakHadir,
            totalHariIni: totalHariIni,
            totalKeseluruhan: data.length - 1 // Exclude header
        };
    } catch (error) {
        Logger.log('Error getting stats: ' + error);
        return null;
    }
}

// ============================================
// TEST FUNCTION
// ============================================
function testGoogleAppsScript() {
    try {
        Logger.log('Testing Google Apps Script...');
        
        // Test inisialisasi
        initializeSheet();
        Logger.log('✓ Sheet initialized');
        
        // Test ambil statistik
        const stats = getAttendanceStats();
        Logger.log('✓ Stats retrieved: ' + JSON.stringify(stats));
        
        // Test ambil absensi hari ini
        const today = getTodayAttendance();
        Logger.log('✓ Today attendance: ' + JSON.stringify(today));
        
        Logger.log('✓ All tests passed!');
    } catch (error) {
        Logger.log('✗ Error: ' + error);
    }
}

// ============================================
// DO GET - untuk testing
// ============================================
function doGet(e) {
    try {
        const action = e.parameter.action;
        
        if (action === 'today') {
            const data = getTodayAttendance();
            return ContentService.createTextOutput(JSON.stringify(data))
                .setMimeType(ContentService.MimeType.JSON);
        }
        
        if (action === 'stats') {
            const stats = getAttendanceStats();
            return ContentService.createTextOutput(JSON.stringify(stats))
                .setMimeType(ContentService.MimeType.JSON);
        }
        
        if (action === 'email' && e.parameter.email) {
            const data = getAttendanceData(e.parameter.email);
            return ContentService.createTextOutput(JSON.stringify(data))
                .setMimeType(ContentService.MimeType.JSON);
        }
        
        return ContentService.createTextOutput(JSON.stringify({ 
            message: 'Invalid action' 
        })).setMimeType(ContentService.MimeType.JSON);
        
    } catch (error) {
        return ContentService.createTextOutput(JSON.stringify({ 
            error: error.toString() 
        })).setMimeType(ContentService.MimeType.JSON);
    }
}

// ============================================
// INTEGRASI DENGAN APLIKASI WEB
// ============================================
/**
 * CARA PENGGUNAAN DI APLIKASI WEB:
 * 
 * 1. Ganti SPREADSHEET_ID dengan ID Google Sheets Anda
 * 2. Deploy script sebagai Web App (Execute as: Me, Anyone can access)
 * 3. Gunakan GAS_URL untuk mengirim data dari aplikasi web
 * 
 * Contoh:
 * const GAS_URL = 'https://script.google.com/macros/d/YOUR_DEPLOYMENT_ID/usercalc';
 * 
 * async function sendAttendance() {
 *     const response = await fetch(GAS_URL, {
 *         method: 'POST',
 *         body: JSON.stringify({
 *             nama: 'John Doe',
 *             email: 'john@example.com',
 *             foto: canvas.toDataURL(),
 *             latitude: geoLocation.latitude,
 *             longitude: geoLocation.longitude,
 *             lokasi: 'Jakarta Pusat',
 *             catatan: 'Absensi melalui web app'
 *         })
 *     });
 * }
 */

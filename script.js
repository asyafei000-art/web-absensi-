// ============================================
// VARIABEL GLOBAL
// ============================================
let video;
let canvas;
let ctx;
let stream = null;
let isStreaming = false;
let lastFaceDetection = 0;
let frameCount = 0;
let lastFpsTime = Date.now();
let fps = 0;
let modelsLoaded = false;

// ============================================
// INISIALISASI SAAT HALAMAN DIMUAT
// ============================================
document.addEventListener('DOMContentLoaded', async () => {
    try {
        video = document.getElementById('video');
        canvas = document.getElementById('canvas');
        ctx = canvas.getContext('2d');

        // Atur ukuran canvas
        video.addEventListener('loadedmetadata', () => {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
        });

        // Load Face API Models
        await loadModels();

        // Tambah event listeners
        document.getElementById('startBtn').addEventListener('click', startCamera);
        document.getElementById('stopBtn').addEventListener('click', stopCamera);
        document.getElementById('captureBtn').addEventListener('click', capturePhoto);
        document.getElementById('resetBtn').addEventListener('click', resetApp);

        updateStatusText('Siap digunakan', 'waiting');
    } catch (error) {
        console.error('Error inisialisasi:', error);
        updateStatusText('Error: Gagal menginisialisasi', 'error');
    }
});

// ============================================
// LOAD FACE API MODELS
// ============================================
async function loadModels() {
    try {
        const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/';
        
        // Tunggu Face API siap
        await new Promise(resolve => {
            const checkReady = () => {
                if (typeof faceapi !== 'undefined') {
                    resolve();
                } else {
                    setTimeout(checkReady, 100);
                }
            };
            checkReady();
        });

        // Load models
        await Promise.all([
            faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
            faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
            faceapi.nets.faceDetectionNet.loadFromUri(MODEL_URL),
            faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
            faceapi.nets.ageGenderNet.loadFromUri(MODEL_URL)
        ]);

        modelsLoaded = true;
        console.log('Models loaded successfully');
        updateStatusText('Models siap', 'ready');
    } catch (error) {
        console.error('Error loading models:', error);
        updateStatusText('Error: Gagal load models', 'error');
    }
}

// ============================================
// MULAI KAMERA
// ============================================
async function startCamera() {
    try {
        stream = await navigator.mediaDevices.getUserMedia({
            video: {
                width: { ideal: 1280 },
                height: { ideal: 720 },
                facingMode: 'user'
            },
            audio: false
        });

        video.srcObject = stream;
        isStreaming = true;

        document.getElementById('startBtn').disabled = true;
        document.getElementById('stopBtn').disabled = false;
        document.getElementById('captureBtn').disabled = false;

        updateStatusText('Kamera aktif', 'active');
        updateFaceStatus('Menunggu deteksi...', 'waiting');

        // Mulai deteksi wajah
        detectFaces();
    } catch (error) {
        console.error('Error mengakses webcam:', error);
        alert('Tidak dapat mengakses webcam. Pastikan Anda telah memberikan izin.');
        updateStatusText('Kamera tidak tersedia', 'error');
    }
}

// ============================================
// HENTIKAN KAMERA
// ============================================
function stopCamera() {
    if (stream) {
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
        isStreaming = false;
    }

    document.getElementById('startBtn').disabled = false;
    document.getElementById('stopBtn').disabled = true;
    document.getElementById('captureBtn').disabled = true;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    updateStatusText('Kamera dihentikan', 'stopped');
    updateFaceStatus('Offline', 'error');
    document.getElementById('faceCount').textContent = '0';
    document.getElementById('facePosition').textContent = '-';
    document.getElementById('faceSize').textContent = '-';
    document.getElementById('detectionQuality').textContent = '0%';
}

// ============================================
// DETEKSI WAJAH (LOOP)
// ============================================
async function detectFaces() {
    if (!isStreaming) return;

    frameCount++;
    const now = Date.now();

    try {
        // Hitung FPS
        if (now - lastFpsTime > 1000) {
            fps = frameCount;
            frameCount = 0;
            lastFpsTime = now;
            document.getElementById('fps').textContent = fps;
        }

        // Deteksi wajah
        const detections = await faceapi
            .detectAllFaces(video)
            .withFaceLandmarks()
            .withFaceDescriptors()
            .withFaceExpressions()
            .withAgeAndGender();

        // Clear canvas sebelum menggambar
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (detections.length > 0) {
            lastFaceDetection = now;

            // Update informasi wajah
            const detection = detections[0];
            const { x, y, width, height } = detection.detection.box;

            // Hitung kualitas deteksi
            const confidence = detection.detection.score * 100;

            // Update UI
            document.getElementById('faceCount').textContent = detections.length;
            document.getElementById('detectionQuality').textContent = Math.round(confidence) + '%';
            document.getElementById('facePosition').textContent = 
                `(${Math.round(x)}, ${Math.round(y)})`;
            document.getElementById('faceSize').textContent = 
                `${Math.round(width)}x${Math.round(height)}px`;

            // Update status
            updateFaceStatus('✓ Wajah Terdeteksi!', 'detected');

            // Gambar kotak deteksi
            drawDetection(detection, detections.length);
        } else {
            // Tidak ada wajah terdeteksi
            if (now - lastFaceDetection > 2000) {
                document.getElementById('faceCount').textContent = '0';
                document.getElementById('detectionQuality').textContent = '0%';
                document.getElementById('facePosition').textContent = '-';
                document.getElementById('faceSize').textContent = '-';
                updateFaceStatus('Wajah tidak terdeteksi', 'waiting');
            }
        }

    } catch (error) {
        console.error('Error deteksi wajah:', error);
        updateFaceStatus('Error: ' + error.message, 'error');
    }

    // Loop deteksi
    requestAnimationFrame(detectFaces);
}

// ============================================
// GAMBAR DETEKSI DI CANVAS
// ============================================
function drawDetection(detection, count) {
    const { x, y, width, height } = detection.box;
    const landmarks = detection.landmarks.positions;

    // Gambar kotak utama
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 3;
    ctx.strokeRect(x, y, width, height);

    // Gambar sudut kotak
    const cornerSize = 15;
    ctx.fillStyle = '#10b981';

    // Top-left
    ctx.fillRect(x, y, cornerSize, 3);
    ctx.fillRect(x, y, 3, cornerSize);

    // Top-right
    ctx.fillRect(x + width - cornerSize, y, cornerSize, 3);
    ctx.fillRect(x + width - 3, y, 3, cornerSize);

    // Bottom-left
    ctx.fillRect(x, y + height - 3, cornerSize, 3);
    ctx.fillRect(x, y + height - cornerSize, 3, cornerSize);

    // Bottom-right
    ctx.fillRect(x + width - cornerSize, y + height - 3, cornerSize, 3);
    ctx.fillRect(x + width - 3, y + height - cornerSize, 3, cornerSize);

    // Gambar landmarks (titik-titik wajah)
    ctx.fillStyle = '#3b82f6';
    landmarks.forEach(point => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
        ctx.fill();
    });

    // Gambar informasi di atas kotak
    const age = Math.round(detection.age);
    const gender = detection.gender;
    const expression = Object.keys(detection.expressions)
        .reduce((a, b) => detection.expressions[a] > detection.expressions[b] ? a : b);

    ctx.fillStyle = 'rgba(16, 185, 129, 0.9)';
    ctx.font = 'bold 14px Arial';
    ctx.fillText(`${gender} | Age: ${age} | ${expression.toUpperCase()}`, x, y - 10);

    // Gambar jumlah wajah terdeteksi
    if (count > 1) {
        ctx.fillStyle = 'rgba(59, 130, 246, 0.9)';
        ctx.font = 'bold 16px Arial';
        ctx.fillText(`Wajah Terdeteksi: ${count}`, 10, 30);
    }
}

// ============================================
// TANGKAP FOTO
// ============================================
function capturePhoto() {
    try {
        const imageData = canvas.toDataURL('image/jpeg', 0.95);
        document.getElementById('capturedImage').src = imageData;
        document.getElementById('captureResult').style.display = 'block';

        // Simpan ke localStorage
        localStorage.setItem('lastCapturedFace', imageData);
        localStorage.setItem('captureTime', new Date().toLocaleString('id-ID'));

        console.log('Foto tertangkap berhasil');
    } catch (error) {
        console.error('Error capture foto:', error);
        alert('Gagal menangkap foto');
    }
}

// ============================================
// RESET APLIKASI
// ============================================
function resetApp() {
    stopCamera();
    document.getElementById('faceCount').textContent = '0';
    document.getElementById('detectionQuality').textContent = '0%';
    document.getElementById('fps').textContent = '0';
    document.getElementById('facePosition').textContent = '-';
    document.getElementById('faceSize').textContent = '-';
    updateFaceStatus('Siap digunakan', 'waiting');
    updateStatusText('Siap digunakan', 'waiting');
}

// ============================================
// UPDATE UI HELPERS
// ============================================
function updateStatusText(text, status) {
    document.getElementById('statusText').textContent = text;
    const statusDot = document.querySelector('.status-dot');

    statusDot.classList.remove('active');
    if (status === 'active' || status === 'ready') {
        statusDot.classList.add('active');
    }
}

function updateFaceStatus(text, status) {
    const badge = document.getElementById('faceStatus');
    badge.textContent = text;
    badge.classList.remove('status-waiting', 'status-detected', 'status-success', 'status-error');

    switch (status) {
        case 'detected':
            badge.classList.add('status-detected');
            break;
        case 'success':
            badge.classList.add('status-success');
            break;
        case 'error':
            badge.classList.add('status-error');
            break;
        default:
            badge.classList.add('status-waiting');
    }
}

// ============================================
// KEYBOARD SHORTCUTS
// ============================================
document.addEventListener('keydown', (e) => {
    if (e.key === ' ') {
        e.preventDefault();
        if (isStreaming && !document.getElementById('captureBtn').disabled) {
            capturePhoto();
        }
    }
    if (e.key === 'Escape') {
        document.getElementById('captureResult').style.display = 'none';
    }
});

// ============================================
// LOG INFO
// ============================================
console.log('✓ Face Detection App Initialized');
console.log('✓ Tekan SPACE untuk menangkap foto');
console.log('✓ Tekan ESC untuk menutup popup');

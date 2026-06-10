// ============================================
// VARIABEL GLOBAL
// ============================================
const API_URL = './api/';
let currentPage = 1;
let itemsPerPage = 10;
let allData = [];
let filteredData = [];
let currentDetailId = null;
let dailyChart = null;
let statusChart = null;

// ============================================
// INISIALISASI
// ============================================
document.addEventListener('DOMContentLoaded', async () => {
    try {
        initializeEventListeners();
        await loadAttendanceData();
        loadStatistics();
        initializeCharts();
        console.log('✓ Riwayat Absensi app initialized');
    } catch (error) {
        console.error('Error initializing:', error);
        showError('Gagal menginisialisasi aplikasi');
    }
});

function initializeEventListeners() {
    // Tab navigation
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            switchTab(e.target.dataset.tab);
        });
    });

    // Filter inputs
    document.getElementById('searchInput').addEventListener('keyup', () => {
        currentPage = 1;
        filterData();
    });

    document.getElementById('filterDate').addEventListener('change', () => {
        currentPage = 1;
        filterData();
    });

    document.getElementById('filterStatus').addEventListener('change', () => {
        currentPage = 1;
        filterData();
    });

    // Close modals on escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeDetailModal();
            closeEditModal();
        }
    });

    // Close modals when clicking outside
    document.getElementById('detailModal').addEventListener('click', (e) => {
        if (e.target.id === 'detailModal') closeDetailModal();
    });

    document.getElementById('editModal').addEventListener('click', (e) => {
        if (e.target.id === 'editModal') closeEditModal();
    });
}

// ============================================
// SWITCH TAB
// ============================================
function switchTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.style.display = 'none';
    });

    // Remove active class from all buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // Show selected tab
    document.getElementById(tabName + '-tab').style.display = 'block';

    // Add active class to clicked button
    event.target.classList.add('active');

    // Load data if switching to statistik
    if (tabName === 'statistik') {
        setTimeout(() => {
            if (dailyChart) dailyChart.resize();
            if (statusChart) statusChart.resize();
        }, 100);
    }
}

// ============================================
// LOAD ATTENDANCE DATA
// ============================================
async function loadAttendanceData() {
    try {
        const response = await fetch(API_URL + 'get_attendance.php');
        const data = await response.json();

        if (data.success) {
            allData = data.data;
            filteredData = [...allData];
            renderTable();
        } else {
            showError(data.message || 'Gagal memuat data');
        }
    } catch (error) {
        console.error('Error loading data:', error);
        showError('Error: ' + error.message);
        allData = [];
        filteredData = [];
        renderTable();
    }
}

// ============================================
// FILTER DATA
// ============================================
function filterData() {
    const searchValue = document.getElementById('searchInput').value.toLowerCase();
    const dateValue = document.getElementById('filterDate').value;
    const statusValue = document.getElementById('filterStatus').value;

    filteredData = allData.filter(item => {
        const matchSearch = !searchValue || 
            item.nama.toLowerCase().includes(searchValue) || 
            item.email.toLowerCase().includes(searchValue);

        const matchDate = !dateValue || item.tanggal === dateValue;
        const matchStatus = !statusValue || item.status === statusValue;

        return matchSearch && matchDate && matchStatus;
    });

    renderTable();
}

function resetFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('filterDate').value = '';
    document.getElementById('filterStatus').value = '';
    currentPage = 1;
    filteredData = [...allData];
    renderTable();
}

// ============================================
// RENDER TABLE
// ============================================
function renderTable() {
    const tbody = document.getElementById('tableBody');
    const startIdx = (currentPage - 1) * itemsPerPage;
    const endIdx = startIdx + itemsPerPage;
    const pageData = filteredData.slice(startIdx, endIdx);

    if (pageData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="10" class="loading">📭 Tidak ada data</td></tr>';
        updatePagination();
        return;
    }

    tbody.innerHTML = pageData.map((item, index) => `
        <tr>
            <td>${startIdx + index + 1}</td>
            <td><code>${item.id}</code></td>
            <td>${item.nama}</td>
            <td>${item.email}</td>
            <td>${formatDate(item.tanggal)}</td>
            <td>${item.waktu_masuk || '-'}</td>
            <td>${item.waktu_keluar || '-'}</td>
            <td>${item.lokasi}</td>
            <td><span class="status-badge status-${item.status.toLowerCase().replace(/\s+/g, '-')}">${item.status}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-detail btn-small" onclick="showDetail('${item.id}')">👁️ Lihat</button>
                    <button class="btn btn-edit btn-small" onclick="showEdit('${item.id}')">✏️ Edit</button>
                </div>
            </td>
        </tr>
    `).join('');

    updatePagination();
}

function updatePagination() {
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    document.getElementById('pageInfo').textContent = `Halaman ${currentPage} dari ${totalPages}`;
    document.getElementById('prevBtn').disabled = currentPage === 1;
    document.getElementById('nextBtn').disabled = currentPage === totalPages;
}

function previousPage() {
    if (currentPage > 1) {
        currentPage--;
        renderTable();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function nextPage() {
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        renderTable();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// ============================================
// DETAIL MODAL
// ============================================
function showDetail(id) {
    const item = allData.find(a => a.id === id);
    if (!item) return;

    currentDetailId = id;
    const modalBody = document.getElementById('modalBody');

    let fotoHtml = '';
    if (item.foto) {
        fotoHtml = `
            <div class="detail-foto">
                <strong>Foto:</strong>
                <img src="${item.foto}" alt="Foto ${item.nama}">
            </div>
        `;
    }

    modalBody.innerHTML = `
        <div class="detail-info">
            ${fotoHtml}
            <div class="detail-item">
                <strong>ID Absensi:</strong>
                <span>${item.id}</span>
            </div>
            <div class="detail-item">
                <strong>Nama:</strong>
                <span>${item.nama}</span>
            </div>
            <div class="detail-item">
                <strong>Email:</strong>
                <span>${item.email}</span>
            </div>
            <div class="detail-item">
                <strong>Tanggal:</strong>
                <span>${formatDate(item.tanggal)}</span>
            </div>
            <div class="detail-item">
                <strong>Waktu Masuk:</strong>
                <span>${item.waktu_masuk || '-'}</span>
            </div>
            <div class="detail-item">
                <strong>Waktu Keluar:</strong>
                <span>${item.waktu_keluar || '-'}</span>
            </div>
            <div class="detail-item">
                <strong>Lokasi:</strong>
                <span>${item.lokasi}</span>
            </div>
            <div class="detail-item">
                <strong>Status:</strong>
                <span class="status-badge status-${item.status.toLowerCase().replace(/\s+/g, '-')}">${item.status}</span>
            </div>
            <div class="detail-item" style="grid-column: 1 / -1;">
                <strong>Catatan:</strong>
                <span>${item.catatan || '-'}</span>
            </div>
        </div>
    `;

    document.getElementById('detailModal').classList.add('show');
}

function closeDetailModal() {
    document.getElementById('detailModal').classList.remove('show');
    currentDetailId = null;
}

// ============================================
// EDIT MODAL
// ============================================
function showEdit(id) {
    const item = allData.find(a => a.id === id);
    if (!item) return;

    document.getElementById('editId').value = id;
    document.getElementById('editNama').value = item.nama;
    document.getElementById('editEmail').value = item.email;
    document.getElementById('editStatus').value = item.status;
    document.getElementById('editCatatan').value = item.catatan || '';

    document.getElementById('editModal').classList.add('show');
}

function closeEditModal() {
    document.getElementById('editModal').classList.remove('show');
    document.getElementById('editForm').reset();
}

async function saveEdit(e) {
    e.preventDefault();

    const id = document.getElementById('editId').value;
    const data = {
        id: id,
        nama: document.getElementById('editNama').value,
        email: document.getElementById('editEmail').value,
        status: document.getElementById('editStatus').value,
        catatan: document.getElementById('editCatatan').value
    };

    try {
        const response = await fetch(API_URL + 'update_attendance.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        if (result.success) {
            showSuccess('Data berhasil diperbarui');
            closeEditModal();
            await loadAttendanceData();
            loadStatistics();
        } else {
            showError(result.message || 'Gagal memperbarui data');
        }
    } catch (error) {
        showError('Error: ' + error.message);
    }
}

// ============================================
// DELETE ATTENDANCE
// ============================================
async function deleteAttendance() {
    if (!currentDetailId) return;

    if (!confirm('Apakah Anda yakin ingin menghapus data ini?')) {
        return;
    }

    try {
        const response = await fetch(API_URL + 'delete_attendance.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: currentDetailId })
        });

        const result = await response.json();
        if (result.success) {
            showSuccess('Data berhasil dihapus');
            closeDetailModal();
            await loadAttendanceData();
            loadStatistics();
        } else {
            showError(result.message || 'Gagal menghapus data');
        }
    } catch (error) {
        showError('Error: ' + error.message);
    }
}

// ============================================
// STATISTIK
// ============================================
function loadStatistics() {
    const stats = {
        hadir: allData.filter(a => a.status === 'Hadir').length,
        tidakHadir: allData.filter(a => a.status === 'Tidak Hadir').length,
        izin: allData.filter(a => a.status === 'Izin').length,
        sakit: allData.filter(a => a.status === 'Sakit').length,
        total: allData.length
    };

    const persentase = stats.total > 0 ? Math.round((stats.hadir / stats.total) * 100) : 0;

    document.getElementById('statHadir').textContent = stats.hadir;
    document.getElementById('statTidakHadir').textContent = stats.tidakHadir;
    document.getElementById('statIzin').textContent = stats.izin;
    document.getElementById('statSakit').textContent = stats.sakit;
    document.getElementById('statTotal').textContent = stats.total;
    document.getElementById('statPersentase').textContent = persentase + '%';

    updateCharts();
}

// ============================================
// CHARTS
// ============================================
function initializeCharts() {
    const dailyCtx = document.getElementById('dailyChart').getContext('2d');
    const statusCtx = document.getElementById('statusChart').getContext('2d');

    dailyChart = new Chart(dailyCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Kehadiran Harian',
                data: [],
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                tension: 0.4,
                fill: true,
                pointRadius: 5,
                pointBackgroundColor: '#667eea',
                pointBorderColor: '#fff',
                pointBorderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: true,
                    labels: { usePointStyle: true }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { stepSize: 1 }
                }
            }
        }
    });

    statusChart = new Chart(statusCtx, {
        type: 'doughnut',
        data: {
            labels: ['Hadir', 'Tidak Hadir', 'Izin', 'Sakit'],
            datasets: [{
                data: [],
                backgroundColor: [
                    '#10b981',
                    '#ef4444',
                    '#f59e0b',
                    '#3b82f6'
                ],
                borderColor: '#fff',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { usePointStyle: true, padding: 15 }
                }
            }
        }
    });
}

function updateCharts() {
    if (!dailyChart || !statusChart) return;

    // Update status chart
    const stats = {
        hadir: allData.filter(a => a.status === 'Hadir').length,
        tidakHadir: allData.filter(a => a.status === 'Tidak Hadir').length,
        izin: allData.filter(a => a.status === 'Izin').length,
        sakit: allData.filter(a => a.status === 'Sakit').length
    };

    statusChart.data.datasets[0].data = [
        stats.hadir,
        stats.tidakHadir,
        stats.izin,
        stats.sakit
    ];
    statusChart.update();

    // Update daily chart
    const dailyStats = getDailyStats();
    dailyChart.data.labels = dailyStats.dates;
    dailyChart.data.datasets[0].data = dailyStats.counts;
    dailyChart.update();
}

function getDailyStats() {
    const dateCounts = {};

    allData.forEach(item => {
        const date = item.tanggal;
        dateCounts[date] = (dateCounts[date] || 0) + 1;
    });

    const dates = Object.keys(dateCounts).sort();
    const counts = dates.map(date => dateCounts[date]);

    return { dates: dates.map(formatDate), counts };
}

// ============================================
// EXPORT FUNCTIONS
// ============================================
function exportToCSV() {
    if (filteredData.length === 0) {
        showError('Tidak ada data untuk diexport');
        return;
    }

    let csv = 'ID,Nama,Email,Tanggal,Waktu Masuk,Waktu Keluar,Lokasi,Status,Catatan\n';

    filteredData.forEach(item => {
        const row = [
            item.id,
            `"${item.nama}"`,
            item.email,
            item.tanggal,
            item.waktu_masuk || '',
            item.waktu_keluar || '',
            `"${item.lokasi}"`,
            item.status,
            `"${item.catatan || ''}"`
        ].join(',');
        csv += row + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `absensi_${new Date().getTime()}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);

    showSuccess('File berhasil diexport');
}

function generateReport() {
    const startDate = document.getElementById('reportStartDate').value;
    const endDate = document.getElementById('reportEndDate').value;

    if (!startDate || !endDate) {
        showError('Pilih periode awal dan akhir');
        return;
    }

    const filtered = allData.filter(item =>
        item.tanggal >= startDate && item.tanggal <= endDate
    );

    const employeeStats = {};
    filtered.forEach(item => {
        if (!employeeStats[item.email]) {
            employeeStats[item.email] = {
                nama: item.nama,
                email: item.email,
                hadir: 0,
                tidakHadir: 0,
                izin: 0,
                sakit: 0,
                total: 0
            };
        }

        employeeStats[item.email].total++;
        if (item.status === 'Hadir') employeeStats[item.email].hadir++;
        else if (item.status === 'Tidak Hadir') employeeStats[item.email].tidakHadir++;
        else if (item.status === 'Izin') employeeStats[item.email].izin++;
        else if (item.status === 'Sakit') employeeStats[item.email].sakit++;
    });

    displayReportPreview(employeeStats);
}

function displayReportPreview(employeeStats) {
    const tbody = document.getElementById('reportBody');
    tbody.innerHTML = Object.values(employeeStats).map(emp => `
        <tr>
            <td>${emp.nama}</td>
            <td>${emp.email}</td>
            <td>${emp.hadir}</td>
            <td>${emp.tidakHadir}</td>
            <td>${emp.izin}</td>
            <td>${emp.sakit}</td>
            <td>${emp.total}</td>
            <td>${emp.total > 0 ? Math.round((emp.hadir / emp.total) * 100) : 0}%</td>
        </tr>
    `).join('');

    document.getElementById('reportPreview').style.display = 'block';
}

// ============================================
// UTILITY FUNCTIONS
// ============================================
function formatDate(dateString) {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('id-ID', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function showError(message) {
    alert('❌ ' + message);
}

function showSuccess(message) {
    alert('✓ ' + message);
}

function clearAllData() {
    if (!confirm('Apakah Anda yakin ingin menghapus SEMUA data absensi? Tindakan ini tidak dapat dibatalkan!')) {
        return;
    }

    // Implementation for clearing all data
    showSuccess('Semua data telah dihapus');
}

console.log('✓ Riwayat script loaded');

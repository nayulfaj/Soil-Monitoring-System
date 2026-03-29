// =================== NAVIGATION ===================
const pages = {
  'dashboard':  { title: 'Dashboard', sub: 'Monitoring Tanah & Lingkungan — Node Sawah' },
  'analitik':   { title: 'Analitik', sub: 'Tren sensor terhadap waktu' },
  'kesehatan':  { title: 'Kesehatan Tanah', sub: 'Status dan rekomendasi parameter tanah' },
  'history':    { title: 'Data History', sub: 'Log sensor per 20 menit' },
  'monitoring': { title: 'Sensor Tanah', sub: 'Raw data sensor NPK 7-in-1 · Node Sawah' },
  'lingkungan': { title: 'Lingkungan', sub: 'Sensor DHT22 & Sensor Hujan' },
  'system':     { title: 'Status Perangkat', sub: 'Detail IoT monitoring & konektivitas' },
  'settings':   { title: 'Pengaturan', sub: 'Threshold & preferensi notifikasi' },
};

document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const pageId = link.getAttribute('data-page');
    switchPage(pageId);
  });
});

function switchPage(pageId) {
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
  document.querySelector(`.nav-link[data-page="${pageId}"]`).classList.add('active');
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(`page-${pageId}`).classList.add('active');
  document.getElementById('pageTitle').textContent = pages[pageId].title;
  document.getElementById('pageSubtitle').textContent = pages[pageId].sub;
  if (pageId === 'analitik' && !analyticsChart) buildAnalyticsChart();
}

// =================== THEME TOGGLE ===================
const toggle = document.getElementById('themeToggle');
const label  = document.getElementById('toggleLabel');
let isDark = false;

toggle.addEventListener('click', () => {
  isDark = !isDark;
  document.documentElement.classList.toggle('dark', isDark);
  label.textContent = isDark ? '☀️ Terang' : '🌙 Gelap';
  if (trendChart) { trendChart.destroy(); buildTrendChart(); }
  if (analyticsChart) { analyticsChart.destroy(); analyticsChart = null; buildAnalyticsChart(); }
});

// =================== TREND CHART (DASHBOARD) ===================
const hours = ['00:00','02:00','04:00','06:00','08:00','10:00','12:00','14:00','16:00','18:00','20:00','22:00','Now'];
const moistureData = [58,55,54,57,60,63,65,64,62,61,63,64,63];
const tempData     = [24,23,22,22,24,26,27,28,28,27,27,27,27];
const phData       = [6.5,6.5,6.6,6.7,6.8,6.8,6.9,6.8,6.8,6.7,6.8,6.8,6.8];
const ctx = document.getElementById('trendChart').getContext('2d');
let trendChart;

function getColors() {
  const d = isDark;
  return {
    grid: d ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.05)',
    tickX: d ? '#6a9970' : '#6a9070',
    mLine: d ? '#5bca6e' : '#2b9e46', mBg: d ? 'rgba(91,202,110,0.08)' : 'rgba(43,158,70,0.07)',
    tLine: d ? '#d4e84a' : '#7a9200', tBg: d ? 'rgba(212,232,74,0.06)' : 'rgba(122,146,0,0.06)',
    pLine: d ? '#4ac2e8' : '#0b8fb0',
    ttBg: d ? '#111f13' : '#ffffff', ttBdr: d ? '#1e3522' : '#d8e9db',
    ttTtl: d ? '#6a9970' : '#6a9070', ttBdy: d ? '#e8f5ea' : '#18291b',
  };
}

function buildTrendChart() {
  const c = getColors();
  trendChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: hours,
      datasets: [
        { label: 'Kelembaban (%)', data: moistureData, borderColor: c.mLine, backgroundColor: c.mBg, borderWidth: 2.5, pointRadius: 0, pointHoverRadius: 5, fill: true, tension: 0.4, yAxisID: 'y' },
        { label: 'Temperatur (°C)', data: tempData, borderColor: c.tLine, backgroundColor: c.tBg, borderWidth: 2, pointRadius: 0, pointHoverRadius: 5, fill: true, tension: 0.4, yAxisID: 'y1' },
        { label: 'pH', data: phData, borderColor: c.pLine, backgroundColor: 'transparent', borderWidth: 2, pointRadius: 0, pointHoverRadius: 5, fill: false, tension: 0.4, yAxisID: 'y2' }
      ]
    },
    options: {
      responsive: true,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: { backgroundColor: c.ttBg, borderColor: c.ttBdr, borderWidth: 1, titleColor: c.ttTtl, bodyColor: c.ttBdy, padding: 10 }
      },
      scales: {
        x: { grid: { color: c.grid }, ticks: { color: c.tickX, font: { size: 10 } }, border: { display: false } },
        y: { position: 'left', grid: { color: c.grid }, ticks: { color: c.mLine, font: { size: 10 }, callback: v => v + '%' }, border: { display: false } },
        y1: { position: 'right', grid: { drawOnChartArea: false }, ticks: { color: c.tLine, font: { size: 10 }, callback: v => v + '°' }, border: { display: false } },
        y2: { display: false, min: 5, max: 9 }
      }
    }
  });
}
buildTrendChart();

// Tab buttons (dashboard trend)
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    btn.closest('.tab-group').querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  });
});

// =================== ANALYTICS CHART ===================
let analyticsChart = null;
const analyticsCtx = document.getElementById('analyticsChart');

const allSensorData = {
  moisture:  { label: 'Kelembaban (%)', color: '#2b9e46', data: [58,55,54,57,60,63,65,64,62,61,63,64,63], yLabel: '%' },
  soiltemp:  { label: 'Suhu Tanah (°C)', color: '#7a9200', data: [24,23,22,22,24,26,27,28,28,27,27,27,27], yLabel: '°C' },
  ph:        { label: 'pH', color: '#0b8fb0', data: [6.5,6.5,6.6,6.7,6.8,6.8,6.9,6.8,6.8,6.7,6.8,6.8,6.8], yLabel: '' },
  ec:        { label: 'EC (mS/cm)', color: '#7c2ec9', data: [1.2,1.2,1.3,1.3,1.4,1.4,1.5,1.5,1.4,1.4,1.4,1.4,1.4], yLabel: 'mS' },
  n:         { label: 'Nitrogen (mg/kg)', color: '#2b9e46', data: [138,135,136,139,141,142,143,143,142,141,142,143,142], yLabel: '' },
  p:         { label: 'Fosfor (mg/kg)', color: '#d4a800', data: [65,64,64,66,67,67,68,68,67,66,67,67,67], yLabel: '' },
  k:         { label: 'Kalium (mg/kg)', color: '#0b8fb0', data: [192,190,191,194,196,198,199,200,199,197,198,199,198], yLabel: '' },
  airtemp:   { label: 'Suhu Udara (°C)', color: '#c94f2a', data: [23,22,21,22,24,26,27,28,29,29,29,29,29], yLabel: '°C' },
  airhumid:  { label: 'Kelembaban Udara (%)', color: '#0b8fb0', data: [75,76,77,76,74,73,74,75,77,78,78,78,78], yLabel: '%' },
};

let activeChips = new Set(['moisture','soiltemp']);

function buildAnalyticsChart() {
  const c = getColors();
  const datasets = [];
  activeChips.forEach(key => {
    const s = allSensorData[key];
    datasets.push({
      label: s.label, data: s.data,
      borderColor: s.color,
      backgroundColor: s.color + '15',
      borderWidth: 2, pointRadius: 3, pointHoverRadius: 6,
      fill: false, tension: 0.4
    });
  });
  analyticsChart = new Chart(analyticsCtx, {
    type: 'line',
    data: { labels: hours, datasets },
    options: {
      responsive: true,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { display: true, labels: { color: isDark ? '#e8f5ea' : '#18291b', font: { size: 11, family: 'DM Sans' }, boxWidth: 12 } },
        tooltip: { backgroundColor: c.ttBg, borderColor: c.ttBdr, borderWidth: 1, titleColor: c.ttTtl, bodyColor: c.ttBdy, padding: 10 }
      },
      scales: {
        x: { grid: { color: c.grid }, ticks: { color: c.tickX, font: { size: 10 } }, border: { display: false } },
        y: { grid: { color: c.grid }, ticks: { color: isDark ? '#6a9970' : '#6a9070', font: { size: 10 } }, border: { display: false } }
      }
    }
  });
}

document.getElementById('sensorChips').addEventListener('click', e => {
  const chip = e.target.closest('.sensor-chip');
  if (!chip) return;
  const sensor = chip.getAttribute('data-sensor');
  if (activeChips.has(sensor)) {
    if (activeChips.size > 1) { activeChips.delete(sensor); chip.classList.remove('active'); }
  } else {
    activeChips.add(sensor); chip.classList.add('active');
  }
  if (analyticsChart) { analyticsChart.destroy(); analyticsChart = null; }
  buildAnalyticsChart();
});

document.querySelectorAll('.time-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.time-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  });
});

// =================== HISTORY TABLE ===================
function generateHistoryData() {
  const data = [];
  const now = new Date(2026, 2, 5, 8, 20);
  for (let i = 0; i < 72; i++) {
    const t = new Date(now.getTime() - i * 20 * 60000);
    const dd = String(t.getDate()).padStart(2,'0');
    const mm = String(t.getMonth()+1).padStart(2,'0');
    const hh = String(t.getHours()).padStart(2,'0');
    const mn = String(t.getMinutes()).padStart(2,'0');
    const moist = (60 + Math.round((Math.random()-0.5)*12));
    const soilT = (26 + (Math.random()-0.5)*4).toFixed(1);
    const ph    = (6.7 + (Math.random()-0.5)*0.6).toFixed(1);
    const ec    = (1.3 + (Math.random()-0.5)*0.4).toFixed(2);
    const n     = Math.round(135 + (Math.random()-0.5)*20);
    const p     = Math.round(62  + (Math.random()-0.5)*14);
    const k     = Math.round(192 + (Math.random()-0.5)*24);
    const airT  = (27 + (Math.random()-0.5)*6).toFixed(1);
    const airH  = Math.round(74 + (Math.random()-0.5)*16);
    const rain  = Math.random() > 0.6 ? 'Hujan' : 'Tidak Hujan';
    data.push([`${dd}/${mm}/2026 ${hh}:${mn}`, moist, soilT, ph, ec, n, p, k, airT, airH, rain]);
  }
  return data;
}

const historyData = generateHistoryData();
let currentPage = 1;
const rowsPerPage = 20;

function renderHistoryTable() {
  const start = (currentPage - 1) * rowsPerPage;
  const end = Math.min(start + rowsPerPage, historyData.length);
  const tbody = document.getElementById('historyBody');
  tbody.innerHTML = '';
  for (let i = start; i < end; i++) {
    const row = historyData[i];
    const tr = document.createElement('tr');
    tr.innerHTML = row.map((cell, idx) => {
      if (idx === 0) return `<td style="color:var(--text-muted);font-size:11px;">${cell}</td>`;
      if (idx === 10) {
        const isRain = cell === 'Hujan';
        return `<td><span style="font-size:11px;padding:2px 8px;border-radius:10px;background:${isRain?'rgba(11,143,176,0.1)':'rgba(43,158,70,0.08)'};color:${isRain?'var(--accent-blue)':'var(--text-muted)'};">${isRain?'🌧️':'☀️'} ${cell}</span></td>`;
      }
      return `<td style="font-weight:500;">${cell}</td>`;
    }).join('');
    tbody.appendChild(tr);
  }
  document.getElementById('pageInfo').textContent = `Menampilkan ${start+1}–${end} dari ${historyData.length} entri`;
  renderPageBtns();
}

function renderPageBtns() {
  const totalPages = Math.ceil(historyData.length / rowsPerPage);
  const container = document.getElementById('pageBtns');
  container.innerHTML = '';
  const prevBtn = document.createElement('button');
  prevBtn.className = 'page-nav-btn'; prevBtn.textContent = '← Prev';
  prevBtn.disabled = currentPage === 1;
  prevBtn.onclick = () => { if (currentPage > 1) { currentPage--; renderHistoryTable(); }};
  container.appendChild(prevBtn);
  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement('button');
    btn.className = 'page-nav-btn' + (i === currentPage ? ' active-page' : '');
    btn.textContent = i;
    btn.onclick = () => { currentPage = i; renderHistoryTable(); };
    container.appendChild(btn);
  }
  const nextBtn = document.createElement('button');
  nextBtn.className = 'page-nav-btn'; nextBtn.textContent = 'Next →';
  nextBtn.disabled = currentPage === totalPages;
  nextBtn.onclick = () => { if (currentPage < totalPages) { currentPage++; renderHistoryTable(); }};
  container.appendChild(nextBtn);
}

renderHistoryTable();

function downloadCSV() {
  const headers = ['Waktu','Kelembaban (%)','Suhu Tanah (°C)','pH','EC (mS/cm)','N (mg/kg)','P (mg/kg)','K (mg/kg)','Suhu Udara (°C)','Kelembaban Udara (%)','Hujan'];
  const rows = [headers, ...historyData];
  const csv = rows.map(r => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'subura_sensor_log.csv'; a.click();
  URL.revokeObjectURL(url);
}

// =================== SETTINGS ===================
function toggleNotif(el) { el.classList.toggle('on'); }

function showToast(msg) {
  const t = document.getElementById('toastMsg');
  t.textContent = msg; t.style.display = 'block';
  setTimeout(() => { t.style.display = 'none'; }, 2500);
}

function saveSettings() { showToast('✅ Threshold disimpan!'); }

document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    initApp();
    setupEventListeners();
});

function setupEventListeners() {
    const toggleBtn = document.getElementById('toggle-tray');
    const tray = document.getElementById('full-prayer-grid');

    toggleBtn.addEventListener('click', () => {
        tray.classList.toggle('active');
        toggleBtn.classList.toggle('active');
    });
}

async function initApp() {
    const cachedData = getCachedTimings();
    if (cachedData) {
        updateUI(cachedData);
    } else {
        await fetchAndCacheTimings();
    }
}

function getCachedTimings() {
    const cached = localStorage.getItem('ramadan_timings');
    if (!cached) return null;
    const { date, data } = JSON.parse(cached);
    return date === new Date().toISOString().split('T')[0] ? data : null;
}

async function fetchAndCacheTimings() {
    const statusEl = document.getElementById('event-status');
    const today = new Date();
    const city = "Dhaka", country = "Bangladesh";
    const month = today.getMonth() + 1, year = today.getFullYear();

    try {
        const response = await fetch(`https://api.aladhan.com/v1/calendarByCity/${year}/${month}?city=${city}&country=${country}&method=1`);
        const result = await response.json();

        if (result.code === 200) {
            localStorage.setItem('ramadan_timings', JSON.stringify({
                date: new Date().toISOString().split('T')[0],
                data: result.data
            }));
            updateUI(result.data);
        } else {
            statusEl.textContent = "API Error";
        }
    } catch (error) {
        statusEl.textContent = "Offline";
    }
}

function updateUI(calendarData) {
    const today = new Date();
    const dayIdx = today.getDate() - 1;
    const todayData = calendarData[dayIdx];

    if (!todayData) return;

    // Hijri Date
    const h = todayData.date.hijri;
    document.getElementById('hijri-date').textContent = `${h.day} ${h.month.en} ${h.year}`;

    // Timings
    const seharTime = todayData.timings.Fajr.split(' ')[0];
    const iftarTime = todayData.timings.Maghrib.split(' ')[0];
    document.getElementById('sehar-time').textContent = formatTime(seharTime);
    document.getElementById('iftar-time').textContent = formatTime(iftarTime);

    // Populate Prayer Grid
    populatePrayerGrid(todayData.timings);

    // Start Logic
    startCountdown(calendarData);
}

function populatePrayerGrid(timings) {
    const grid = document.getElementById('full-prayer-grid');
    const names = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
    grid.innerHTML = names.map(name => `
        <div class="p-item">
            <span class="p-name">${name.toUpperCase()}</span>
            <span class="p-time">${formatTime(timings[name].split(' ')[0])}</span>
        </div>
    `).join('');
}

function formatTime(time24) {
    const [hours, minutes] = time24.split(':');
    let h = parseInt(hours);
    const period = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${h}:${minutes} ${period}`;
}

function startCountdown(calendarData) {
    const statusEl = document.getElementById('event-status');
    const countdownEl = document.getElementById('countdown');
    const progressBar = document.getElementById('progress-fill');

    const tick = () => {
        const now = new Date();
        const dayIdx = now.getDate() - 1;
        const todayTimings = calendarData[dayIdx].timings;

        const [sH, sM] = todayTimings.Fajr.split(' ')[0].split(':').map(Number);
        const [iH, iM] = todayTimings.Maghrib.split(' ')[0].split(':').map(Number);

        const seharDate = new Date(now);
        seharDate.setHours(sH, sM, 0);

        const iftarDate = new Date(now);
        iftarDate.setHours(iH, iM, 0);

        let target, status, startTime;

        if (now < seharDate) {
            target = seharDate;
            status = "UNTIL SEHAR";
            // Start from previous Iftar
            const prevDayIdx = dayIdx > 0 ? dayIdx - 1 : 0;
            const prevIftar = calendarData[prevDayIdx].timings.Maghrib.split(' ')[0];
            const [pIH, pIM] = prevIftar.split(':').map(Number);
            const prevDate = new Date(now);
            if (dayIdx > 0) prevDate.setDate(prevDate.getDate() - 1);
            startTime = prevDate.setHours(pIH, pIM, 0);
        } else if (now < iftarDate) {
            target = iftarDate;
            status = "UNTIL IFTAR";
            startTime = seharDate.getTime();
        } else {
            const nextDay = calendarData[dayIdx + 1];
            if (nextDay) {
                const [tsH, tsM] = nextDay.timings.Fajr.split(' ')[0].split(':').map(Number);
                const tmDate = new Date(now);
                tmDate.setDate(tmDate.getDate() + 1);
                target = tmDate.setHours(tsH, tsM, 0);
                status = "UNTIL SEHAR (TOMORROW)";
                startTime = iftarDate.getTime();
            } else {
                statusEl.textContent = "END OF MONTH";
                return;
            }
        }

        const diff = target - now;
        const total = target - startTime;
        const progress = Math.max(0, Math.min(100, (1 - (diff / total)) * 100));

        progressBar.style.width = `${progress}%`;

        const h = String(Math.floor(diff / 3600000)).padStart(2, '0');
        const m = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0');
        const s = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0');

        statusEl.textContent = status;
        countdownEl.textContent = `${h}:${m}:${s}`;
    };

    setInterval(tick, 1000);
    tick();
}

document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    initApp();
});

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
    const today = new Date().toISOString().split('T')[0];

    // Only use cache if it was fetched today
    return date === today ? data : null;
}

async function fetchAndCacheTimings() {
    const statusEl = document.getElementById('event-status');
    const today = new Date();
    const city = "Dhaka";
    const country = "Bangladesh";
    const month = today.getMonth() + 1;
    const year = today.getFullYear();

    try {
        // Fetch current month's calendar for better "tomorrow" reliability
        const response = await fetch(`https://api.aladhan.com/v1/calendarByCity/${year}/${month}?city=${city}&country=${country}&method=1`);
        const result = await response.json();

        if (result.code === 200) {
            const data = result.data;
            const todayStr = new Date().toISOString().split('T')[0];
            localStorage.setItem('ramadan_timings', JSON.stringify({
                date: todayStr,
                data: data
            }));
            updateUI(data);
        } else {
            statusEl.textContent = "API Error";
        }
    } catch (error) {
        console.error("Fetch failed:", error);
        statusEl.textContent = "Offline";
    }
}

function updateUI(calendarData) {
    const today = new Date();
    const dayOfMonth = today.getDate();
    const todayData = calendarData[dayOfMonth - 1];

    if (!todayData) return;

    // Set Hijri Date
    const h = todayData.date.hijri;
    document.getElementById('hijri-date').textContent = `${h.day} ${h.month.en} ${h.year}`;

    const seharTime = todayData.timings.Fajr.split(' ')[0];
    const iftarTime = todayData.timings.Maghrib.split(' ')[0];

    document.getElementById('sehar-time').textContent = formatTime(seharTime);
    document.getElementById('iftar-time').textContent = formatTime(iftarTime);

    startCountdown(calendarData);
}

function formatTime(time24) {
    const [hours, minutes] = time24.split(':');
    const h = parseInt(hours);
    const period = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${minutes} ${period}`;
}

function startCountdown(calendarData) {
    const statusEl = document.getElementById('event-status');
    const countdownEl = document.getElementById('countdown');

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

        let target, status;

        if (now < seharDate) {
            target = seharDate;
            status = "UNTIL SEHAR";
        } else if (now < iftarDate) {
            target = iftarDate;
            status = "UNTIL IFTAR";
        } else {
            // After Iftar, get tomorrow's accurate Sehar time from the calendar
            const tomorrowData = calendarData[dayIdx + 1];
            if (tomorrowData) {
                const [tsH, tsM] = tomorrowData.timings.Fajr.split(' ')[0].split(':').map(Number);
                const nextDay = new Date(now);
                nextDay.setDate(nextDay.getDate() + 1);
                nextDay.setHours(tsH, tsM, 0);
                target = nextDay;
                status = "UNTIL TOMORROW'S SEHAR";
            } else {
                status = "END OF MONTH";
                return;
            }
        }

        const diff = target - now;
        const h = String(Math.floor(diff / 3600000)).padStart(2, '0');
        const m = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0');
        const s = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0');

        statusEl.textContent = status;
        countdownEl.textContent = `${h}:${m}:${s}`;
    };

    setInterval(tick, 1000);
    tick();
}

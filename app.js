document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    initApp();
    setupEventListeners();
    updateDateTime();
    setInterval(updateDateTime, 1000);
});

let currentLang = 'bn'; // Default to Bengali

const translations = {
    en: {
        sehar_label: "SEHAR ENDS",
        iftar_label: "IFTAR STARTS",
        countdown_sehar: "UNTIL SEHAR",
        countdown_iftar: "UNTIL IFTAR",
        countdown_sehar_tomorrow: "UNTIL SEHAR (TOMORROW)",
        tray_label: "Today's Prayer Times",
        dhaka: "Dhaka, Bangladesh",
        location_label: "Location",
        loading: "Loading...",
        date_locale: 'en-GB'
    },
    bn: {
        sehar_label: "সেহরি (শেষ সময়)",
        iftar_label: "ইফতার (শুরু সময়)",
        countdown_sehar: "সেহরির বাকি",
        countdown_iftar: "ইফতারের বাকি",
        countdown_sehar_tomorrow: "আগামীকালের সেহরি",
        tray_label: "আজকের নামাজের সময়",
        dhaka: "ঢাকা, বাংলাদেশ",
        location_label: "অবস্থান",
        loading: "লোড হচ্ছে...",
        date_locale: 'bn-BD'
    }
};

const prayerNames = {
    en: ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'],
    bn: ['ফজর', 'সূর্যোদয়', 'যোহর', 'আসর', 'মাগরিব', 'এশা']
};

function updateDateTime() {
    const now = new Date();
    const t = translations[currentLang];

    const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    document.getElementById('current-date').textContent = now.toLocaleDateString(t.date_locale, options).toUpperCase();

    const timeOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true };
    document.getElementById('current-time').textContent = now.toLocaleTimeString(t.date_locale, timeOptions);
}

function setupEventListeners() {
    const toggleBtn = document.getElementById('toggle-tray');
    const tray = document.getElementById('full-prayer-grid');
    const langBtn = document.getElementById('lang-toggle');

    toggleBtn.addEventListener('click', () => {
        tray.classList.toggle('active');
        toggleBtn.classList.toggle('active');
    });

    langBtn.addEventListener('click', () => {
        currentLang = currentLang === 'bn' ? 'en' : 'bn';
        document.body.className = `lang-${currentLang}`;
        updateLanguageUI();
        updateDateTime();
    });
}

function updateLanguageUI() {
    const t = translations[currentLang];

    const enBtn = document.querySelector('.lang-en');
    const bnBtn = document.querySelector('.lang-bn');
    if (currentLang === 'en') {
        enBtn.classList.add('active');
        bnBtn.classList.remove('active');
    } else {
        enBtn.classList.remove('active');
        bnBtn.classList.add('active');
    }

    document.querySelector('.tray-toggle span:first-child').textContent = t.tray_label;
    document.querySelector('.location span').textContent = t.dhaka;

    const cachedData = getCachedTimings();
    if (cachedData) {
        const today = new Date();
        const dayIdx = today.getDate() - 1;
        populatePrayerGrid(cachedData[dayIdx].timings);
    }
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
            statusEl.textContent = translations[currentLang].loading;
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

    const h = todayData.date.hijri;
    document.getElementById('hijri-date').textContent = `${h.day} ${h.month.en} ${h.year}`;

    const seharTime = todayData.timings.Fajr.split(' ')[0];
    const iftarTime = todayData.timings.Maghrib.split(' ')[0];
    document.getElementById('sehar-time').textContent = formatTime(seharTime);
    document.getElementById('iftar-time').textContent = formatTime(iftarTime);

    populatePrayerGrid(todayData.timings);
    startCountdown(calendarData);
}

function populatePrayerGrid(timings) {
    const grid = document.getElementById('full-prayer-grid');
    const enNames = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
    const displayNames = currentLang === 'en' ? enNames : prayerNames.bn;

    grid.innerHTML = enNames.map((name, i) => `
        <div class="p-item">
            <span class="p-name">${displayNames[i].toUpperCase()}</span>
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
        if (!calendarData[dayIdx]) return;

        const todayTimings = calendarData[dayIdx].timings;
        const t = translations[currentLang];

        const [sH, sM] = todayTimings.Fajr.split(' ')[0].split(':').map(Number);
        const [iH, iM] = todayTimings.Maghrib.split(' ')[0].split(':').map(Number);

        const seharDate = new Date(now);
        seharDate.setHours(sH, sM, 0, 0);

        const iftarDate = new Date(now);
        iftarDate.setHours(iH, iM, 0, 0);

        let target, statusText, startTime;

        if (now < seharDate) {
            target = seharDate;
            statusText = t.countdown_sehar;

            // Start from previous Iftar
            let prevIftarDate;
            if (dayIdx > 0) {
                const prevTimings = calendarData[dayIdx - 1].timings;
                const [pIH, pIM] = prevTimings.Maghrib.split(' ')[0].split(':').map(Number);
                prevIftarDate = new Date(now);
                prevIftarDate.setDate(prevIftarDate.getDate() - 1);
                prevIftarDate.setHours(pIH, pIM, 0, 0);
            } else {
                // Approximate fallback for 1st of month: 11 hours before Sehar
                prevIftarDate = new Date(seharDate.getTime() - (11 * 3600000));
            }
            startTime = prevIftarDate.getTime();
        } else if (now < iftarDate) {
            target = iftarDate;
            statusText = t.countdown_iftar;
            startTime = seharDate.getTime();
        } else {
            statusText = t.countdown_sehar_tomorrow;
            const nextDay = calendarData[dayIdx + 1];
            if (nextDay) {
                const [tsH, tsM] = nextDay.timings.Fajr.split(' ')[0].split(':').map(Number);
                const tmDate = new Date(now);
                tmDate.setDate(tmDate.getDate() + 1);
                tmDate.setHours(tsH, tsM, 0, 0);
                target = tmDate;
            } else {
                // Fallback for end of month
                target = new Date(now.getTime() + (10 * 3600000));
            }
            startTime = iftarDate.getTime();
        }

        const diff = target - now;
        const total = target - startTime;
        const progress = Math.max(0, Math.min(100, (1 - (diff / total)) * 100));

        progressBar.style.width = `${progress}%`;

        const totalSeconds = Math.max(0, Math.floor(diff / 1000));
        const h = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
        const m = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
        const s = String(totalSeconds % 60).padStart(2, '0');

        statusEl.textContent = statusText;
        countdownEl.textContent = `${h}:${m}:${s}`;
    };

    setInterval(tick, 1000);
    tick();
}

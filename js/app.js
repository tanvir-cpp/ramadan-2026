/* ==========================================
   Main page logic — app.js
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    currentLang = getSavedLang();
    currentCity = getSavedCity();
    document.body.classList.add(`lang-${currentLang}`);
    applyLanguage();
    populateCitySelector();
    initApp();
    setupEventListeners();
    updateDateTime();
    setInterval(updateDateTime, 1000);
    registerSW();
});

let currentLang = 'bn';
let currentCity = 'Dhaka';
let countdownInterval = null;

const i18n = {
    en: {
        countdown_sehar: 'UNTIL SEHAR',
        countdown_iftar: 'UNTIL IFTAR',
        countdown_tomorrow: 'UNTIL SEHAR (TOMORROW)',
        tray_label: "Today's Prayer Times",
        loading: 'Loading...',
        locale: 'en-GB',
        country: 'Bangladesh',
        ramadan_day: (d) => `Day ${d} of 30`,
    },
    bn: {
        countdown_sehar: 'সেহরির বাকি',
        countdown_iftar: 'ইফতারের বাকি',
        countdown_tomorrow: 'আগামীকালের সেহরি',
        tray_label: 'আজকের নামাজের সময়',
        loading: 'লোড হচ্ছে...',
        locale: 'bn-BD',
        country: 'বাংলাদেশ',
        ramadan_day: (d) => `দিন ${toBnNum(d)} / ৩০`,
    },
};

const prayerKeys = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
const prayerNamesBn = ['ফজর', 'সূর্যোদয়', 'যোহর', 'আসর', 'মাগরিব', 'এশা'];

// ==================== DATE & TIME ====================
function updateDateTime() {
    const now = new Date();
    const locale = i18n[currentLang].locale;

    document.getElementById('current-date').textContent =
        now.toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' });

    document.getElementById('current-time').textContent =
        now.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
}

// ==================== CITY SELECTOR ====================
function populateCitySelector() {
    const dropdown = document.getElementById('city-dropdown');
    const label = document.getElementById('city-label');
    const t = i18n[currentLang];
    const city = cities.find((c) => c.name === currentCity) || cities[0];

    label.textContent = currentLang === 'bn' ? `${city.bn}, ${t.country}` : `${city.name}, ${t.country}`;

    dropdown.innerHTML = cities
        .map((c) => {
            const name = currentLang === 'bn' ? c.bn : c.name;
            const sel = c.name === currentCity ? 'selected' : '';
            return `<div class="city-option ${sel}" data-city="${c.name}">${name}</div>`;
        })
        .join('');
}

// ==================== EVENT LISTENERS ====================
function setupEventListeners() {
    // Prayer tray toggle
    document.getElementById('toggle-tray').addEventListener('click', function () {
        this.classList.toggle('active');
        document.getElementById('full-prayer-grid').classList.toggle('active');
    });

    // Language toggle
    document.getElementById('lang-toggle').addEventListener('click', () => {
        currentLang = currentLang === 'bn' ? 'en' : 'bn';
        localStorage.setItem('selected_lang', currentLang);
        document.body.className = `bg-black text-white font-body h-screen w-screen flex justify-center items-center overflow-hidden lang-${currentLang}`;
        applyLanguage();
        updateDateTime();
    });

    // Fullscreen toggle
    document.getElementById('fullscreen-toggle').addEventListener('click', () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => { });
        } else {
            document.exitFullscreen();
        }
    });

    document.addEventListener('fullscreenchange', updateFullscreenIcon);

    // City dropdown toggle
    const cityTrigger = document.getElementById('city-trigger');
    const cityDropdown = document.getElementById('city-dropdown');
    const cityChevron = cityTrigger.querySelector('.city-chevron');

    cityTrigger.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = cityDropdown.classList.toggle('active');
        cityChevron.classList.toggle('active', isOpen);
    });

    // City option selection
    cityDropdown.addEventListener('click', (e) => {
        const opt = e.target.closest('.city-option');
        if (!opt) return;
        currentCity = opt.dataset.city;
        localStorage.setItem('selected_city', currentCity);
        cityDropdown.classList.remove('active');
        cityChevron.classList.remove('active');
        populateCitySelector();
        initApp();
    });

    // Close dropdown on outside click
    document.addEventListener('click', () => {
        cityDropdown.classList.remove('active');
        cityChevron.classList.remove('active');
    });
}

function updateFullscreenIcon() {
    const isFS = !!document.fullscreenElement;
    document.querySelector('.fullscreen-icon-enter').classList.toggle('hidden', isFS);
    document.querySelector('.fullscreen-icon-exit').classList.toggle('hidden', !isFS);
}

function applyLanguage() {
    const t = i18n[currentLang];

    // Toggle button highlights
    document.querySelector('.lang-en').classList.toggle('active', currentLang === 'en');
    document.querySelector('.lang-bn').classList.toggle('active', currentLang === 'bn');

    // Text updates
    document.querySelector('.prayer-toggle-label').textContent = t.tray_label;

    // Update city selector options
    populateCitySelector();

    // Refresh prayer grid + day counter
    const cached = getCachedTimings();
    if (cached) {
        const dayIdx = new Date().getDate() - 1;
        if (cached[dayIdx]) {
            renderPrayerGrid(cached[dayIdx].timings);
            renderRamadanDay(cached[dayIdx]);
        }
    }
}

// ==================== DATA ====================
async function initApp() {
    const cached = getCachedTimings();
    if (cached) {
        render(cached);
    } else {
        await fetchTimings();
    }
}

function getCachedTimings() {
    const key = `ramadan_${currentCity}_${todayISO()}`;
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw);
}

function todayISO() {
    return new Date().toISOString().split('T')[0];
}

async function fetchTimings() {
    const now = new Date();
    const url = `https://api.aladhan.com/v1/calendarByCity/${now.getFullYear()}/${now.getMonth() + 1}?city=${currentCity}&country=Bangladesh&method=1`;

    try {
        const res = await fetch(url);
        const json = await res.json();
        if (json.code === 200) {
            const key = `ramadan_${currentCity}_${todayISO()}`;
            localStorage.setItem(key, JSON.stringify(json.data));
            render(json.data);
        }
    } catch {
        document.getElementById('event-status').textContent = i18n[currentLang].loading;
    }
}

// ==================== RENDERING ====================
function render(calendarData) {
    const dayIdx = new Date().getDate() - 1;
    const today = calendarData[dayIdx];
    if (!today) return;

    // Hijri
    const h = today.date.hijri;
    document.getElementById('hijri-date').textContent = `${h.day} ${h.month.en} ${h.year}`;

    // Sehar / Iftar
    document.getElementById('sehar-time').textContent = to12h(today.timings.Fajr);
    document.getElementById('iftar-time').textContent = to12h(today.timings.Maghrib);

    // Ramadan day counter
    renderRamadanDay(today);

    // Prayer grid
    renderPrayerGrid(today.timings);

    // Countdown
    startCountdown(calendarData);
}

function renderRamadanDay(today) {
    const el = document.getElementById('ramadan-day');
    const h = today.date.hijri;
    const monthNum = parseInt(h.month.number);
    const day = parseInt(h.day);

    if (monthNum === 9) {
        el.textContent = i18n[currentLang].ramadan_day(day);
        el.classList.remove('hidden');
    } else {
        el.classList.add('hidden');
    }
}

function renderPrayerGrid(timings) {
    const grid = document.getElementById('full-prayer-grid');
    const names = currentLang === 'en' ? prayerKeys : prayerNamesBn;

    grid.innerHTML = prayerKeys
        .map(
            (key, i) => `
        <div class="p-item">
            <span class="p-name">${names[i]}</span>
            <span class="p-time">${to12h(timings[key])}</span>
        </div>
    `
        )
        .join('');
}

// ==================== COUNTDOWN ====================
function startCountdown(cal) {
    if (countdownInterval) clearInterval(countdownInterval);

    const statusEl = document.getElementById('event-status');
    const timerEl = document.getElementById('countdown');
    const barEl = document.getElementById('progress-fill');

    function tick() {
        const now = new Date();
        const dayIdx = now.getDate() - 1;
        if (!cal[dayIdx]) return;

        const t = i18n[currentLang];
        const timings = cal[dayIdx].timings;

        const sehar = timeToDate(now, timings.Fajr);
        const iftar = timeToDate(now, timings.Maghrib);

        let target, label, origin;

        if (now < sehar) {
            target = sehar;
            label = t.countdown_sehar;
            if (dayIdx > 0) {
                const prev = cal[dayIdx - 1].timings;
                const d = new Date(now);
                d.setDate(d.getDate() - 1);
                origin = timeToDate(d, prev.Maghrib);
            } else {
                origin = new Date(sehar.getTime() - 11 * 3600000);
            }
        } else if (now < iftar) {
            target = iftar;
            label = t.countdown_iftar;
            origin = sehar;
        } else {
            label = t.countdown_tomorrow;
            const next = cal[dayIdx + 1];
            if (next) {
                const d = new Date(now);
                d.setDate(d.getDate() + 1);
                target = timeToDate(d, next.timings.Fajr);
            } else {
                target = new Date(now.getTime() + 10 * 3600000);
            }
            origin = iftar;
        }

        const remaining = target - now;
        const total = target - origin;
        const pct = Math.max(0, Math.min(100, (1 - remaining / total) * 100));
        barEl.style.width = `${pct}%`;

        const sec = Math.max(0, Math.floor(remaining / 1000));
        const hh = String(Math.floor(sec / 3600)).padStart(2, '0');
        const mm = String(Math.floor((sec % 3600) / 60)).padStart(2, '0');
        const ss = String(sec % 60).padStart(2, '0');

        statusEl.textContent = label;
        timerEl.textContent = `${hh}:${mm}:${ss}`;
    }

    tick();
    countdownInterval = setInterval(tick, 1000);
}

function timeToDate(base, raw) {
    const [hh, mm] = raw.split(' ')[0].split(':').map(Number);
    const d = new Date(base);
    d.setHours(hh, mm, 0, 0);
    return d;
}

// ==================== PWA ====================
function registerSW() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js').catch(() => { });
    }
}

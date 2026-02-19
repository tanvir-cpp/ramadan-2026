document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    document.body.classList.add('lang-bn');
    initApp();
    setupEventListeners();
    updateDateTime();
    setInterval(updateDateTime, 1000);
});

let currentLang = 'bn';

const i18n = {
    en: {
        countdown_sehar: 'UNTIL SEHAR',
        countdown_iftar: 'UNTIL IFTAR',
        countdown_tomorrow: 'UNTIL SEHAR (TOMORROW)',
        tray_label: "Today's Prayer Times",
        location: 'Dhaka, Bangladesh',
        loading: 'Loading...',
        locale: 'en-GB',
    },
    bn: {
        countdown_sehar: 'সেহরির বাকি',
        countdown_iftar: 'ইফতারের বাকি',
        countdown_tomorrow: 'আগামীকালের সেহরি',
        tray_label: 'আজকের নামাজের সময়',
        location: 'ঢাকা, বাংলাদেশ',
        loading: 'লোড হচ্ছে...',
        locale: 'bn-BD',
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

// ==================== EVENT LISTENERS ====================
function setupEventListeners() {
    document.getElementById('toggle-tray').addEventListener('click', function () {
        this.classList.toggle('active');
        document.getElementById('full-prayer-grid').classList.toggle('active');
    });

    document.getElementById('lang-toggle').addEventListener('click', () => {
        currentLang = currentLang === 'bn' ? 'en' : 'bn';
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
    document.querySelector('.location-text').textContent = t.location;
    document.querySelector('.prayer-toggle-label').textContent = t.tray_label;

    // Refresh prayer grid
    const cached = getCachedTimings();
    if (cached) {
        const dayIdx = new Date().getDate() - 1;
        if (cached[dayIdx]) renderPrayerGrid(cached[dayIdx].timings);
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
    const raw = localStorage.getItem('ramadan_timings');
    if (!raw) return null;
    const { date, data } = JSON.parse(raw);
    return date === todayISO() ? data : null;
}

function todayISO() {
    return new Date().toISOString().split('T')[0];
}

async function fetchTimings() {
    const now = new Date();
    const url = `https://api.aladhan.com/v1/calendarByCity/${now.getFullYear()}/${now.getMonth() + 1}?city=Dhaka&country=Bangladesh&method=1`;

    try {
        const res = await fetch(url);
        const json = await res.json();
        if (json.code === 200) {
            localStorage.setItem('ramadan_timings', JSON.stringify({ date: todayISO(), data: json.data }));
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

    // Prayer grid
    renderPrayerGrid(today.timings);

    // Countdown
    startCountdown(calendarData);
}

function renderPrayerGrid(timings) {
    const grid = document.getElementById('full-prayer-grid');
    const names = currentLang === 'en' ? prayerKeys : prayerNamesBn;

    grid.innerHTML = prayerKeys.map((key, i) => `
        <div class="p-item">
            <span class="p-name">${names[i]}</span>
            <span class="p-time">${to12h(timings[key])}</span>
        </div>
    `).join('');
}

function to12h(raw) {
    const [hh, mm] = raw.split(' ')[0].split(':');
    let h = parseInt(hh);
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${h}:${mm} ${ampm}`;
}

// ==================== COUNTDOWN ====================
function startCountdown(cal) {
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
        const pct = Math.max(0, Math.min(100, ((1 - remaining / total) * 100)));
        barEl.style.width = `${pct}%`;

        const sec = Math.max(0, Math.floor(remaining / 1000));
        const hh = String(Math.floor(sec / 3600)).padStart(2, '0');
        const mm = String(Math.floor((sec % 3600) / 60)).padStart(2, '0');
        const ss = String(sec % 60).padStart(2, '0');

        statusEl.textContent = label;
        timerEl.textContent = `${hh}:${mm}:${ss}`;
    }

    tick();
    setInterval(tick, 1000);
}

function timeToDate(base, raw) {
    const [hh, mm] = raw.split(' ')[0].split(':').map(Number);
    const d = new Date(base);
    d.setHours(hh, mm, 0, 0);
    return d;
}

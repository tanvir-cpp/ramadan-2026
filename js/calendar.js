/* ==========================================
   Calendar page logic — calendar.js
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    currentLang = getSavedLang();
    currentCity = getSavedCity();
    document.body.classList.add(`lang-${currentLang}`);
    applyLang();
    loadCalendar();
    setupListeners();
});

let currentLang = 'bn';
let currentCity = 'Dhaka';

const i18n = {
    en: {
        title: 'Ramadan Calendar',
        back: 'Back',
        loading: 'Loading...',
        sehar: 'Sehar',
        iftar: 'Iftar',
        locale: 'en-GB',
        country: 'Bangladesh',
        error: 'Failed to load data',
        noData: 'No Ramadan data found',
    },
    bn: {
        title: 'রমজান ক্যালেন্ডার',
        back: 'ফিরে যান',
        loading: 'লোড হচ্ছে...',
        sehar: 'সেহরি',
        iftar: 'ইফতার',
        locale: 'bn-BD',
        country: 'বাংলাদেশ',
        error: 'ডাটা লোড ব্যর্থ',
        noData: 'রমজানের ডাটা পাওয়া যায়নি',
    },
};

// ==================== LANGUAGE ====================
function setupListeners() {
    document.getElementById('lang-toggle').addEventListener('click', () => {
        currentLang = currentLang === 'bn' ? 'en' : 'bn';
        localStorage.setItem('selected_lang', currentLang);
        document.body.className = `bg-black text-white font-body min-h-screen overflow-auto lang-${currentLang}`;
        applyLang();

        const cached = getCachedCalendar();
        if (cached) renderCalendar(cached);
    });
}

function applyLang() {
    const t = i18n[currentLang];
    document.querySelector('.lang-en').classList.toggle('active', currentLang === 'en');
    document.querySelector('.lang-bn').classList.toggle('active', currentLang === 'bn');
    document.querySelector('.calendar-title').textContent = t.title;
    document.querySelector('.back-text').textContent = t.back;

    // City label
    const city = cities.find((c) => c.name === currentCity) || cities[0];
    document.getElementById('city-label').textContent =
        currentLang === 'bn' ? `${city.bn}, ${t.country}` : `${city.name}, ${t.country}`;
}

// ==================== DATA ====================
function getCachedCalendar() {
    const raw = sessionStorage.getItem(`ramadan_cal_${currentCity}`);
    return raw ? JSON.parse(raw) : null;
}

async function loadCalendar() {
    const cached = getCachedCalendar();
    if (cached) {
        renderCalendar(cached);
        return;
    }

    const loadingText = document.querySelector('.loading-text');

    try {
        // Ramadan 2026 spans Feb–March, so fetch both months
        const [feb, mar] = await Promise.all([
            fetch(
                `https://api.aladhan.com/v1/calendarByCity/2026/2?city=${currentCity}&country=Bangladesh&method=1`
            ).then((r) => r.json()),
            fetch(
                `https://api.aladhan.com/v1/calendarByCity/2026/3?city=${currentCity}&country=Bangladesh&method=1`
            ).then((r) => r.json()),
        ]);

        const allDays = [...(feb.data || []), ...(mar.data || [])];
        const ramadanDays = allDays.filter((d) => parseInt(d.date.hijri.month.number) === 9);

        if (ramadanDays.length > 0) {
            sessionStorage.setItem(`ramadan_cal_${currentCity}`, JSON.stringify(ramadanDays));
            renderCalendar(ramadanDays);
        } else {
            loadingText.textContent = i18n[currentLang].noData;
        }
    } catch {
        loadingText.textContent = i18n[currentLang].error;
    }
}

// ==================== RENDERING ====================
function renderCalendar(days) {
    const list = document.getElementById('calendar-list');
    const loading = document.getElementById('loading');

    loading.classList.add('hidden');
    list.classList.remove('hidden');

    const now = new Date();
    const todayStr = `${String(now.getDate()).padStart(2, '0')}-${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()}`;
    const locale = i18n[currentLang].locale;
    const t = i18n[currentLang];
    const weekdays = currentLang === 'bn' ? weekdaysBn : weekdaysEn;

    list.innerHTML = days
        .map((day, i) => {
            const dayNum = i + 1;
            const greg = day.date.gregorian;
            const isToday = greg.date === todayStr;

            const gregDate = new Date(parseInt(greg.year), parseInt(greg.month.number) - 1, parseInt(greg.day));
            const dateStr = gregDate.toLocaleDateString(locale, { day: 'numeric', month: 'short' });
            const weekday = weekdays[gregDate.getDay()];

            const sehar = to12h(day.timings.Fajr);
            const iftar = to12h(day.timings.Maghrib);
            const displayNum = currentLang === 'bn' ? toBnNum(dayNum) : dayNum;

            return `
            <div class="cal-item ${isToday ? 'cal-item-today' : ''}">
                <div class="cal-badge ${isToday ? 'cal-badge-today' : ''}">${displayNum}</div>
                <div class="cal-info">
                    <div class="cal-weekday">${weekday}</div>
                    <div class="cal-date">${dateStr}</div>
                </div>
                <div class="cal-times">
                    <div class="cal-time-entry">
                        <span class="cal-time-lbl">${t.sehar}</span>
                        <span class="cal-time-val">${sehar}</span>
                    </div>
                    <div class="cal-time-entry">
                        <span class="cal-time-lbl">${t.iftar}</span>
                        <span class="cal-time-val">${iftar}</span>
                    </div>
                </div>
            </div>`;
        })
        .join('');

    const todayItem = list.querySelector('.cal-item-today');
    if (todayItem) {
        setTimeout(() => todayItem.scrollIntoView({ behavior: 'smooth', block: 'center' }), 400);
    }
}

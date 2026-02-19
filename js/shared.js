/* ==========================================
   Shared data & utilities
   Used by both app.js and calendar.js
   ========================================== */

const cities = [
    { name: 'Dhaka', bn: 'ঢাকা' },
    { name: 'Chittagong', bn: 'চট্টগ্রাম' },
    { name: 'Sylhet', bn: 'সিলেট' },
    { name: 'Rajshahi', bn: 'রাজশাহী' },
    { name: 'Khulna', bn: 'খুলনা' },
    { name: 'Barishal', bn: 'বরিশাল' },
    { name: 'Rangpur', bn: 'রংপুর' },
    { name: 'Comilla', bn: 'কুমিল্লা' },
    { name: 'Mymensingh', bn: 'ময়মনসিংহ' },
    { name: 'Gazipur', bn: 'গাজীপুর' },
];

const weekdaysEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const weekdaysBn = ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহঃ', 'শুক্র', 'শনি'];

/**
 * Convert a number to Bengali digits.
 * @param {number|string} n
 * @returns {string}
 */
function toBnNum(n) {
    return String(n).replace(/\d/g, (d) => '০১২৩৪৫৬৭৮৯'[d]);
}

/**
 * Convert 24-h "HH:MM (TZ)" string to "h:mm AM/PM".
 * @param {string} raw – e.g. "05:12 (PKT)"
 * @returns {string}
 */
function to12h(raw) {
    const [hh, mm] = raw.split(' ')[0].split(':');
    let h = parseInt(hh);
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${h}:${mm} ${ampm}`;
}

/**
 * Read the saved language from localStorage, fallback to 'bn'.
 * @returns {'bn'|'en'}
 */
function getSavedLang() {
    return localStorage.getItem('selected_lang') || 'bn';
}

/**
 * Read the saved city from localStorage, fallback to 'Dhaka'.
 * @returns {string}
 */
function getSavedCity() {
    return localStorage.getItem('selected_city') || 'Dhaka';
}

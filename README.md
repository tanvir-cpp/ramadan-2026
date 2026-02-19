# 🌙 Ramadan 2026 — রমজান ২০২৬

A beautiful, mobile-first static web app that displays **Sehar & Iftar timings**, a **live countdown**, and **daily prayer times** for Dhaka, Bangladesh during Ramadan 2026.

> **Live & lightweight** — no build tools, no frameworks, just open `index.html` and go.

---

## ✨ Features

| Feature | Description |
| --- | --- |
| ⏳ **Live Countdown** | Real-time countdown to the next Sehar or Iftar with a glowing progress bar |
| 🕌 **Prayer Times** | Expandable tray showing all six daily prayer times (Fajr → Isha) |
| 🌐 **Bilingual** | Toggle between **বাংলা** and **English** with a single tap |
| 📅 **Hijri Date** | Automatically displays the current Islamic (Hijri) date |
| 🕐 **Live Clock** | Shows the current local date and time, updated every second |
| 📱 **Mobile-First** | Designed for phones with a max-width card layout and small-screen breakpoints |
| 💾 **Offline Cache** | Prayer data is cached in `localStorage` — works after the first load without extra API calls |

---

## 🛠️ Tech Stack

- **HTML5** — Semantic markup with `lang="bn"` for accessibility
- **Tailwind CSS** (CDN) — Utility-first styling with custom `gold` palette and font families
- **Vanilla JavaScript** — Zero dependencies; handles data fetching, rendering, countdown logic, and i18n
- **Lucide Icons** (CDN) — Clean, consistent SVG icons (`map-pin`, `calendar`, `moon-star`, `utensils`, `chevron-down`)
- **Google Fonts** — *Inter*, *Outfit*, and *Noto Sans Bengali*

---

## 📂 Project Structure

```text
static_hero/
├── index.html          # Main HTML — layout, Tailwind config, CDN links
├── style.css           # Custom CSS for language toggling, prayer grid, animations
├── app.js              # Core logic — API fetch, countdown, i18n, rendering
├── assets/
│   └── hero-background.jpg   # Full-screen background image
└── README.md
```

---

## 🔌 API

Prayer timings are fetched from the **[Aladhan API](https://aladhan.com/prayer-times-api)**:

```text
GET https://api.aladhan.com/v1/calendarByCity/{year}/{month}
    ?city=Dhaka
    &country=Bangladesh
    &method=1
```

- **Method 1** — University of Islamic Sciences, Karachi
- Response includes Hijri date, all prayer times, and sunrise/sunset
- Data is cached in `localStorage` for the current day to minimize network requests

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/tanvir-cpp/ramadan-2026.git
cd ramadan-2026
```

### 2. Open in a browser

Simply open `index.html` in any modern browser — no server required.

```bash
# Or use a local server for best results:
npx serve .
```

### 3. That's it

The app will automatically fetch today's prayer timings for Dhaka and start the countdown.

---

## 🌍 Localization

The app ships with full **Bengali** and **English** support. Tap the language pill in the top-right corner to switch.

| Key | English | বাংলা |
| --- | --- | --- |
| Countdown (Sehar) | UNTIL SEHAR | সেহরির বাকি |
| Countdown (Iftar) | UNTIL IFTAR | ইফতারের বাকি |
| Location | Dhaka, Bangladesh | ঢাকা, বাংলাদেশ |
| Prayer tray | Today's Prayer Times | আজকের নামাজের সময় |

---

## 🎨 Design Highlights

- **Glassmorphism cards** — `backdrop-blur-xl` with subtle white borders
- **Gold accent system** — `#ffd700` used for icons, active states, and the progress bar glow
- **Dark cinematic background** — dimmed and saturated hero image for readability
- **Micro-animations** — hover lifts on cards, smooth chevron rotation, progress bar glow

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

**রমজান মোবারক! 🌙**
*May this Ramadan bring peace and blessings.*

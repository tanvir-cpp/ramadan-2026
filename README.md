# Ramadan 2026 🌙

Live Sehar & Iftar countdown with a full 30-day calendar — built for Bangladesh.

No frameworks, no build step — just open `index.html`.

![HTML](https://img.shields.io/badge/HTML-E34F26?style=flat&logo=html5&logoColor=white)
![CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat&logo=tailwindcss&logoColor=white)
![JS](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)
![PWA](https://img.shields.io/badge/PWA-5A0FC8?style=flat&logo=pwa&logoColor=white)

## Features

- **Live countdown** to the next Sehar or Iftar with a progress bar
- **30-day calendar** — full Ramadan timetable at a glance, today auto-highlighted
- **10 cities** — Dhaka, Chittagong, Sylhet, Rajshahi, Khulna, Barishal, Rangpur, Comilla, Mymensingh, Gazipur
- **Bengali / English** toggle — UI, dates, and numbers switch instantly
- **Prayer times tray** — Fajr through Isha in an expandable panel
- **Hijri date** and live clock in the header
- **Fullscreen mode** for a clean, immersive view
- **Installable PWA** — works offline after first load via service worker
- **Ramadan day counter** — "Day X of 30" when it's Ramadan

## How it works

Prayer times come from the [Aladhan API](https://aladhan.com/prayer-times-api) (Method 1 — University of Islamic Sciences, Karachi). The app fetches the full month's calendar once per city, caches it in `localStorage`, and handles everything else client-side — countdown, progress bar, language switching, time formatting.

The 30-day calendar fetches both February and March data, filters for Hijri month 9 (Ramadan), and renders the full timetable.

## Running locally

```bash
git clone https://github.com/tanvir-cpp/ramadan-2026.git
cd ramadan-2026
```

Open `index.html` directly, or serve it:

```bash
npx serve .
```

## Project structure

```text
├── index.html           # Main page — countdown, cards, prayer tray
├── calendar.html        # 30-day Ramadan calendar
├── manifest.json        # PWA manifest
├── sw.js                # Service worker (offline caching)
├── css/
│   └── style.css        # Custom styles (lang toggle, dropdowns, calendar cards)
├── js/
│   ├── shared.js        # Shared data — cities, utilities, helpers
│   ├── app.js           # Main page logic — countdown, API, rendering
│   └── calendar.js      # Calendar page logic — fetch, render, scroll
└── assets/
    ├── hero-background.jpg
    └── icon.svg         # PWA icon (crescent moon)
```

## Built with

- **Tailwind CSS** (CDN) — styling and layout
- **Lucide Icons** — map-pin, calendar, moon-star, utensils, chevrons
- **Google Fonts** — Inter, Outfit, Noto Sans Bengali
- **Aladhan API** — prayer time data

## License

[MIT](LICENSE)

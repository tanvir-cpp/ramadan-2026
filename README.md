# Ramadan 2026 🌙

Static single-page app showing Sehar & Iftar timings with a live countdown for Dhaka, Bangladesh.

No frameworks, no build step — just open `index.html`.

![HTML](https://img.shields.io/badge/HTML-E34F26?style=flat&logo=html5&logoColor=white)
![CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat&logo=tailwindcss&logoColor=white)
![JS](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)

## What it does

- Counts down to the next Sehar or Iftar in real time
- Shows today's six prayer times (Fajr through Isha) in an expandable tray
- Switches between Bengali and English with one tap
- Displays the Hijri date and a live clock
- Caches prayer data in `localStorage` so it works offline after the first load
- Fullscreen toggle for a clean, immersive view

## How it works

Prayer times come from the [Aladhan API](https://aladhan.com/prayer-times-api) (Method 1 — University of Islamic Sciences, Karachi). The app fetches the full month's calendar for Dhaka once, caches it for the day, and handles the rest client-side — countdown math, progress bar, language switching, time formatting.

## Running locally

```bash
git clone https://github.com/tanvir-cpp/ramadan-2026.git
cd ramadan-2026
```

Open `index.html` directly, or serve it:

```bash
npx serve .
```

## Files

```text
├── index.html      # layout + Tailwind config
├── style.css       # custom styles (lang toggle, prayer grid, animations)
├── app.js          # data fetching, countdown, i18n, rendering
└── assets/
    └── hero-background.jpg
```

## Built with

- **Tailwind CSS** (CDN) — styling and layout
- **Lucide Icons** — map-pin, calendar, moon-star, utensils, etc.
- **Google Fonts** — Inter, Outfit, Noto Sans Bengali
- **Aladhan API** — prayer time data

## License

[MIT](LICENSE)

/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./*.html', './js/*.js'],
    theme: {
        extend: {
            colors: {
                gold: '#ffd700',
                'gold-dim': 'rgba(255, 215, 0, 0.15)',
            },
            fontFamily: {
                display: ['Outfit', 'sans-serif'],
                body: ['Inter', 'sans-serif'],
                bangla: ['Noto Sans Bengali', 'sans-serif'],
            },
        },
    },
    plugins: [],
};

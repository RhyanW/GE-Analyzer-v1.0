/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
        "./pages/**/*.{js,ts,jsx,tsx}",
        "./utils/**/*.{js,ts,jsx,tsx}",
        "./hooks/**/*.{js,ts,jsx,tsx}",
        "./services/**/*.{js,ts,jsx,tsx}",
        "./*.{js,ts,jsx,tsx}"
    ],
    theme: {
        extend: {
            colors: {
                osrs: {
                    bg: 'var(--bg-primary)',
                    panel: 'var(--bg-panel)',
                    card: 'var(--bg-card)',
                    gold: 'var(--osrs-gold)',
                    yellow: 'var(--osrs-yellow)',
                    orange: 'var(--osrs-orange)',
                    border: 'var(--osrs-border)',
                    red: 'var(--osrs-red)',
                    green: 'var(--osrs-green)',
                    text: 'var(--text-primary)',
                }
            },
            fontFamily: {
                fantasy: ['Cinzel', 'serif'],
                body: ['Lato', 'sans-serif'],
            }
        },
    },
    plugins: [],
}

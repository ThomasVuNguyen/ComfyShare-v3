/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['system-ui', 'sans-serif'],
        serif: ['ui-serif', 'serif'],
        mono: ['ui-monospace', 'monospace'],
      },
      colors: {
        'app-bg': 'oklch(var(--lch-white))',
        'app-ink': 'oklch(var(--lch-black))',
        'app-link': 'oklch(var(--lch-blue))',
        'app-subtle': 'oklch(var(--lch-gray))',
        'app-subtle-light': 'oklch(var(--lch-gray-light))',
        'app-subtle-dark': 'oklch(var(--lch-gray-dark))',
      },
    },
  },
  plugins: [],
}

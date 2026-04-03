/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: '#050508',
        surface: '#0d0d14',
        border: '#1a1a28',
        accent: '#3b82f6',
        'accent-warm': '#f59e0b',
        text: '#e2e8f0',
        muted: '#475569',
        mono: '#94a3b8',
      },
      fontFamily: {
        display: ['Space Grotesk', 'DM Sans', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'IBM Plex Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // CSS-var-backed colors — respond to data-theme changes at runtime
        // The <alpha-value> placeholder enables Tailwind opacity modifiers (e.g. bg-bg/85)
        bg:           'rgb(var(--color-bg) / <alpha-value>)',
        surface:      'rgb(var(--color-surface) / <alpha-value>)',
        border:       'rgb(var(--color-border) / <alpha-value>)',
        accent:       'rgb(var(--color-accent) / <alpha-value>)',
        'accent-warm':'rgb(var(--color-accent-warm) / <alpha-value>)',
        text:         'rgb(var(--color-text) / <alpha-value>)',
        muted:        'rgb(var(--color-muted) / <alpha-value>)',
        mono:         'rgb(var(--color-mono) / <alpha-value>)',
      },
      fontFamily: {
        display: ['Space Grotesk', 'DM Sans', 'sans-serif'],
        body:    ['Inter', 'system-ui', 'sans-serif'],
        mono:    ['JetBrains Mono', 'IBM Plex Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}

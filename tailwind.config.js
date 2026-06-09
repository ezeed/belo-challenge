/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // brand primitives — do not use directly in components; use semantic tokens
        'belo-indigo': '#4920E0',
        'belo-mint': '#2EDFA4',
        // semantic tokens (see src/global.css)
        primary: 'hsl(var(--primary) / <alpha-value>)',
        'primary-foreground': 'hsl(var(--primary-foreground) / <alpha-value>)',
        background: 'hsl(var(--background) / <alpha-value>)',
        surface: 'hsl(var(--surface) / <alpha-value>)',
        'surface-muted': 'hsl(var(--surface-muted) / <alpha-value>)',
        border: 'hsl(var(--border) / <alpha-value>)',
        text: 'hsl(var(--text) / <alpha-value>)',
        'text-muted': 'hsl(var(--text-muted) / <alpha-value>)',
        positive: 'hsl(var(--positive) / <alpha-value>)',
        'positive-surface': 'hsl(var(--positive-surface) / <alpha-value>)',
        danger: 'hsl(var(--danger) / <alpha-value>)',
        'chart-up': 'hsl(var(--chart-up) / <alpha-value>)',
        'chart-down': 'hsl(var(--chart-down) / <alpha-value>)',
      },
    },
  },
  plugins: [],
};

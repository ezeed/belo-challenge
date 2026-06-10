/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  // dev-only crutch: metro serves stale compiled CSS for classes new to the
  // codebase (hot reload misses them) — pre-generate the families tweaked most
  safelist:
    process.env.NODE_ENV === 'development'
      ? [
          { pattern: /^(p|px|py|pt|pb|pl|pr|m|mx|my|mt|mb|ml|mr|gap)-\d+(\.\d+)?$/ },
          { pattern: /^(h|w)-\d+(\.\d+)?$/ },
          { pattern: /^rounded(-(sm|md|lg|xl|2xl|3xl|full))?$/ },
          { pattern: /^text-(xs|sm|base|lg|xl|[2-6]xl)$/ },
        ]
      : [],
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

import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Legacy static tokens (kept for backwards compatibility)
        'bg-base':     '#0F1117',
        'bg-card':     '#1E2029',
        'bg-sidebar':  '#0D0F15',
        'border-subtle': '#2A2D3A',
        'text-primary': '#EAEAEA',
        'text-muted':   '#888888',
        'accent-red':   '#E63946',
        'accent-blue':  '#457B9D',
        'accent-teal':  '#2A9D8F',
        'accent-gold':  '#E9C46A',
        // CSS variable-based tokens (theme-aware)
        base:    'var(--bg-base)',
        card:    'var(--bg-card)',
        sidebar: 'var(--bg-sidebar)',
        border:  'var(--border)',
        primary:    'var(--text-primary)',
        secondary:  'var(--text-secondary)',
        muted:      'var(--text-muted)',
        faint:      'var(--text-faint)',
        red:     'var(--accent-red)',
        blue:    'var(--accent-blue)',
        teal:    'var(--accent-teal)',
        gold:    'var(--accent-gold)',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config

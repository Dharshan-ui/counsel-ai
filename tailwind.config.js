/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './features/**/*.{ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Backgrounds
        base:      '#0a0a0a',
        elevated:  '#111111',
        card:      '#1a1a1a',
        // Accent
        accent:         '#d4a843',
        'accent-hover': '#e0b756',
        'accent-muted': '#8a6f2c',
        // Text
        'text-primary':   '#f5f5f5',
        'text-secondary': '#a3a3a3',
        'text-tertiary':  '#6b6b6b',
        // Borders
        'border-subtle': '#262626',
        'border-strong': '#404040',
        // Semantic
        success: '#4ade80',
        warning: '#f59e0b',
        danger:  '#ef4444',
        // Legacy compat
        background: '#0a0a0a',
        surface:    '#1a1a1a',
        surface2:   '#111111',
        muted:      '#6b6b6b',
      },
      fontFamily: {
        'sans':          ['Inter_400Regular'],
        'sans-medium':   ['Inter_500Medium'],
        'sans-semibold': ['Inter_600SemiBold'],
        'sans-bold':     ['Inter_700Bold'],
        'serif':         ['Fraunces_400Regular'],
        'serif-bold':    ['Fraunces_700Bold'],
        'serif-black':   ['Fraunces_900Black'],
      },
      borderRadius: {
        sm: '4px',
        md: '6px',
        lg: '8px',
        xl: '12px',
      },
      spacing: {
        '1':  '4px',
        '2':  '8px',
        '3':  '12px',
        '4':  '16px',
        '5':  '20px',
        '6':  '24px',
        '8':  '32px',
        '12': '48px',
        '16': '64px',
      },
    },
  },
  plugins: [],
}

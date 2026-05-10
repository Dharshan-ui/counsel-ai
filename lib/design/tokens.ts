export const colors = {
  bg: {
    base:     '#0a0a0a',
    elevated: '#111111',
    card:     '#1a1a1a',
  },
  text: {
    primary:   '#f5f5f5',
    secondary: '#a3a3a3',
    tertiary:  '#6b6b6b',
  },
  accent: {
    default: '#d4a843',
    hover:   '#e0b756',
    muted:   '#8a6f2c',
  },
  border: {
    subtle: '#262626',
    strong: '#404040',
  },
  semantic: {
    success: '#4ade80',
    warning: '#f59e0b',
    danger:  '#ef4444',
  },
} as const

export const typeScale = {
  display: { fontSize: 32, lineHeight: 40 },
  h1:      { fontSize: 24, lineHeight: 32 },
  h2:      { fontSize: 20, lineHeight: 28 },
  h3:      { fontSize: 17, lineHeight: 24 },
  body:    { fontSize: 15, lineHeight: 22 },
  small:   { fontSize: 13, lineHeight: 18 },
  tiny:    { fontSize: 11, lineHeight: 16 },
} as const

export const spacing = {
  1:  4,
  2:  8,
  3:  12,
  4:  16,
  5:  20,
  6:  24,
  8:  32,
  12: 48,
  16: 64,
} as const

export const radii = {
  sm: 4,
  md: 6,
  lg: 8,
  xl: 12,
} as const

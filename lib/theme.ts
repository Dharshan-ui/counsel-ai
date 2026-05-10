/**
 * 🎨 BRAND — central theme constants.
 *
 * Change ACCENT (and the matching tailwind.config.js color) to rebrand the
 * entire app in one edit. All components import from here instead of
 * hardcoding color strings.
 *
 * Steps to rebrand:
 *   1. Change ACCENT below to your hex color
 *   2. Change the `accent` key in tailwind.config.js to the same hex
 *   3. Optionally change BG for a different dark shade
 */

// ── Primary brand color ───────────────────────────────────────────────────────
// 🎨 Change this one value to rebrand the whole app
export const ACCENT = '#d4a843'           // amber gold

// Derived from ACCENT
export const ACCENT_DIM = 'rgba(212,168,67,0.12)'
export const ACCENT_BORDER = 'rgba(212,168,67,0.30)'
export const ACCENT_GLOW = 'rgba(212,168,67,0.20)'
export const ACCENT_LIGHT = '#e0b756'

// ── Backgrounds ───────────────────────────────────────────────────────────────
export const BG = '#0a0a0a'
export const SURFACE = '#1a1a1a'
export const SURFACE2 = '#111111'
export const SURFACE3 = '#262626'

// ── Text ──────────────────────────────────────────────────────────────────────
export const TEXT_PRIMARY = '#f5f5f5'
export const TEXT_SECONDARY = '#a3a3a3'
export const TEXT_TERTIARY = '#6b6b6b'
export const TEXT_DISABLED = 'rgba(245,245,245,0.18)'

// ── Borders ───────────────────────────────────────────────────────────────────
export const BORDER = 'rgba(255,255,255,0.09)'
export const BORDER_ACTIVE = 'rgba(255,255,255,0.18)'

// ── Semantic ──────────────────────────────────────────────────────────────────
export const ERROR = '#f87171'
export const ERROR_DIM = 'rgba(248,113,113,0.10)'
export const WARNING = '#fbbf24'
export const SUCCESS = '#4ade80'

// ── Tab bar ───────────────────────────────────────────────────────────────────
export const TAB_ACTIVE = ACCENT
export const TAB_INACTIVE = 'rgba(255,255,255,0.40)'
export const TAB_HEIGHT = 68

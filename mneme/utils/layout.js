// Geometry and shared visual constants for a round glass, per DESIGN.md.
// Designed on the 466 x 466 Amazfit Active 2 Round; s() rescales every
// measurement for another round device.
import { getDeviceInfo } from '@zos/device'

const info = getDeviceInfo() || {}
export const W = info.width || 466
export const H = info.height || 466
export const CX = Math.floor(W / 2)
export const R = W / 2

export function s(v) {
  return Math.round((v * W) / 466)
}

// The screen is two equal halves. Each field is its half plus a third of a
// half past the midline, so the fields overlap through the middle third of
// the screen. Both bleed past the visible edge on their outer sides.
export const BLEED = s(20)
export const HALF = Math.round(H / 2) // the midline, 233 on 466
export const INTRUDE = Math.round(HALF / 3) // how far each field crosses the midline, 78
export const OVERLAP_TOP = HALF - INTRUDE // 155: top of the band, top of the overlap
export const OVERLAP_BOTTOM = HALF + INTRUDE // 311: bottom of the primary field, bottom of the overlap
export const FEATHER_STEPS = 8 // the band fades in over the whole overlap in this many strips

function field(x, y, w, h, textTop, textBottom) {
  return {
    x: Math.round(x),
    y: Math.round(y),
    w: Math.round(w),
    h: Math.round(h),
    cx: x + w / 2,
    cy: y + h / 2,
    // text keeps to its own half so the two texts can never collide;
    // only the fields, and the feather, share the middle third
    top: textTop,
    bottom: textBottom
  }
}

export const PRIMARY = field(-BLEED, -BLEED, W + 2 * BLEED, OVERLAP_BOTTOM + BLEED, -BLEED, HALF)
export const BAND = field(-BLEED, OVERLAP_TOP, W + 2 * BLEED, H + BLEED - OVERLAP_TOP, HALF, H + BLEED)

// Whole-screen tap zones, split at the midline.
export const ZONE_TOP = { x: 0, y: 0, w: W, h: HALF }
export const ZONE_BOTTOM = { x: 0, y: HALF, w: W, h: H - HALF }

// Hairline progress ring at the very edge, drawn before the text.
export const RING = { x: s(2), y: s(2), w: W - s(4), h: H - s(4), width: s(3) }

export const COLORS = {
  ground: 0x000000,
  primary: 0xededed,
  secondary: 0xc9cfea,
  band: 0x2b3160,
  ring: 0x5a6edc,
  again: 0xd8434e,
  hard: 0xe08a2e,
  good: 0x3fa35b,
  easy: 0x3b82f6
}
export const ALPHA = { latent: 90, resolved: 200 }

// Bundled Noto Sans subset with Latin, Greek and polytonic Greek Extended.
export const FONT = 'fonts/NotoSansGreek-Regular.ttf'

// Text sizes: the comfortable floor is a setting (calibrated at 52 on the
// user's eyes); the hard floor is where content is declared too long.
export const DEFAULT_FLOOR = 52
export const HARD_FLOOR = 32
export const MAX_SIZE = 300
export const FLASH_MS = 200

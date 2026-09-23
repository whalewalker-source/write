// Screen geometry and shared visual constants.
// Designed on a 466x466 round face (Amazfit Active 2 Round); s() rescales
// every measurement if the app is ever installed on another round device.
import { getDeviceInfo } from '@zos/device'

const info = getDeviceInfo() || {}
export const W = info.width || 466
export const H = info.height || 466
export const CX = Math.floor(W / 2)

export function s(v) {
  return Math.round((v * W) / 466)
}

export const COLORS = {
  bg: 0x000000,
  text: 0xffffff,
  soft: 0xdde1ff,
  muted: 0x9aa0b4,
  button: 0x2a2f4a,
  press: 0x3a4166,
  accent: 0x5a6edc,
  again: 0xd8434e,
  hard: 0xe08a2e,
  good: 0x3fa35b,
  easy: 0x3b82f6
}

// Bundled subset of Noto Sans with Latin, Greek and polytonic Greek Extended.
// Lives in assets/<target>/fonts/. If the firmware ignores the font property
// the widgets fall back to the system font.
export const FONT = 'fonts/NotoSansGreek-Regular.ttf'

// Pick a text size that keeps a card face inside its box.
export function sizeFor(text, big) {
  const n = (text || '').length
  if (big) {
    if (n <= 12) return s(46)
    if (n <= 20) return s(38)
    if (n <= 34) return s(32)
    return s(26)
  }
  if (n <= 14) return s(38)
  if (n <= 24) return s(32)
  if (n <= 40) return s(26)
  return s(22)
}

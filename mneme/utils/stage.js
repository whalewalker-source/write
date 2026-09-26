// The stage: the two-field superposition layout every screen is built on.
//
//   layer 0  tap zones (ground colour) and the progress ring
//   layer 1  primary text, filling the primary field
//   layer 2  the band (translucent, feathered along its top) and the
//            secondary text filling it
//
// Boxes never move; only text sizes change, so text grows and shrinks about
// each field's centre. Where the band overlaps the primary field, the
// primary's rows show through the feather, tinted back in steps.
// Feedback is a band flash and a haptic, never words.
import { createWidget, widget, align, text_style, prop, getTextLayout } from '@zos/ui'
import {
  Vibrator,
  VIBRATOR_SCENE_SHORT_LIGHT,
  VIBRATOR_SCENE_SHORT_MIDDLE,
  VIBRATOR_SCENE_SHORT_STRONG
} from '@zos/sensor'
import {
  R,
  BLEED,
  OVERLAP_TOP,
  OVERLAP_BOTTOM,
  FEATHER_STEPS,
  PRIMARY,
  BAND,
  ZONE_TOP,
  ZONE_BOTTOM,
  RING,
  COLORS,
  ALPHA,
  FONT,
  HARD_FLOOR,
  MAX_SIZE,
  FLASH_MS,
  DEFAULT_FLOOR
} from './layout'
import { fitText } from './fit'

function zone(box, onTap) {
  return createWidget(widget.BUTTON, {
    x: box.x,
    y: box.y,
    w: box.w,
    h: box.h,
    normal_color: COLORS.ground,
    press_color: COLORS.ground,
    text: '',
    click_func: () => onTap && onTap()
  })
}

function textField(box, color, size) {
  return createWidget(widget.TEXT, {
    x: box.x,
    y: box.y,
    w: box.w,
    h: box.h,
    color,
    text_size: size,
    align_h: align.CENTER_H,
    align_v: align.CENTER_V,
    text_style: text_style.WRAP,
    font: FONT,
    text: ''
  })
}

// The band is a stack of strips: FEATHER_STEPS strips of rising alpha that
// fade the band in across the whole overlap zone, then the body from the
// bottom of the primary field down. `weight` is each strip's share of the
// full alpha (0..1); the body is 1. The primary's rows that reach into the
// overlap show through the strips, tinted back in steps.
function buildBand() {
  const strips = []
  const feather = OVERLAP_BOTTOM - OVERLAP_TOP
  const stripH = Math.max(1, Math.round(feather / FEATHER_STEPS))
  for (let i = 0; i < FEATHER_STEPS; i++) {
    const weight = (i + 1) / (FEATHER_STEPS + 1)
    const rect = createWidget(widget.FILL_RECT, {
      x: BAND.x,
      y: OVERLAP_TOP + i * stripH,
      w: BAND.w,
      h: stripH,
      color: COLORS.band,
      alpha: Math.round(ALPHA.latent * weight)
    })
    strips.push({ rect, weight })
  }
  const bodyY = OVERLAP_TOP + FEATHER_STEPS * stripH
  const body = createWidget(widget.FILL_RECT, {
    x: BAND.x,
    y: bodyY,
    w: BAND.w,
    h: BAND.y + BAND.h - bodyY,
    color: COLORS.band,
    alpha: ALPHA.latent
  })
  strips.push({ rect: body, weight: 1 })
  return strips
}

export function createStage(opts) {
  const state = { floor: (opts && opts.floor) || DEFAULT_FLOOR, timer: null }
  let vibrator = null
  try {
    vibrator = new Vibrator()
  } catch (e) {
    vibrator = null
  }

  zone(ZONE_TOP, opts && opts.onTapTop)
  zone(ZONE_BOTTOM, opts && opts.onTapBottom)

  const ring = createWidget(widget.ARC, {
    x: RING.x,
    y: RING.y,
    w: RING.w,
    h: RING.h,
    start_angle: -90,
    end_angle: -89,
    color: COLORS.ring,
    line_width: RING.width
  })
  const primary = textField(PRIMARY, COLORS.primary, state.floor)
  const band = buildBand()
  const secondary = textField(BAND, COLORS.secondary, state.floor)

  function paintBand(color, alpha) {
    for (let i = 0; i < band.length; i++) {
      band[i].rect.setProperty(prop.MORE, { color, alpha: Math.round(alpha * band[i].weight) })
    }
  }

  function fit(text, box, maxRows) {
    return fitText(getTextLayout, text, box, {
      maxRows,
      floor: state.floor,
      hardFloor: HARD_FLOOR,
      maxSize: MAX_SIZE,
      radius: R,
      bleed: BLEED
    })
  }

  function clearTimer() {
    if (state.timer) {
      clearTimeout(state.timer)
      state.timer = null
    }
  }

  return {
    setFloor(v) {
      state.floor = v || DEFAULT_FLOOR
    },

    // Fill the primary field. Returns the fit (size, rows, below, truncated).
    setPrimary(text) {
      const t = text ? String(text) : ''
      if (!t) {
        primary.setProperty(prop.TEXT, '')
        return null
      }
      const f = fit(t, PRIMARY, 3)
      primary.setProperty(prop.MORE, { text_size: f.size, text: f.text })
      return f
    },

    // Fill the band's field, or clear it.
    setSecondary(text) {
      const t = text ? String(text) : ''
      if (!t) {
        secondary.setProperty(prop.TEXT, '')
        return null
      }
      const f = fit(t, BAND, 2)
      secondary.setProperty(prop.MORE, { text_size: f.size, text: f.text })
      return f
    },

    // Latent: the band exists but holds nothing readable yet.
    setLatent(latent) {
      clearTimer()
      paintBand(COLORS.band, latent ? ALPHA.latent : ALPHA.resolved)
    },

    // Feedback: the band takes a colour for FLASH_MS, then `then` runs.
    flash(color, then) {
      clearTimer()
      paintBand(color, ALPHA.resolved)
      state.timer = setTimeout(() => {
        state.timer = null
        if (then) then()
      }, FLASH_MS)
    },

    // Progress as a fraction of the circle, clockwise from twelve.
    setRing(fraction) {
      const f = Math.max(0, Math.min(1, fraction || 0))
      ring.setProperty(prop.MORE, { start_angle: -90, end_angle: -90 + Math.max(1, Math.round(360 * f)) })
    },

    setRingColor(color) {
      ring.setProperty(prop.MORE, { color })
    },

    haptic(kind) {
      if (!vibrator) return
      try {
        const mode =
          kind === 'strong'
            ? VIBRATOR_SCENE_SHORT_STRONG
            : kind === 'middle'
              ? VIBRATOR_SCENE_SHORT_MIDDLE
              : VIBRATOR_SCENE_SHORT_LIGHT
        vibrator.start({ mode })
      } catch (e) {
        // haptics are best effort
      }
    },

    destroy() {
      clearTimer()
    }
  }
}

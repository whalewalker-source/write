// Fit text to a field on a round glass.
//
// Finds the largest text size at which the text, wrapped inside the field's
// width, needs at most `maxRows` rows, fits the field's height, and keeps
// every row inside the circle plus the bleed allowance. Pure: `measure` is
// injected. On the watch it is getTextLayout from @zos/ui; tests pass a fake.
//
//   measure(text, { text_size, text_width, wrapped: 1, rows_max })
//     -> { width, height, rows, result, text }   result 0 ok, 1 truncated, -1 error
//
// field: { w, h, cy, top?, bottom? }
//        cy is the field's vertical centre in glass pixels; top and bottom,
//        when given, are limits the centred text block may not cross (used
//        to keep each text in its own half of the screen)
// opts:  { maxRows, floor, hardFloor, maxSize, radius, bleed }
//
// Returns { size, rows, text, below, truncated }. `below` means the text only
// fits under the comfortable floor; `truncated` means it did not fit even at
// the hard floor and the engine's shortened text should be shown.

export function fitText(measure, text, field, opts) {
  const maxRows = opts.maxRows || 3
  const hard = opts.hardFloor || 32
  const floor = Math.max(hard, opts.floor || hard)
  const maxSize = opts.maxSize || 300
  const radius = opts.radius
  const bleed = opts.bleed || 0

  const chordAt = (y) => {
    const d = Math.abs(y - radius)
    return d >= radius ? 0 : 2 * Math.sqrt(radius * radius - d * d)
  }
  const minChord = (y0, y1) => {
    let m = Infinity
    for (let k = 0; k <= 8; k++) {
      const c = chordAt(y0 + ((y1 - y0) * k) / 8)
      if (c < m) m = c
    }
    return m
  }

  const check = (size) => {
    const lay = measure(text, { text_size: size, text_width: field.w, wrapped: 1, rows_max: maxRows })
    if (!lay || lay.result === -1 || lay.result === 1) return null
    if (lay.height > field.h) return null
    const half = lay.height / 2
    if (field.top !== undefined && field.cy - half < field.top) return null
    if (field.bottom !== undefined && field.cy + half > field.bottom) return null
    const rows = Math.max(1, lay.rows || 1)
    const rowH = lay.height / rows
    const top = field.cy - half
    for (let i = 0; i < rows; i++) {
      const allowed = Math.min(field.w, minChord(top + i * rowH, top + (i + 1) * rowH) + 2 * bleed)
      if (lay.width > allowed) return null
    }
    return lay
  }

  const search = (lo, hi) => {
    let best = 0
    let bestLay = null
    while (lo <= hi) {
      const mid = (lo + hi) >> 1
      const lay = check(mid)
      if (lay) {
        best = mid
        bestLay = lay
        lo = mid + 1
      } else {
        hi = mid - 1
      }
    }
    return { size: best, lay: bestLay }
  }

  let r = search(floor, maxSize)
  if (r.size) return { size: r.size, rows: r.lay.rows || 1, text, below: false, truncated: false }

  if (hard < floor) {
    r = search(hard, floor - 1)
    if (r.size) return { size: r.size, rows: r.lay.rows || 1, text, below: true, truncated: false }
  }

  const lay = measure(text, { text_size: hard, text_width: field.w, wrapped: 1, rows_max: maxRows })
  return {
    size: hard,
    rows: (lay && lay.rows) || maxRows,
    text: (lay && lay.text) || text,
    below: true,
    truncated: true
  }
}

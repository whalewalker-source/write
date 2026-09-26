import { test } from 'node:test'
import assert from 'node:assert/strict'
import { fitText } from '../utils/fit.js'

// A stand-in for getTextLayout: Noto Sans average advance 0.56 em, row
// height 1.16 em, greedy wrapping at spaces, truncation past rows_max.
function fakeMeasure(text, o) {
  const adv = 0.56 * o.text_size
  const rowH = 1.16 * o.text_size
  const words = text.split(' ')
  const rows = []
  let cur = ''
  for (const w of words) {
    const cand = cur ? cur + ' ' + w : w
    if (!cur || cand.length * adv <= o.text_width) cur = cand
    else {
      rows.push(cur)
      cur = w
    }
  }
  rows.push(cur)
  const truncated = o.rows_max ? rows.length > o.rows_max : false
  const shown = truncated ? rows.slice(0, o.rows_max) : rows
  const width = Math.max(...shown.map((r) => r.length * adv))
  return {
    width,
    height: shown.length * rowH,
    rows: shown.length,
    result: truncated ? 1 : 0,
    text: truncated ? shown.join(' ') + '…' : text
  }
}

// 466 glass, equal halves, each field a third of a half past the midline,
// bleed 20; text keeps to its own half. The fields from DESIGN.md.
const PRIMARY = { w: 506, h: 331, cy: 145.5, top: -20, bottom: 233 }
const BAND = { w: 506, h: 331, cy: 320.5, top: 233, bottom: 486 }
const OPTS = { radius: 233, bleed: 20, floor: 52, hardFloor: 32, maxSize: 300 }

test('a short word fills the primary field', () => {
  const f = fitText(fakeMeasure, 'λόγος', PRIMARY, { ...OPTS, maxRows: 3 })
  assert.ok(f.size >= 115 && f.size <= 145, `got ${f.size}`)
  assert.equal(f.rows, 1)
  assert.equal(f.below, false)
})

test('the primary text block never crosses the midline', () => {
  const f = fitText(fakeMeasure, 'ω', PRIMARY, { ...OPTS, maxRows: 3 })
  assert.ok(f.size >= 140 && f.size <= 152, `got ${f.size}`)
  assert.ok(145.5 + (1.16 * f.size) / 2 <= 233 + 0.01)
})

test('a dictionary form wraps to two rows above the comfortable floor', () => {
  const f = fitText(fakeMeasure, 'ἄνθρωπος, ἀνθρώπου, ὁ', PRIMARY, { ...OPTS, maxRows: 3 })
  assert.ok(f.size >= 55, `got ${f.size}`)
  assert.equal(f.rows, 2)
  assert.equal(f.below, false)
})

test('a two-digit count fills the band without crossing the midline', () => {
  const f = fitText(fakeMeasure, '12', BAND, { ...OPTS, maxRows: 2 })
  assert.ok(f.size >= 140 && f.size <= 152, `got ${f.size}`)
  assert.ok(320.5 - (1.16 * f.size) / 2 >= 233 - 0.01)
})

test('a twenty-character gloss stays above the floor in the band', () => {
  const f = fitText(fakeMeasure, 'become, be born, happ', BAND, { ...OPTS, maxRows: 2 })
  assert.ok(f.size >= 52, `got ${f.size}`)
  assert.equal(f.below, false)
})

test('a long gloss drops below the comfortable floor but not the hard floor', () => {
  const f = fitText(fakeMeasure, 'word, speech; account, reason', BAND, { ...OPTS, maxRows: 2 })
  assert.equal(f.below, true)
  assert.equal(f.truncated, false)
  assert.ok(f.size >= 32 && f.size < 52, `got ${f.size}`)
})

test('hopeless text is truncated at the hard floor', () => {
  const long = 'on the one hand this and on the other hand that and then a third thing besides which is far too much'
  const f = fitText(fakeMeasure, long, BAND, { ...OPTS, maxRows: 2 })
  assert.equal(f.truncated, true)
  assert.equal(f.size, 32)
  assert.ok(f.text.endsWith('…'))
})

test('the chord rule bites: a field centred near the top of the glass fits less', () => {
  const high = { w: 506, h: 120, cy: 40 }
  const low = { w: 506, h: 120, cy: 233 }
  const a = fitText(fakeMeasure, 'λόγος', high, { ...OPTS, maxRows: 1 })
  const b = fitText(fakeMeasure, 'λόγος', low, { ...OPTS, maxRows: 1 })
  assert.ok(a.size < b.size, `${a.size} should be smaller than ${b.size}`)
})

test('bleed widens what fits', () => {
  const none = fitText(fakeMeasure, 'θάλαττα', PRIMARY, { ...OPTS, bleed: 0, maxRows: 1 })
  const some = fitText(fakeMeasure, 'θάλαττα', PRIMARY, { ...OPTS, bleed: 20, maxRows: 1 })
  assert.ok(some.size >= none.size)
})

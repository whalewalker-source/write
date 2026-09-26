import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  GRADE,
  STATE,
  MIN_EASE,
  MAX_INTERVAL,
  REQUEUE_GAP,
  dayIndex,
  newCard,
  pack,
  unpack,
  schedule,
  buildQueue,
  requeue,
  deckCounts
} from '../utils/scheduler.js'

const TODAY = 20000

test('dayIndex rolls over at 4am local time', () => {
  // 2026-01-10 03:59 local (tz offset 0) still belongs to the 9th
  const before = Date.UTC(2026, 0, 10, 3, 59)
  const after = Date.UTC(2026, 0, 10, 4, 0)
  assert.equal(dayIndex(after, 0) - dayIndex(before, 0), 1)
  // timezone offset shifts the boundary
  assert.equal(dayIndex(Date.UTC(2026, 0, 10, 4, 0), 60), dayIndex(before, 0))
})

test('pack/unpack round-trips and tolerates garbage', () => {
  const c = { s: 2, i: 12, e: 235, d: 20010, r: 7, l: 1 }
  assert.deepEqual(unpack(pack(c)), c)
  assert.deepEqual(unpack(null), newCard())
  assert.deepEqual(unpack([1, 2]), newCard())
})

test('new card: Good graduates to 1 day, Easy to 4 days with an ease bonus', () => {
  const good = schedule(newCard(), GRADE.GOOD, TODAY)
  assert.equal(good.requeue, false)
  assert.equal(good.card.s, STATE.REVIEW)
  assert.equal(good.card.i, 1)
  assert.equal(good.card.d, TODAY + 1)

  const easy = schedule(newCard(), GRADE.EASY, TODAY)
  assert.equal(easy.card.i, 4)
  assert.equal(easy.card.d, TODAY + 4)
  assert.equal(easy.card.e, 265)
})

test('new card: Again and Hard keep it in the session', () => {
  for (const g of [GRADE.AGAIN, GRADE.HARD]) {
    const r = schedule(newCard(), g, TODAY)
    assert.equal(r.requeue, true)
    assert.equal(r.card.s, STATE.LEARN)
    assert.equal(r.card.d, TODAY)
    assert.equal(r.card.r, 1)
  }
})

test('review card: Good multiplies by ease, Hard grows 20 percent, Easy adds a bonus', () => {
  const base = { s: STATE.REVIEW, i: 10, e: 250, d: TODAY, r: 3, l: 0 }
  assert.equal(schedule(base, GRADE.GOOD, TODAY).card.i, 25)
  const hard = schedule(base, GRADE.HARD, TODAY).card
  assert.equal(hard.i, 12)
  assert.equal(hard.e, 235)
  const easy = schedule(base, GRADE.EASY, TODAY).card
  assert.equal(easy.i, Math.round(10 * 2.5 * 1.3))
  assert.equal(easy.e, 265)
  // interval always moves forward by at least a day
  const tiny = { s: STATE.REVIEW, i: 1, e: MIN_EASE, d: TODAY, r: 1, l: 0 }
  assert.ok(schedule(tiny, GRADE.HARD, TODAY).card.i >= 2)
})

test('review card: lateness is credited', () => {
  const late = { s: STATE.REVIEW, i: 10, e: 250, d: TODAY - 10, r: 3, l: 0 }
  // (10 + 10/2) * 2.5 = 37.5 -> 38
  assert.equal(schedule(late, GRADE.GOOD, TODAY).card.i, 38)
})

test('review card: Again is a lapse that relearns today and graduates short', () => {
  const base = { s: STATE.REVIEW, i: 30, e: 250, d: TODAY, r: 5, l: 0 }
  const lapse = schedule(base, GRADE.AGAIN, TODAY)
  assert.equal(lapse.requeue, true)
  assert.equal(lapse.card.s, STATE.LEARN)
  assert.equal(lapse.card.l, 1)
  assert.equal(lapse.card.e, 230)
  assert.equal(lapse.card.i, 6)
  const back = schedule(lapse.card, GRADE.GOOD, TODAY)
  assert.equal(back.card.s, STATE.REVIEW)
  assert.equal(back.card.i, 6)
  assert.equal(back.card.d, TODAY + 6)
})

test('ease never drops below the floor and intervals are capped', () => {
  let c = { s: STATE.REVIEW, i: 700, e: MIN_EASE, d: TODAY, r: 1, l: 0 }
  c = schedule(c, GRADE.AGAIN, TODAY).card
  assert.equal(c.e, MIN_EASE)
  c = { s: STATE.REVIEW, i: 700, e: 300, d: TODAY, r: 1, l: 0 }
  assert.equal(schedule(c, GRADE.EASY, TODAY).card.i, MAX_INTERVAL)
})

test('buildQueue orders learn, then overdue reviews, then limited new cards', () => {
  const cards = ['a', 'b', 'c', 'd', 'e', 'f'].map((id) => ({ id }))
  const progress = {
    a: { s: STATE.REVIEW, i: 3, e: 250, d: TODAY - 1, r: 1, l: 0 },
    b: { s: STATE.REVIEW, i: 3, e: 250, d: TODAY - 5, r: 1, l: 0 },
    c: { s: STATE.REVIEW, i: 3, e: 250, d: TODAY + 2, r: 1, l: 0 },
    d: { s: STATE.LEARN, i: 1, e: 250, d: TODAY, r: 1, l: 1 }
  }
  const { queue, counts } = buildQueue(cards, progress, TODAY, 1)
  assert.deepEqual(queue, ['d', 'b', 'a', 'e'])
  assert.deepEqual(counts, { learn: 1, due: 2, fresh: 1, freshTotal: 2 })
  assert.deepEqual(buildQueue(cards, progress, TODAY, 0).queue, ['d', 'b', 'a'])
  assert.deepEqual(buildQueue(cards, progress, TODAY, -3).queue, ['d', 'b', 'a'])
})

test('requeue inserts a few positions ahead, or at the end of a short queue', () => {
  assert.deepEqual(requeue(['1', '2', '3', '4', '5', '6'], 'x'), ['1', '2', '3', '4', 'x', '5', '6'])
  assert.equal(REQUEUE_GAP, 4)
  assert.deepEqual(requeue(['1'], 'x'), ['1', 'x'])
  assert.deepEqual(requeue([], 'x'), ['x'])
})

test('deckCounts summarises a deck', () => {
  const cards = ['a', 'b', 'c'].map((id) => ({ id }))
  const progress = {
    a: { s: STATE.REVIEW, i: 3, e: 250, d: TODAY - 1, r: 1, l: 0 },
    b: { s: STATE.REVIEW, i: 3, e: 250, d: TODAY + 3, r: 1, l: 0 }
  }
  assert.deepEqual(deckCounts(cards, progress, TODAY), { due: 1, fresh: 1, learned: 2, total: 3 })
})

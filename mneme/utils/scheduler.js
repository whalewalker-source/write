// Spaced-repetition scheduler. Pure functions, no Zepp OS imports, so it
// runs unchanged in the watch runtime (QuickJS) and under Node for tests.
//
// The model is a trimmed SM-2 in the Anki style:
//   - a card is NEW until you grade it, then LEARN (same session) or REVIEW
//   - REVIEW cards carry an interval in days and an ease factor (x100)
//   - Again on a REVIEW card is a lapse: ease drops, the card comes back
//     later in the same session and graduates with a short interval
//
// Card state is a small object so it packs to a JSON array on disk:
//   s  state           0 new, 1 learn, 2 review
//   i  interval, days
//   e  ease x100       250 means 2.5
//   d  due day index   see dayIndex()
//   r  reps
//   l  lapses

export const GRADE = { AGAIN: 1, HARD: 2, GOOD: 3, EASY: 4 }
export const STATE = { NEW: 0, LEARN: 1, REVIEW: 2 }

export const MIN_EASE = 130
export const START_EASE = 250
export const MAX_INTERVAL = 730
export const GRADUATE_DAYS = 1
export const EASY_DAYS = 4
export const REQUEUE_GAP = 4
export const ROLLOVER_HOUR = 4

const DAY_MS = 86400000

// Local calendar day, with the day rolling over at ROLLOVER_HOUR (4am) so a
// late-night session and the next morning count as the same study day.
// tzOffsetMin follows Date#getTimezoneOffset (minutes west of UTC).
export function dayIndex(now, tzOffsetMin) {
  if (now === undefined) now = Date.now()
  if (tzOffsetMin === undefined) tzOffsetMin = new Date(now).getTimezoneOffset()
  return Math.floor((now - tzOffsetMin * 60000 - ROLLOVER_HOUR * 3600000) / DAY_MS)
}

export function newCard() {
  return { s: STATE.NEW, i: 0, e: START_EASE, d: 0, r: 0, l: 0 }
}

export function pack(c) {
  return [c.s, c.i, c.e, c.d, c.r, c.l]
}

export function unpack(a) {
  if (!a || a.length < 6) return newCard()
  return { s: a[0], i: a[1], e: a[2], d: a[3], r: a[4], l: a[5] }
}

function clampInterval(days) {
  return Math.min(MAX_INTERVAL, Math.max(1, Math.round(days)))
}

// Returns { card, requeue }. requeue=true means "show it again later in this
// session" (learning step); the caller decides where in the queue it goes.
export function schedule(c, grade, today) {
  const n = { s: c.s, i: c.i, e: c.e, d: c.d, r: c.r + 1, l: c.l }

  if (c.s === STATE.REVIEW) {
    const late = Math.max(0, today - c.d)
    if (grade === GRADE.AGAIN) {
      n.l += 1
      n.s = STATE.LEARN
      n.e = Math.max(MIN_EASE, c.e - 20)
      // interval it will graduate to after the relearn step
      n.i = clampInterval(c.i * 0.2)
      n.d = today
      return { card: n, requeue: true }
    }
    if (grade === GRADE.HARD) {
      n.e = Math.max(MIN_EASE, c.e - 15)
      n.i = clampInterval(Math.max(c.i + 1, c.i * 1.2))
    } else if (grade === GRADE.GOOD) {
      n.i = clampInterval(Math.max(c.i + 1, ((c.i + late / 2) * c.e) / 100))
    } else {
      n.e = c.e + 15
      n.i = clampInterval(Math.max(c.i + 1, (((c.i + late) * c.e) / 100) * 1.3))
    }
    n.d = today + n.i
    return { card: n, requeue: false }
  }

  // NEW or LEARN
  if (grade === GRADE.AGAIN || grade === GRADE.HARD) {
    n.s = STATE.LEARN
    n.d = today
    return { card: n, requeue: true }
  }
  n.s = STATE.REVIEW
  if (grade === GRADE.GOOD) {
    // a relearning card keeps the post-lapse interval computed at lapse time
    n.i = c.s === STATE.LEARN && c.i > 0 ? c.i : GRADUATE_DAYS
  } else {
    n.i = Math.max(EASY_DAYS, c.i)
    n.e = c.e + 15
  }
  n.d = today + n.i
  return { card: n, requeue: false }
}

// Build today's session queue for one deck.
//   cards     deck cards, in deck order (used as the order new cards appear)
//   progress  map cardId -> card state (unpacked)
//   today     dayIndex()
//   newAllowed how many not-yet-seen cards may be introduced
// Returns { queue: [cardId], counts: { learn, due, fresh, freshTotal } }.
export function buildQueue(cards, progress, today, newAllowed) {
  const learn = []
  const due = []
  const fresh = []
  for (let k = 0; k < cards.length; k++) {
    const id = cards[k].id
    const st = progress[id]
    if (!st || st.s === STATE.NEW) fresh.push(id)
    else if (st.d <= today) (st.s === STATE.LEARN ? learn : due).push(id)
  }
  due.sort((a, b) => progress[a].d - progress[b].d)
  const allowed = Math.max(0, newAllowed | 0)
  const picked = fresh.slice(0, allowed)
  return {
    queue: learn.concat(due, picked),
    counts: { learn: learn.length, due: due.length, fresh: picked.length, freshTotal: fresh.length }
  }
}

// Put a card back into the queue a few positions ahead.
export function requeue(queue, id) {
  const at = Math.min(REQUEUE_GAP, queue.length)
  queue.splice(at, 0, id)
  return queue
}

// Summary counts for a deck list row.
export function deckCounts(cards, progress, today) {
  let due = 0
  let fresh = 0
  let learned = 0
  for (let k = 0; k < cards.length; k++) {
    const st = progress[cards[k].id]
    if (!st || st.s === STATE.NEW) fresh++
    else {
      learned++
      if (st.d <= today) due++
    }
  }
  return { due, fresh, learned, total: cards.length }
}

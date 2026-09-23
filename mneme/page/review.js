// Review session for one deck: show front, reveal, grade, repeat.
import { createWidget, widget, align, text_style, prop, showToast } from '@zos/ui'
import { back } from '@zos/router'
import { setScrollLock } from '@zos/page'
import {
  setPageBrightTime,
  resetPageBrightTime,
  pauseDropWristScreenOff,
  resetDropWristScreenOff
} from '@zos/display'
import { log as Logger } from '@zos/utils'
import { BasePage } from '@zeppos/zml/base-page'
import { W, CX, s, COLORS, FONT, sizeFor } from '../utils/layout'
import { loadDeck } from '../utils/decks'
import { loadProgress, saveProgress, loadSettings } from '../utils/store'
import { GRADE, STATE, dayIndex, newCard, schedule, buildQueue, requeue } from '../utils/scheduler'

const logger = Logger.getLogger('mneme-review')
const EXTRA_NEW = 10

// Card face boxes (466 design). The front sits large and centred until the
// answer is revealed, then moves up to make room for the back and the note.
const FRONT_BIG = { x: 48, y: 64, w: 466 - 96, h: 236 }
const FRONT_TOP = { x: 48, y: 56, w: 466 - 96, h: 92 }
const BACK_BOX = { x: 44, y: 150, w: 466 - 88, h: 106 }
const NOTE_BOX = { x: 40, y: 256, w: 466 - 80, h: 50 }

function box(b) {
  return { x: s(b.x), y: s(b.y), w: s(b.w), h: s(b.h) }
}

function show(w, visible) {
  if (w) w.setProperty(prop.VISIBLE, !!visible)
}

function textWidget(b, size, color, extra) {
  return createWidget(
    widget.TEXT,
    Object.assign(
      box(b),
      {
        color,
        text_size: size,
        align_h: align.CENTER_H,
        align_v: align.CENTER_V,
        text_style: text_style.WRAP,
        text: ''
      },
      extra || {}
    )
  )
}

function button(x, y, w, h, label, color, size, onClick) {
  return createWidget(widget.BUTTON, {
    x: s(x),
    y: s(y),
    w: s(w),
    h: s(h),
    radius: s(Math.min(h, 56) / 2),
    normal_color: color,
    press_color: color,
    text: label,
    text_size: s(size),
    color: COLORS.text,
    click_func: onClick
  })
}

Page(
  BasePage({
    state: {
      deck: null,
      byId: {},
      settings: null,
      progress: null,
      today: 0,
      queue: [],
      current: null,
      revealed: false,
      reviewed: 0,
      again: 0,
      error: '',
      ui: {}
    },

    onInit(params) {
      let deckId = null
      try {
        deckId = JSON.parse(params || '{}').deck
      } catch (e) {
        deckId = null
      }
      const deck = deckId ? loadDeck(deckId) : null
      if (!deck || !deck.cards || !deck.cards.length) {
        this.state.error = 'Deck not found'
        return
      }
      const byId = {}
      for (let k = 0; k < deck.cards.length; k++) byId[deck.cards[k].id] = deck.cards[k]

      const settings = loadSettings()
      const today = dayIndex()
      const progress = loadProgress(deck.id)
      if (progress.day !== today) {
        progress.day = today
        progress.newDone = 0
      }
      const built = buildQueue(deck.cards, progress.cards, today, settings.newPerDay - progress.newDone)

      this.state.deck = deck
      this.state.byId = byId
      this.state.settings = settings
      this.state.today = today
      this.state.progress = progress
      this.state.queue = built.queue
    },

    build() {
      if (this.state.error) {
        textWidget({ x: 63, y: 150, w: 340, h: 120 }, s(28), COLORS.text).setProperty(
          prop.TEXT,
          this.state.error
        )
        button(133, 300, 200, 56, 'Back', COLORS.button, 24, () => back())
        return
      }
      setScrollLock({ lock: true })
      setPageBrightTime({ brightTime: this.state.settings.brightSeconds * 1000 })
      pauseDropWristScreenOff({ duration: 600000 })
      this.createWidgets()
      this.next()
    },

    onDestroy() {
      try {
        if (this.state.deck && this.state.progress) saveProgress(this.state.deck.id, this.state.progress)
      } catch (e) {
        logger.log('save on exit failed', e)
      }
      try {
        resetPageBrightTime()
        resetDropWristScreenOff()
        setScrollLock({ lock: false })
      } catch (e) {
        // display helpers are best effort
      }
    },

    createWidgets() {
      const ui = this.state.ui
      ui.counter = textWidget({ x: 103, y: 20, w: 260, h: 32 }, s(20), COLORS.muted)
      ui.front = textWidget(FRONT_BIG, s(40), COLORS.text, { font: FONT })
      ui.back = textWidget(BACK_BOX, s(28), COLORS.soft, { font: FONT })
      ui.note = textWidget(NOTE_BOX, s(20), COLORS.muted, { font: FONT })

      ui.show = button(118, 330, 230, 64, 'Show answer', COLORS.button, 24, () => this.reveal())

      ui.again = button(40, 312, 124, 50, 'Again', COLORS.again, 22, () => this.grade(GRADE.AGAIN))
      ui.hard = button(171, 312, 124, 50, 'Hard', COLORS.hard, 22, () => this.grade(GRADE.HARD))
      ui.easy = button(302, 312, 124, 50, 'Easy', COLORS.easy, 22, () => this.grade(GRADE.EASY))
      ui.good = button(104, 370, 258, 56, 'Good', COLORS.good, 26, () => this.grade(GRADE.GOOD))

      ui.done = textWidget({ x: 63, y: 90, w: 340, h: 160 }, s(28), COLORS.text)
      ui.more = button(118, 262, 230, 60, 'Learn ' + EXTRA_NEW + ' more', COLORS.accent, 24, () =>
        this.learnMore()
      )
      ui.exit = button(133, 334, 200, 56, 'Back to decks', COLORS.button, 22, () => back())
    },

    setGradeButtons(visible) {
      const ui = this.state.ui
      show(ui.again, visible)
      show(ui.hard, visible)
      show(ui.easy, visible)
      show(ui.good, visible)
    },

    setDoneUi(visible) {
      const ui = this.state.ui
      show(ui.done, visible)
      show(ui.exit, visible)
      if (!visible) show(ui.more, false)
    },

    faces(card) {
      const reverse = this.state.settings.reverse
      return { front: reverse ? card.b : card.f, back: reverse ? card.f : card.b, note: card.n || '' }
    },

    next() {
      const st = this.state
      if (!st.queue.length) {
        this.finish()
        return
      }
      st.current = st.queue[0]
      st.revealed = false
      const card = st.byId[st.current]
      if (!card) {
        st.queue.shift()
        this.next()
        return
      }
      const f = this.faces(card)
      const ui = st.ui
      ui.front.setProperty(prop.MORE, Object.assign(box(FRONT_BIG), { text_size: sizeFor(f.front, true), text: f.front }))
      ui.counter.setProperty(
        prop.TEXT,
        st.queue.length + ' left' + (st.again ? ' · ' + st.again + ' again' : '')
      )
      this.setDoneUi(false)
      this.setGradeButtons(false)
      show(ui.back, false)
      show(ui.note, false)
      show(ui.counter, true)
      show(ui.front, true)
      show(ui.show, true)
    },

    reveal() {
      const st = this.state
      if (st.revealed || !st.current) return
      const card = st.byId[st.current]
      const f = this.faces(card)
      const ui = st.ui
      ui.front.setProperty(prop.MORE, Object.assign(box(FRONT_TOP), { text_size: sizeFor(f.front, false), text: f.front }))
      ui.back.setProperty(prop.MORE, Object.assign(box(BACK_BOX), { text_size: sizeFor(f.back, false), text: f.back }))
      show(ui.back, true)
      if (f.note) {
        ui.note.setProperty(prop.TEXT, f.note)
        show(ui.note, true)
      } else {
        show(ui.note, false)
      }
      show(ui.show, false)
      this.setGradeButtons(true)
      st.revealed = true
    },

    grade(g) {
      const st = this.state
      if (!st.revealed || !st.current) return
      const id = st.current
      const before = st.progress.cards[id] || newCard()
      const wasNew = before.s === STATE.NEW
      const result = schedule(before, g, st.today)
      st.progress.cards[id] = result.card
      if (wasNew) st.progress.newDone += 1
      st.reviewed += 1
      if (g === GRADE.AGAIN) st.again += 1
      st.queue.shift()
      if (result.requeue) requeue(st.queue, id)
      try {
        saveProgress(st.deck.id, st.progress)
      } catch (e) {
        logger.log('save failed', e)
      }
      this.next()
    },

    finish() {
      const st = this.state
      const ui = st.ui
      st.current = null
      st.revealed = false
      show(ui.counter, false)
      show(ui.front, false)
      show(ui.back, false)
      show(ui.note, false)
      show(ui.show, false)
      this.setGradeButtons(false)

      let text
      if (st.reviewed) {
        text = 'Done for today\n' + st.reviewed + ' reviewed' + (st.again ? ', ' + st.again + ' again' : '')
      } else {
        text = 'Nothing due today'
      }
      ui.done.setProperty(prop.TEXT, text)
      const freshLeft = buildQueue(st.deck.cards, st.progress.cards, st.today, EXTRA_NEW).counts.freshTotal
      this.setDoneUi(true)
      show(ui.more, freshLeft > 0)
    },

    learnMore() {
      const st = this.state
      const built = buildQueue(st.deck.cards, st.progress.cards, st.today, EXTRA_NEW)
      if (!built.queue.length) {
        showToast({ text: 'No new cards left' })
        return
      }
      st.queue = built.queue
      this.next()
    }
  })
)

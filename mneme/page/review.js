// Recall: prompt fills the primary field; the band is latent until you
// measure it. Then the answer fills the band and you grade. No labels.
//
//   upper button click / tap the field   ADVANCE  reveal, then Good
//   lower button click / tap the band    REJECT   reveal, then Again
//   upper button hold  / swipe up        PROMOTE  Easy (after reveal)
//   lower button hold  / swipe down      DEMOTE   Hard (after reveal)
//   swipe left                           MORE     note replaces the answer
//   swipe right                          LEAVE    back (system)
//
// Done: reviewed count fills the field, cards to relearn fill the band.
//   ADVANCE learns ten more new cards if any remain, otherwise leaves.
//   REJECT leaves.
import { back } from '@zos/router'
import { setScrollLock } from '@zos/page'
import {
  setPageBrightTime,
  resetPageBrightTime,
  pauseDropWristScreenOff,
  resetDropWristScreenOff
} from '@zos/display'
import {
  onKey,
  offKey,
  onGesture,
  offGesture,
  KEY_HOME,
  KEY_SHORTCUT,
  KEY_EVENT_CLICK,
  KEY_EVENT_LONG_PRESS,
  GESTURE_UP,
  GESTURE_DOWN,
  GESTURE_LEFT
} from '@zos/interaction'
import { log as Logger } from '@zos/utils'
import { BasePage } from '@zeppos/zml/base-page'
import { COLORS } from '../utils/layout'
import { createStage } from '../utils/stage'
import { loadDeck } from '../utils/decks'
import { loadProgress, saveProgress, loadSettings } from '../utils/store'
import { GRADE, STATE, dayIndex, newCard, schedule, buildQueue, requeue } from '../utils/scheduler'

const logger = Logger.getLogger('mneme-review')
const EXTRA_NEW = 10
const GRADE_COLOR = {}
GRADE_COLOR[GRADE.AGAIN] = COLORS.again
GRADE_COLOR[GRADE.HARD] = COLORS.hard
GRADE_COLOR[GRADE.GOOD] = COLORS.good
GRADE_COLOR[GRADE.EASY] = COLORS.easy

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
      showingNote: false,
      reviewed: 0,
      again: 0,
      done: false,
      stage: null,
      error: false
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
        this.state.error = true
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
        progress.reviewedToday = 0
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
        back()
        return
      }
      setScrollLock({ lock: true })
      setPageBrightTime({ brightTime: this.state.settings.brightSeconds * 1000 })
      pauseDropWristScreenOff({ duration: 600000 })

      this.state.stage = createStage({
        floor: this.state.settings.floor,
        onTapTop: () => this.advance(),
        onTapBottom: () => this.reject()
      })

      onKey({
        callback: (key, event) => {
          if (key !== KEY_HOME && key !== KEY_SHORTCUT) return false
          if (event === KEY_EVENT_CLICK) {
            if (key === KEY_HOME) this.advance()
            else this.reject()
          } else if (event === KEY_EVENT_LONG_PRESS) {
            if (key === KEY_HOME) this.promote()
            else this.demote()
          }
          return true
        }
      })
      onGesture({
        callback: (event) => {
          if (event === GESTURE_UP) {
            this.promote()
            return true
          }
          if (event === GESTURE_DOWN) {
            this.demote()
            return true
          }
          if (event === GESTURE_LEFT) {
            this.more()
            return true
          }
          return false
        }
      })

      this.state.stage.setLatent(true)
      this.next()
    },

    onDestroy() {
      try {
        if (this.state.deck && this.state.progress) saveProgress(this.state.deck.id, this.state.progress)
      } catch (e) {
        logger.log('save on exit failed', e)
      }
      try {
        offKey()
        offGesture()
        resetPageBrightTime()
        resetDropWristScreenOff()
        setScrollLock({ lock: false })
      } catch (e) {
        // best effort
      }
      if (this.state.stage) this.state.stage.destroy()
    },

    faces(card) {
      const reverse = this.state.settings.reverse
      return { front: reverse ? card.b : card.f, back: reverse ? card.f : card.b, note: card.n || '' }
    },

    updateRing() {
      const st = this.state
      const total = st.reviewed + st.queue.length
      st.stage.setRing(total ? st.reviewed / total : 1)
    },

    // ---- verbs ----

    advance() {
      const st = this.state
      if (st.done) {
        this.learnMore()
        return
      }
      if (!st.revealed) this.reveal()
      else this.grade(GRADE.GOOD)
    },

    reject() {
      const st = this.state
      if (st.done) {
        back()
        return
      }
      if (!st.revealed) this.reveal()
      else this.grade(GRADE.AGAIN)
    },

    promote() {
      if (this.state.revealed && !this.state.done) this.grade(GRADE.EASY)
    },

    demote() {
      if (this.state.revealed && !this.state.done) this.grade(GRADE.HARD)
    },

    // The note swaps into the band in place of the answer, and back.
    more() {
      const st = this.state
      if (!st.revealed || st.done || !st.current) return
      const f = this.faces(st.byId[st.current])
      if (!f.note) return
      st.showingNote = !st.showingNote
      st.stage.setSecondary(st.showingNote ? f.note : f.back)
      st.stage.haptic('light')
    },

    // ---- flow ----

    next() {
      const st = this.state
      if (!st.queue.length) {
        this.finish()
        return
      }
      st.current = st.queue[0]
      st.revealed = false
      st.showingNote = false
      const card = st.byId[st.current]
      if (!card) {
        st.queue.shift()
        this.next()
        return
      }
      const f = this.faces(card)
      st.stage.setPrimary(f.front)
      st.stage.setSecondary('')
      this.updateRing()
    },

    reveal() {
      const st = this.state
      if (st.revealed || !st.current) return
      const f = this.faces(st.byId[st.current])
      st.stage.setSecondary(f.back)
      st.stage.setLatent(false)
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
      st.progress.reviewedToday += 1
      st.reviewed += 1
      if (g === GRADE.AGAIN) st.again += 1
      st.queue.shift()
      if (result.requeue) requeue(st.queue, id)
      try {
        saveProgress(st.deck.id, st.progress)
      } catch (e) {
        logger.log('save failed', e)
      }
      st.stage.haptic(g === GRADE.AGAIN || g === GRADE.HARD ? 'strong' : 'light')
      st.stage.flash(GRADE_COLOR[g], () => st.stage.setLatent(st.done && st.again > 0 ? false : true))
      this.next()
    },

    finish() {
      const st = this.state
      st.current = null
      st.revealed = false
      st.showingNote = false
      st.done = true
      st.stage.setPrimary(String(st.reviewed))
      st.stage.setSecondary(st.again > 0 ? String(st.again) : '')
      st.stage.setRingColor(COLORS.good)
      st.stage.setRing(1)
      st.stage.haptic('middle')
    },

    learnMore() {
      const st = this.state
      const built = buildQueue(st.deck.cards, st.progress.cards, st.today, EXTRA_NEW)
      if (!built.queue.length) {
        back()
        return
      }
      st.queue = built.queue
      st.done = false
      st.stage.setRingColor(COLORS.ring)
      st.stage.setLatent(true)
      this.next()
    }
  })
)

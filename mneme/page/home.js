// Choose: one deck on screen at a time. Deck name fills the primary field,
// the due count fills the band (latent when only new cards remain, empty
// when nothing waits). No labels.
//
//   upper button click / tap the field   ADVANCE  open this deck
//   lower button click / tap the band    REJECT   next deck
//   lower button hold  / swipe down      previous deck
//   swipe up                             next deck
//   upper button hold  / swipe left      sync with the phone
//   swipe right                          leave (system)
import { setScrollLock } from '@zos/page'
import { push } from '@zos/router'
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
import { listDecks, loadDeck, saveRemoteDecks } from '../utils/decks'
import { loadProgress, loadSettings, saveSettings, resetProgress } from '../utils/store'
import { deckCounts, dayIndex } from '../utils/scheduler'

const logger = Logger.getLogger('mneme-home')

Page(
  BasePage({
    state: { stage: null, decks: [], index: 0, busy: false },

    build() {
      setScrollLock({ lock: true })
      const settings = loadSettings()
      this.state.stage = createStage({
        floor: settings.floor,
        onTapTop: () => this.open(),
        onTapBottom: () => this.step(1)
      })
      this.refresh()

      onKey({
        callback: (key, event) => {
          if (key !== KEY_HOME && key !== KEY_SHORTCUT) return false
          if (event === KEY_EVENT_CLICK) {
            if (key === KEY_HOME) this.open()
            else this.step(1)
          } else if (event === KEY_EVENT_LONG_PRESS) {
            if (key === KEY_HOME) this.sync()
            else this.step(-1)
          }
          return true
        }
      })
      onGesture({
        callback: (event) => {
          if (event === GESTURE_UP) {
            this.step(1)
            return true
          }
          if (event === GESTURE_DOWN) {
            this.step(-1)
            return true
          }
          if (event === GESTURE_LEFT) {
            this.sync()
            return true
          }
          return false
        }
      })
    },

    // Back from a review: counts have changed.
    onResume() {
      if (this.state.stage) this.refresh()
    },

    onDestroy() {
      try {
        offKey()
        offGesture()
        setScrollLock({ lock: false })
      } catch (e) {
        // best effort
      }
      if (this.state.stage) this.state.stage.destroy()
    },

    refresh() {
      const today = dayIndex()
      const rows = listDecks().map((d) => {
        const deck = loadDeck(d.id)
        const progress = loadProgress(d.id)
        const c = deckCounts(deck ? deck.cards : [], progress.cards, today)
        return {
          id: d.id,
          name: d.name,
          due: c.due,
          fresh: c.fresh,
          done: progress.day === today ? progress.reviewedToday : 0
        }
      })
      this.state.decks = rows
      if (this.state.index >= rows.length) this.state.index = 0

      let done = 0
      let due = 0
      for (let k = 0; k < rows.length; k++) {
        done += rows[k].done
        due += rows[k].due
      }
      this.state.stage.setRingColor(COLORS.ring)
      this.state.stage.setRing(done + due ? done / (done + due) : 0)
      this.show()
    },

    show() {
      const st = this.state
      const d = st.decks[st.index]
      if (!d) {
        st.stage.setPrimary('')
        st.stage.setSecondary('')
        st.stage.setLatent(true)
        return
      }
      st.stage.setPrimary(d.name)
      if (d.due) {
        st.stage.setSecondary(String(d.due))
        st.stage.setLatent(false)
      } else if (d.fresh) {
        st.stage.setSecondary(String(d.fresh))
        st.stage.setLatent(true)
      } else {
        st.stage.setSecondary('')
        st.stage.setLatent(true)
      }
    },

    step(dir) {
      const n = this.state.decks.length
      if (!n) return
      this.state.index = (this.state.index + dir + n) % n
      this.state.stage.haptic('light')
      this.show()
    },

    open() {
      const d = this.state.decks[this.state.index]
      if (!d) return
      push({ url: 'page/review', params: JSON.stringify({ deck: d.id }) })
    },

    // Ask the phone side for settings and the decks behind the configured URLs.
    sync() {
      if (this.state.busy) return
      this.state.busy = true
      const stage = this.state.stage
      stage.setRingColor(COLORS.secondary)
      stage.haptic('light')

      this.request({ method: 'SYNC' }, { timeout: 120000 })
        .then((res) => {
          this.state.busy = false
          res = res || {}
          if (res.settings) {
            const merged = saveSettings(res.settings)
            stage.setFloor(merged.floor)
          }
          if (res.resetProgress) resetProgress(listDecks().map((d) => d.id))
          const out = saveRemoteDecks(res.decks || [])
          const failed = res.errors && res.errors.length
          stage.flash(failed ? COLORS.hard : COLORS.good, () => this.refresh())
          stage.haptic(failed ? 'strong' : 'middle')
          logger.log('sync', out.kept.length, 'decks', failed ? res.errors.length + ' failed' : '')
        })
        .catch((e) => {
          this.state.busy = false
          logger.log('sync failed', e)
          stage.flash(COLORS.again, () => this.refresh())
          stage.haptic('strong')
        })
    },

    // Study options pushed from the phone while the app is open.
    onCall(req) {
      if (req && req.method === 'SETTINGS' && req.params) {
        const merged = saveSettings(req.params)
        if (this.state.stage) {
          this.state.stage.setFloor(merged.floor)
          this.show()
        }
      }
    }
  })
)

// Deck list. One button per deck with today's due count, plus Sync.
import { createWidget, deleteWidget, widget, align, prop, showToast } from '@zos/ui'
import { push } from '@zos/router'
import { log as Logger } from '@zos/utils'
import { BasePage } from '@zeppos/zml/base-page'
import { W, s, COLORS } from '../utils/layout'
import { listDecks, loadDeck, saveRemoteDecks } from '../utils/decks'
import { loadProgress, saveSettings, resetProgress } from '../utils/store'
import { deckCounts, dayIndex } from '../utils/scheduler'

const logger = Logger.getLogger('mneme-home')

const ROWS_TOP = 118
const ROW_H = 70
const ROW_GAP = 10
const SYNC_LABEL = 'Sync with phone'

Page(
  BasePage({
    state: { subtitle: null, rows: [], syncBtn: null, probeBtn: null, busy: false },

    build() {
      createWidget(widget.TEXT, {
        x: s(83),
        y: s(34),
        w: W - s(166),
        h: s(40),
        color: COLORS.text,
        text_size: s(30),
        align_h: align.CENTER_H,
        align_v: align.CENTER_V,
        text: 'Mneme'
      })
      this.state.subtitle = createWidget(widget.TEXT, {
        x: s(63),
        y: s(76),
        w: W - s(126),
        h: s(30),
        color: COLORS.muted,
        text_size: s(20),
        align_h: align.CENTER_H,
        align_v: align.CENTER_V,
        text: ''
      })
      this.renderDecks()
    },

    // Fires when a review page is popped and this page shows again.
    onResume() {
      if (this.state.subtitle) this.renderDecks()
    },

    clearRows() {
      const rows = this.state.rows
      for (let k = 0; k < rows.length; k++) deleteWidget(rows[k])
      this.state.rows = []
      if (this.state.syncBtn) {
        deleteWidget(this.state.syncBtn)
        this.state.syncBtn = null
      }
      if (this.state.probeBtn) {
        deleteWidget(this.state.probeBtn)
        this.state.probeBtn = null
      }
    },

    renderDecks() {
      this.clearRows()
      const decks = listDecks()
      const today = dayIndex()
      let totalDue = 0
      let y = s(ROWS_TOP)

      for (let k = 0; k < decks.length; k++) {
        const row = decks[k]
        const deck = loadDeck(row.id)
        const cards = deck ? deck.cards : []
        const c = deckCounts(cards, loadProgress(row.id).cards, today)
        totalDue += c.due
        const status = c.due ? c.due + ' due' : c.fresh ? c.fresh + ' new' : 'done'
        const deckId = row.id
        const btn = createWidget(widget.BUTTON, {
          x: s(63),
          y,
          w: W - s(126),
          h: s(ROW_H),
          radius: s(22),
          normal_color: c.due ? COLORS.accent : COLORS.button,
          press_color: COLORS.press,
          text: row.name + '   ' + status,
          text_size: s(25),
          color: COLORS.text,
          click_func: () => {
            push({ url: 'page/review', params: JSON.stringify({ deck: deckId }) })
          }
        })
        this.state.rows.push(btn)
        y += s(ROW_H + ROW_GAP)
      }

      this.state.subtitle.setProperty(
        prop.TEXT,
        decks.length + (decks.length === 1 ? ' deck · ' : ' decks · ') + totalDue + ' due'
      )

      this.state.syncBtn = createWidget(widget.BUTTON, {
        x: s(123),
        y: y + s(8),
        w: W - s(246),
        h: s(56),
        radius: s(28),
        normal_color: COLORS.button,
        press_color: COLORS.press,
        text: this.state.busy ? 'Syncing…' : SYNC_LABEL,
        text_size: s(22),
        color: COLORS.soft,
        click_func: () => this.sync()
      })

      // Developer aid for the design guide: which buttons and swipes reach us.
      this.state.probeBtn = createWidget(widget.BUTTON, {
        x: s(153),
        y: y + s(72),
        w: W - s(306),
        h: s(44),
        radius: s(22),
        normal_color: COLORS.bg,
        press_color: COLORS.button,
        text: 'input probe',
        text_size: s(18),
        color: COLORS.muted,
        click_func: () => push({ url: 'page/probe' })
      })
    },

    // Ask the phone side for settings and the decks behind the configured URLs.
    sync() {
      if (this.state.busy) return
      this.state.busy = true
      if (this.state.syncBtn) this.state.syncBtn.setProperty(prop.TEXT, 'Syncing…')

      this.request({ method: 'SYNC' }, { timeout: 120000 })
        .then((res) => {
          this.state.busy = false
          res = res || {}
          if (res.settings) saveSettings(res.settings)
          if (res.resetProgress) {
            const ids = listDecks().map((d) => d.id)
            resetProgress(ids)
          }
          const out = saveRemoteDecks(res.decks || [])
          const n = out.kept.length
          let msg = 'Synced ' + n + ' deck' + (n === 1 ? '' : 's')
          if (res.errors && res.errors.length) msg += ', ' + res.errors.length + ' failed'
          if (out.truncated) msg += ' (trimmed to 1000 cards)'
          if (res.resetProgress) msg += '. Progress reset'
          showToast({ text: msg })
          this.renderDecks()
        })
        .catch((e) => {
          this.state.busy = false
          logger.log('sync failed', e)
          if (this.state.syncBtn) this.state.syncBtn.setProperty(prop.TEXT, SYNC_LABEL)
          showToast({ text: 'Sync failed. Open the Zepp app and retry.' })
        })
    },

    // Study options pushed from the phone while the app is open.
    onCall(req) {
      if (req && req.method === 'SETTINGS' && req.params) saveSettings(req.params)
    }
  })
)

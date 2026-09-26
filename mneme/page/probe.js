// Input probe. Shows which physical-key and gesture events reach a mini
// program on this watch, and whether returning true really suppresses the
// system's default. Press each side button, hold it for a second, swipe in
// all four directions. Tap the screen to leave.
//
// The Zepp OS design docs say JS apps cannot intercept button taps on
// two-button watches; this page is how we find out what the firmware does.
import { createWidget, widget, align, text_style, prop } from '@zos/ui'
import { back } from '@zos/router'
import { setScrollLock } from '@zos/page'
import {
  onKey,
  offKey,
  onGesture,
  offGesture,
  KEY_HOME,
  KEY_SHORTCUT,
  KEY_UP,
  KEY_DOWN,
  KEY_SELECT,
  KEY_BACK,
  KEY_EVENT_CLICK,
  KEY_EVENT_LONG_PRESS,
  KEY_EVENT_DOUBLE_CLICK,
  KEY_EVENT_PRESS,
  KEY_EVENT_RELEASE,
  GESTURE_UP,
  GESTURE_DOWN,
  GESTURE_LEFT,
  GESTURE_RIGHT
} from '@zos/interaction'
import { log as Logger } from '@zos/utils'
import { W, H, s, COLORS } from '../utils/layout'

const logger = Logger.getLogger('mneme-probe')
const MAX_LINES = 5

const KEYS = [
  [KEY_HOME, 'HOME'],
  [KEY_SHORTCUT, 'SHORTCUT'],
  [KEY_UP, 'UP'],
  [KEY_DOWN, 'DOWN'],
  [KEY_SELECT, 'SELECT'],
  [KEY_BACK, 'BACK']
]
const EVENTS = [
  [KEY_EVENT_CLICK, 'click'],
  [KEY_EVENT_LONG_PRESS, 'long press'],
  [KEY_EVENT_DOUBLE_CLICK, 'double click'],
  [KEY_EVENT_PRESS, 'press'],
  [KEY_EVENT_RELEASE, 'release']
]
const GESTURES = [
  [GESTURE_UP, 'swipe up'],
  [GESTURE_DOWN, 'swipe down'],
  [GESTURE_LEFT, 'swipe left'],
  [GESTURE_RIGHT, 'swipe right']
]

function nameOf(table, value) {
  for (let k = 0; k < table.length; k++) if (table[k][0] === value) return table[k][1]
  return 'code ' + value
}

Page({
  state: { lines: [], text: null, count: 0 },

  build() {
    setScrollLock({ lock: true })

    // Whole screen is the exit: one tap anywhere. Created first so the text
    // widgets draw above it.
    createWidget(widget.BUTTON, {
      x: 0,
      y: 0,
      w: W,
      h: H,
      normal_color: 0x000000,
      press_color: 0x101010,
      text: '',
      click_func: () => back()
    })

    createWidget(widget.TEXT, {
      x: s(63),
      y: s(28),
      w: W - s(126),
      h: s(60),
      color: COLORS.muted,
      text_size: s(20),
      align_h: align.CENTER_H,
      align_v: align.CENTER_V,
      text_style: text_style.WRAP,
      text: 'Press, hold, swipe.\nTap the screen to leave.'
    })

    this.state.text = createWidget(widget.TEXT, {
      x: s(43),
      y: s(96),
      w: W - s(86),
      h: s(300),
      color: COLORS.text,
      text_size: s(30),
      align_h: align.CENTER_H,
      align_v: align.CENTER_V,
      text_style: text_style.WRAP,
      text: '…'
    })

    onKey({
      callback: (key, event) => {
        this.push(nameOf(KEYS, key) + ' ' + nameOf(EVENTS, event))
        // true = ask the system to skip its default (app list, quick start).
        // If the app still leaves, the tap is not ours to take.
        return true
      }
    })

    onGesture({
      callback: (event) => {
        this.push(nameOf(GESTURES, event))
        return true
      }
    })
  },

  push(line) {
    const st = this.state
    st.count += 1
    st.lines.push(st.count + '  ' + line)
    while (st.lines.length > MAX_LINES) st.lines.shift()
    logger.log('probe', line)
    if (st.text) st.text.setProperty(prop.TEXT, st.lines.join('\n'))
  },

  onDestroy() {
    try {
      offKey()
      offGesture()
      setScrollLock({ lock: false })
    } catch (e) {
      // best effort
    }
  }
})

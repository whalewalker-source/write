// Phone side. Runs inside the Zepp app: reads the settings page values and
// downloads deck JSON files on behalf of the watch.
import { BaseSideService, settingsLib } from '@zeppos/zml/base-side'

const MAX_CARDS = 1000

function item(key, fallback) {
  const v = settingsLib.getItem(key)
  return v === undefined || v === null || v === '' ? fallback : v
}

function toInt(v, fallback) {
  const n = parseInt(v, 10)
  return isNaN(n) ? fallback : n
}

function readSettings() {
  return {
    deckUrls: String(item('deckUrls', '')),
    reverse: String(item('reverse', 'false')) === 'true',
    newPerDay: toInt(item('newPerDay', 15), 15),
    brightSeconds: toInt(item('brightSeconds', 45), 45),
    floor: toInt(item('floor', 52), 52),
    resetProgress: String(item('resetProgress', 'false')) === 'true'
  }
}

function studySettings(s) {
  return { reverse: s.reverse, newPerDay: s.newPerDay, brightSeconds: s.brightSeconds, floor: s.floor }
}

function splitUrls(text) {
  return text
    .split(/[\s,]+/)
    .map((u) => u.trim())
    .filter((u) => /^https?:\/\//i.test(u))
}

function shortHost(url) {
  const m = /^https?:\/\/([^/]+)/i.exec(url)
  return m ? m[1] : url
}

async function fetchJson(url) {
  const res = await fetch({ url, method: 'GET', headers: { Accept: 'application/json' } })
  if (res && typeof res.status === 'number' && (res.status < 200 || res.status >= 300)) {
    throw new Error('HTTP ' + res.status)
  }
  const body = res ? res.body : null
  return typeof body === 'string' ? JSON.parse(body) : body
}

// A URL may point at one deck, an array of decks, or { decks: [...] }.
function asDeckList(body) {
  if (Array.isArray(body)) return body
  if (body && Array.isArray(body.decks)) return body.decks
  return body ? [body] : []
}

async function sync(ctx) {
  const settings = readSettings()
  const decks = []
  const errors = []
  const urls = splitUrls(settings.deckUrls)
  for (let k = 0; k < urls.length; k++) {
    const url = urls[k]
    try {
      const list = asDeckList(await fetchJson(url))
      for (let j = 0; j < list.length; j++) {
        const d = list[j]
        if (d && Array.isArray(d.cards) && d.cards.length > MAX_CARDS) d.cards = d.cards.slice(0, MAX_CARDS)
        decks.push(d)
      }
    } catch (e) {
      ctx.log && ctx.log('deck fetch failed', url, e && e.message)
      errors.push(shortHost(url))
    }
  }
  if (settings.resetProgress) settingsLib.setItem('resetProgress', 'false')
  return { settings: studySettings(settings), resetProgress: settings.resetProgress, decks, errors }
}

AppSideService(
  BaseSideService({
    onInit() {},

    onRequest(req, res) {
      if (req.method === 'SYNC') {
        sync(this)
          .then((data) => res(null, data))
          .catch((e) => {
            this.log && this.log('sync failed', e && e.message)
            res(null, { settings: studySettings(readSettings()), resetProgress: false, decks: [], errors: ['sync'] })
          })
        return
      }
      if (req.method === 'GET_SETTINGS') {
        res(null, studySettings(readSettings()))
        return
      }
      res(null, { error: 'unknown method ' + req.method })
    },

    // Push study options to the watch right away if the app is open there.
    // Deck URLs and the reset switch only take effect on the next sync.
    onSettingsChange({ key }) {
      if (key === 'deckUrls' || key === 'resetProgress') return
      try {
        this.call({ method: 'SETTINGS', params: studySettings(readSettings()) })
      } catch (e) {
        // watch app not running
      }
    },

    onRun() {},
    onDestroy() {}
  })
)

// Persistence: small JSON files in the app's private data directory.
import { statSync, readFileSync, writeFileSync, rmSync } from '@zos/fs'
import { pack, unpack } from './scheduler'

export function readJson(path, fallback) {
  try {
    if (!statSync({ path })) return fallback
    const raw = readFileSync({ path, options: { encoding: 'utf8' } })
    if (!raw) return fallback
    return JSON.parse(raw)
  } catch (e) {
    return fallback
  }
}

export function writeJson(path, value) {
  writeFileSync({ path, data: JSON.stringify(value), options: { encoding: 'utf8' } })
}

export function removeFile(path) {
  try {
    if (statSync({ path })) rmSync({ path })
  } catch (e) {
    // nothing to remove
  }
}

export function safeName(id) {
  return String(id).replace(/[^a-zA-Z0-9_-]/g, '_')
}

// ---- settings (mirrored from the phone settings page on every sync) ----

export const DEFAULT_SETTINGS = { reverse: false, newPerDay: 15, brightSeconds: 45 }
const SETTINGS_FILE = 'settings.json'

export function loadSettings() {
  const saved = readJson(SETTINGS_FILE, {})
  return {
    reverse: !!saved.reverse,
    newPerDay: clampInt(saved.newPerDay, 0, 500, DEFAULT_SETTINGS.newPerDay),
    brightSeconds: clampInt(saved.brightSeconds, 10, 600, DEFAULT_SETTINGS.brightSeconds)
  }
}

export function saveSettings(next) {
  const cur = loadSettings()
  const merged = {
    reverse: next.reverse === undefined ? cur.reverse : !!next.reverse,
    newPerDay: clampInt(next.newPerDay, 0, 500, cur.newPerDay),
    brightSeconds: clampInt(next.brightSeconds, 10, 600, cur.brightSeconds)
  }
  writeJson(SETTINGS_FILE, merged)
  return merged
}

export function clampInt(v, lo, hi, fallback) {
  const n = parseInt(v, 10)
  if (isNaN(n)) return fallback
  return Math.min(hi, Math.max(lo, n))
}

// ---- per-deck progress ----
// In memory: { day, newDone, cards: { cardId: {s,i,e,d,r,l} } }
// On disk:   { v: 1, day, newDone, cards: { cardId: [s,i,e,d,r,l] } }

export function progressPath(deckId) {
  return 'progress_' + safeName(deckId) + '.json'
}

export function loadProgress(deckId) {
  const raw = readJson(progressPath(deckId), null)
  const out = { day: 0, newDone: 0, cards: {} }
  if (!raw || typeof raw !== 'object') return out
  out.day = raw.day | 0
  out.newDone = raw.newDone | 0
  const cards = raw.cards || {}
  for (const id in cards) out.cards[id] = unpack(cards[id])
  return out
}

export function saveProgress(deckId, progress) {
  const cards = {}
  for (const id in progress.cards) cards[id] = pack(progress.cards[id])
  writeJson(progressPath(deckId), { v: 1, day: progress.day, newDone: progress.newDone, cards })
}

export function resetProgress(deckIds) {
  for (let k = 0; k < deckIds.length; k++) removeFile(progressPath(deckIds[k]))
}

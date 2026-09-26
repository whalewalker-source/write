// Deck registry: decks bundled into the app plus decks downloaded through
// the phone (saved as JSON files on the watch).
import { BUNDLED } from '../decks/index'
import { readJson, writeJson, removeFile, safeName } from './store'

const INDEX_FILE = 'decks_index.json'
export const MAX_CARDS_PER_DECK = 1000

export function deckFile(id) {
  return 'deck_' + safeName(id) + '.json'
}

function isBundled(id) {
  for (let k = 0; k < BUNDLED.length; k++) if (BUNDLED[k].id === id) return true
  return false
}

// [{ id, name, count, bundled }]
export function listDecks() {
  const rows = []
  for (let k = 0; k < BUNDLED.length; k++) {
    const d = BUNDLED[k]
    rows.push({ id: d.id, name: d.name, count: d.cards.length, bundled: true })
  }
  const idx = readJson(INDEX_FILE, { decks: [] })
  const remote = idx.decks || []
  for (let k = 0; k < remote.length; k++) {
    if (!isBundled(remote[k].id)) rows.push(remote[k])
  }
  return rows
}

export function loadDeck(id) {
  for (let k = 0; k < BUNDLED.length; k++) if (BUNDLED[k].id === id) return BUNDLED[k]
  return readJson(deckFile(id), null)
}

// Accepts loosely-shaped decks ({id,name,cards:[{id,f,b,n}]} or
// {front,back,note} keys) and returns a clean deck or null.
export function normalizeDeck(d) {
  if (!d || typeof d !== 'object' || !Array.isArray(d.cards)) return null
  const id = String(d.id || d.name || '').trim()
  if (!id) return null
  const cards = []
  let truncated = false
  for (let k = 0; k < d.cards.length; k++) {
    if (cards.length >= MAX_CARDS_PER_DECK) {
      truncated = true
      break
    }
    const c = d.cards[k]
    if (!c) continue
    const f = String(c.f || c.front || '').trim()
    const b = String(c.b || c.back || '').trim()
    if (!f || !b) continue
    const n = c.n || c.note ? String(c.n || c.note).trim() : ''
    cards.push({ id: String(c.id || k + 1), f, b, n })
  }
  if (!cards.length) return null
  return { id, name: String(d.name || id), cards, truncated }
}

// Replace the set of downloaded decks with the given list. The URL list on
// the phone is the source of truth, so decks that disappeared are removed.
// Progress files are kept so a deck that comes back keeps its history.
export function saveRemoteDecks(decks) {
  const idx = readJson(INDEX_FILE, { decks: [] })
  const kept = []
  let truncated = 0
  for (let k = 0; k < decks.length; k++) {
    const clean = normalizeDeck(decks[k])
    if (!clean || isBundled(clean.id)) continue
    if (clean.truncated) truncated++
    writeJson(deckFile(clean.id), { id: clean.id, name: clean.name, cards: clean.cards })
    kept.push({ id: clean.id, name: clean.name, count: clean.cards.length, bundled: false })
  }
  const old = idx.decks || []
  for (let k = 0; k < old.length; k++) {
    let stillThere = false
    for (let j = 0; j < kept.length; j++) if (kept[j].id === old[k].id) stillThere = true
    if (!stillThere) removeFile(deckFile(old[k].id))
  }
  writeJson(INDEX_FILE, { decks: kept })
  return { kept, truncated }
}

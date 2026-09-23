import { test } from 'node:test'
import assert from 'node:assert/strict'
import greekCore from '../decks/greek-core.js'
import greekEndings from '../decks/greek-endings.js'

const DECKS = [greekCore, greekEndings]

for (const deck of DECKS) {
  test(`bundled deck "${deck.id}" is well formed`, () => {
    assert.match(deck.id, /^[a-z0-9-]+$/)
    assert.ok(deck.name && deck.name.trim())
    assert.ok(Array.isArray(deck.cards) && deck.cards.length > 0)
    const ids = new Set()
    for (const c of deck.cards) {
      assert.ok(c.id && !ids.has(c.id), `duplicate or missing id: ${c.id}`)
      ids.add(c.id)
      assert.ok(c.f && c.f.trim(), `empty front on ${c.id}`)
      assert.ok(c.b && c.b.trim(), `empty back on ${c.id}`)
      for (const s of [c.f, c.b, c.n || '']) {
        // the watch font has no shaping engine, so text must be precomposed
        assert.equal(s.normalize('NFC'), s, `not NFC on ${c.id}: ${s}`)
        assert.equal(s, s.trim(), `untrimmed text on ${c.id}`)
      }
    }
  })
}

test('deck ids are unique across bundled decks', () => {
  const ids = DECKS.map((d) => d.id)
  assert.equal(new Set(ids).size, ids.length)
})

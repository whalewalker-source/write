// Decks compiled into the app. Add a deck here to ship it without a URL:
//   1. python3 tools/anki_export_to_deck.py export.txt --js decks/my-deck.js
//   2. import it below and add it to BUNDLED
import greekCore from './greek-core'
import greekEndings from './greek-endings'

export const BUNDLED = [greekCore, greekEndings]

# Mneme

Spaced-repetition flashcards for the Amazfit Active 2 (Round), written as a
Zepp OS mini program. Built for Ancient Greek vocabulary, so polytonic text
renders from a bundled font, but any prompt/answer pair works: paradigms,
dates, quotes, anything you would put in Anki.

Reviews run entirely on the watch. The phone is only needed to install the
app and to load new decks.

`DESIGN.md` is the design guide the next version follows: two layers, no
labels, buttons first, sized for reading without glasses. The deck list has
an `input probe` entry that shows which side-button and swipe events reach
the app on your watch; it exists to settle the guide's open question and
goes away once the answer is in.

## What you get

- **Deck list** with today's due count per deck and a Sync button.
- **Review page**: the front of the card, `Show answer`, then
  `Again / Hard / Easy` and a wide `Good`. Notes (principal parts, usage)
  appear under the answer. The screen stays on while you read.
- **Scheduler**: an Anki-style SM-2 variant. Lapses come back in the same
  session; intervals grow with an ease factor; a daily limit on new cards;
  `Learn 10 more` when you are done.
- **Decks**: two Greek starter decks are built in (`decks/`). Add your own
  from an Anki export, either bundled into the app or downloaded from a URL
  through the Zepp app.
- **Settings page** in the Zepp app: deck URLs, meaning-first mode, new
  cards per day, screen-on time, reset progress.

## Why not AnkiWeb or the To-Do app

AnkiWeb has no public API, and its sync protocol is for Anki clients only, so
nothing on the watch can talk to it directly. Anki's desktop add-on
AnkiConnect exposes a local HTTP API, but only while Anki is open on a
computer on the same network as your phone. The built-in To-Do app shows a
title and a time. It cannot hide an answer or space repetitions.

The workable path is: keep authoring cards in Anki, export, convert, review
on the watch. Progress lives on the watch; it does not flow back to Anki.

## Install on the watch

You need Node.js 18 or newer (22 recommended), a Zepp account (the one the
phone app uses) and the watch paired to the Zepp app.

```bash
npm i -g @zeppos/zeus-cli
cd mneme
npm install
zeus login          # opens the browser, sign in with your Zepp account
```

Turn on Developer Mode in the Zepp app: Profile > Settings > About, tap the
Zepp logo seven times, go back, and `Developer Mode` now appears in Settings.
(Menu names shift between app versions; the seven taps on the logo is the
part that matters.)

Then, with the phone near the watch:

```bash
zeus preview
```

Pick the `active2r` target when asked. A QR code appears in the terminal. In
the Zepp app open Profile > Settings > Developer Mode and scan it. The app
installs over Bluetooth in under a minute and appears in the watch app list
as `Mneme`.

`zeus dev` runs the app in the Zepp OS Simulator instead (macOS and Windows
only). `zeus build` writes a `.zab` package into `dist/` without installing.

`app.json` carries a made-up `appId` (26071913). That is fine for preview
installs. Publishing to the Zepp app store needs an id from the developer
console, and that is not the goal here.

## Using it

1. Open Mneme on the watch. Tap a deck.
2. Read the front. Tap `Show answer`.
3. Grade yourself. `Good` is the wide bar at the bottom.
4. Swipe right to leave a session at any time; progress is saved on every
   grade.

`Again` on a new card keeps it in the session. `Again` on a known card is a
lapse: the ease drops, the card comes back a few cards later, and it
graduates with a short interval. A study day rolls over at 4am.

## Your own decks

**1. Export from Anki.** File > Export > `Notes in Plain Text (.txt)`, choose
the deck, tick `Include unique identifier`. HTML on or off both work. The
converter detects Anki's header lines for the guid, deck, notetype and tags
columns.

**2. Convert.**

```bash
python3 tools/anki_export_to_deck.py export.txt --name "Greek vocab" -o greek-vocab.json
```

By default field 1 is the front, field 2 the back and field 3 (if any) the
note. Use `--front`, `--back`, `--note` to change that (`--note 0` for no
note). HTML is stripped, `[sound:]` tags removed, and all text is normalised
to NFC, which the watch needs to draw polytonic characters.

**3a. Load through the phone.** Put the JSON somewhere the Zepp app can fetch
it over HTTPS. A GitHub Gist raw URL works well; Dropbox with `?dl=1` also
works. In the Zepp app open Profile > your watch > Mneme (settings page) and
paste the URL into `Deck URLs` (several URLs separated by spaces or commas).
On the watch tap `Sync with phone`. Decks that leave the URL list are removed
from the watch on the next sync; their progress files are kept.

**3b. Or bundle it.** No hosting, no phone at review time, but every deck
update means a new `zeus preview`:

```bash
python3 tools/anki_export_to_deck.py export.txt --id greek-vocab --name "Greek vocab" --js decks/greek-vocab.js
```

then import it in `decks/index.js` and add it to `BUNDLED`.

Deck format:

```json
{
  "id": "greek-vocab",
  "name": "Greek vocab",
  "cards": [
    { "id": "abc123", "f": "λόγος, λόγου, ὁ", "b": "word, speech; account", "n": "" }
  ]
}
```

A URL may also return an array of decks or `{ "decks": [...] }`. Card ids
must be stable; progress is keyed by them. Keep decks to a few hundred cards
each. Anything over 1000 is trimmed, and a big deck takes a while to cross
Bluetooth.

## Settings

All in the Zepp app's settings page for Mneme.

- **Deck URLs**: see above. Takes effect on the next sync.
- **Show the meaning first**: reverse cards (English on the front).
- **New cards per day**: default 15. Does not limit reviews.
- **Keep the screen on for**: seconds per card face, default 45.
- **Reset all progress on next sync**: arms a reset; the watch wipes every
  progress file on the next sync and the switch turns itself off.

Study options also reach the watch immediately if Mneme is open on it.

## What is not verified

This was built and unit-tested without the physical watch, against the
Zepp OS 4.0 API that the Active 2 runs (the device reports API level 402,
which is 4.2 in the CLI's encoding). Things to check on the first run:

- **The Greek font.** `utils/layout.js` points TEXT widgets at
  `fonts/NotoSansGreek-Regular.ttf`. If the firmware ignores the `font`
  property, text falls back to the system font, which may lack breathings
  and iota subscripts. Then the fix is a different rendering path, not a
  different deck.
- **Counts on the deck list** refresh when you come back from a review via
  the page `onResume` hook. If they look stale, relaunch the app.
- **Sync** relies on the Zepp app being open in the background on the phone.
  If it fails, open the Zepp app and tap Sync again.

## Scheduler details

State per card: interval (days), ease (starts 2.5, floor 1.3), due day, reps,
lapses. New card: `Good` graduates to 1 day, `Easy` to 4 days. Review card:
`Hard` grows the interval by 20% and lowers ease, `Good` multiplies by ease
(with credit for lateness), `Easy` adds a 30% bonus and raises ease. `Again`
is a lapse: ease minus 0.2, relearn now, graduate to 20% of the old interval.
Intervals cap at two years. Everything is in `utils/scheduler.js` with tests
in `test/`; run them with `npm test`.

## Layout

```
app.json            targets: Active 2 Round (all eight deviceSource ids)
app.js              app shell
page/home.js        deck list and sync
page/review.js      review session
app-side/index.js   phone side: settings and deck downloads
setting/index.js    settings page in the Zepp app
utils/scheduler.js  SM-2 scheduler (pure functions)
utils/store.js      JSON files on the watch: settings and progress
utils/decks.js      bundled and downloaded decks
utils/layout.js     466px round geometry, colours, font
decks/              bundled decks
tools/              Anki converter, font subsetter
assets/active2r/    icon and the Greek font subset
test/               node --test
```

## Later, if wanted

Two-way Anki sync is possible through AnkiConnect (`findCards`, `cardsInfo`,
`answerCards`) from the phone side while Anki is open on a computer on the
same network. It is not built; the watch scheduler is the source of truth
today.

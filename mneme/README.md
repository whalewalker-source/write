# Mneme

Spaced-repetition flashcards for the Amazfit Active 2 (Round), written as a
Zepp OS mini program. Built for Ancient Greek vocabulary, so polytonic text
renders from a bundled font, and built to be read without glasses: two
fields, no labels, text that fills its space, the two side buttons doing the
work. Any prompt/answer pair works: paradigms, dates, quotes, anything you
would put in Anki.

Reviews run entirely on the watch. The phone is only needed to install the
app, change settings and load new decks. The design rules are in
`DESIGN.md`; this file is about running it.

## The screen

The glass is two equal halves. The prompt fills the upper half, big. The
answer fills the lower half inside a translucent band that fades in across
the middle third of the screen, over the bottom of the prompt. There are no
words on screen that are not your content. Text sizes itself to fill the
field and never goes below a size you calibrate (52 px by default). A
hairline ring at the edge shows progress.

## The controls

| Do | Upper button | Lower button | Swipe |
| --- | --- | --- | --- |
| click | reveal, then Good | reveal, then Again | |
| hold 1 s | Easy | Hard | |
| up / down | | | Easy / Hard |
| left | | | show the note instead of the answer, and back |
| right | | | leave |

Tapping the upper half of the glass does what the upper button does; the
lower half, the lower button. On the deck list the upper button opens the
shown deck, the lower steps to the next one, holding the upper syncs with
the phone, holding the lower steps back. On the done screen the upper
button learns ten more new cards if any remain, the lower leaves.

Feedback is a colour flash of the band and a vibration, never text.

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

## Your own decks

**1. Export from Anki.** File > Export > `Notes in Plain Text (.txt)`, choose
the deck, tick `Include unique identifier`. HTML on or off both work. The
converter detects Anki's header lines for the guid, deck, notetype and tags
columns.

**2. Convert.**

```bash
python3 tools/anki_export_to_deck.py export.txt --name "Greek vocab" --first-meaning -o greek-vocab.json
```

By default field 1 is the front, field 2 the back and field 3 (if any) the
note. Use `--front`, `--back`, `--note` to change that (`--note 0` for no
note). `--first-meaning` keeps only the first meaning on the back and moves
the rest into the note, which is what the watch wants: backs of 20
characters or fewer fill the band at 66 px or more, and the tool warns about
longer ones. HTML is stripped, `[sound:]` tags removed, and all text is
normalised to NFC, which the watch needs to draw polytonic characters.

**3a. Load through the phone.** Put the JSON somewhere the Zepp app can fetch
it over HTTPS. A GitHub Gist raw URL works well; Dropbox with `?dl=1` also
works. In the Zepp app open Profile > your watch > Mneme (settings page) and
paste the URL into `Deck URLs` (several URLs separated by spaces or commas).
On the watch hold the upper button on the deck list, or swipe left. Decks
that leave the URL list are removed from the watch on the next sync; their
progress files are kept.

**3b. Or bundle it.** No hosting, no phone at review time, but every deck
update means a new `zeus preview`:

```bash
python3 tools/anki_export_to_deck.py export.txt --id greek-vocab --name "Greek vocab" --first-meaning --js decks/greek-vocab.js
```

then import it in `decks/index.js` and add it to `BUNDLED`.

Deck format:

```json
{
  "id": "greek-vocab",
  "name": "Greek vocab",
  "cards": [
    { "id": "abc123", "f": "λόγος, λόγου, ὁ", "b": "word", "n": "speech; account, reason" }
  ]
}
```

A URL may also return an array of decks or `{ "decks": [...] }`. Card ids
must be stable; progress is keyed by them. Keep fronts to 24 characters and
backs to 20. Keep decks to a few hundred cards each; anything over 1000 is
trimmed, and a big deck takes a while to cross Bluetooth.

## Settings

All in the Zepp app's settings page for Mneme.

- **Deck URLs**: see above. Takes effect on the next sync.
- **Show the meaning first**: reverse cards (English on the front).
- **New cards per day**: default 15. Does not limit reviews.
- **Keep the screen on for**: seconds per card face, default 45.
- **Smallest comfortable text**: the size text will not shrink below,
  default 52. Calibrate it with the ladder in the design guide's companion
  page, held at wrist distance without glasses.
- **Reset all progress on next sync**: arms a reset; the watch wipes every
  progress file on the next sync and the switch turns itself off.

Study options also reach the watch immediately if Mneme is open on it.

## Scheduling

Anki-style SM-2. State per card: interval (days), ease (starts 2.5, floor
1.3), due day, reps, lapses. New card: `Good` graduates to 1 day, `Easy` to 4
days. Review card: `Hard` grows the interval by 20% and lowers ease, `Good`
multiplies by ease (with credit for lateness), `Easy` adds a 30% bonus and
raises ease. `Again` is a lapse: ease minus 0.2, relearn now, graduate to
20% of the old interval. Intervals cap at two years. A study day rolls over
at 4am. Everything is in `utils/scheduler.js` with tests in `test/`; run
them with `npm test`.

## What was verified on the hardware

Both side buttons' taps and one-second holds and all four swipes reach a
mini program and can be intercepted (an input probe page confirmed it on
2026-09-26; it has since been removed, see git history). 52 px is the
owner's comfortable floor. Not yet seen on hardware: widgets placed past
the screen edge (the bleed), the measured fit against the bundled font, and
the eight-step feather. `DESIGN.md` section 10 says what to look for.

## Layout

```
app.json            targets: Active 2 Round (all eight deviceSource ids)
app.js              app shell
page/home.js        choose a deck, sync
page/review.js      recall, grade, done
app-side/index.js   phone side: settings and deck downloads
setting/index.js    settings page in the Zepp app
utils/layout.js     halves, intrusion, bleed, fields, zones, ring, colours
utils/fit.js        fit text to a field on a round glass (pure, tested)
utils/stage.js      the two-field stage: zones, ring, primary, feathered band, secondary
utils/scheduler.js  SM-2 scheduler (pure, tested)
utils/store.js      JSON files on the watch: settings and progress
utils/decks.js      bundled and downloaded decks
decks/              bundled decks
tools/              Anki converter, font subsetter
assets/active2r/    icon and the Greek font subset
test/               node --test
DESIGN.md           the design guide
```

## Later, if wanted

Two-way Anki sync is possible through AnkiConnect (`findCards`, `cardsInfo`,
`answerCards`) from the phone side while Anki is open on a computer on the
same network. It is not built; the watch scheduler is the source of truth
today.

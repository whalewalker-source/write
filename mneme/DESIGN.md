# Simple Superposition

A design guide for reading, interacting and learning on the Amazfit Active 2
(Round) without glasses. Written for Mneme, meant for anything that runs on
this watch.

Status tags: [Certain] hard evidence (device docs, typings, measurement),
[Likely] strong inference, [Guessing] filling a gap. Untagged rules are
design decisions, not facts.

## 1. Premise

**The reader.** Near-sighted, no glasses at the wrist. The watch sits about
35 cm from the eyes. Whatever is on screen has to survive blur: large
x-height, hard contrast, few glyphs, nothing small anywhere.

**The device.** [Certain] Amazfit Active 2 (Round): 466 x 466 px, round,
1.32 in AMOLED, two physical buttons on the right, no rotating crown,
API_LEVEL 4.2 on Zepp OS 5.0 (source: Zepp device list, Active 2 Round row,
deviceSource 10092803 among eight ids).

| Fact | Value |
| --- | --- |
| Pixel pitch | 33.5 mm / 466 px = 0.072 mm per px |
| 100 px | 7.2 mm |
| Centre, radius | (233, 233), 233 px |
| Buttons | upper = HOME, lower = SHORTCUT [Certain, two-key layout doc] |
| Button positions | about 2 o'clock and 4 o'clock on the case [Likely] |

**The rule you gave.** One critical piece of information fills the upper two
thirds. One secondary piece may take the lower third. The large piece sits
behind the small one. Buttons first, cardinal swipes second. No labels: only
content is ever on screen.

## 2. The theme

Superposition is used in two exact senses, and the interface obeys both.

**Physics: a clock in superposition.** A quantum clock can be in two states
at once and then reads two proper times at once; the state only resolves
when it is measured. Zych, Costa, Pikovski and Brukner showed in 2011 that
this loss of a single time shows up as lost interference visibility. Smith
and Ahmadi (Dartmouth, 2020) derived the resulting "quantum time dilation",
building on Page and Wootters' 1983 idea that time itself emerges from
entanglement between a clock and the system it times. A card is exactly
this: prompt and answer exist together, and only your input resolves which
one the screen commits to. The lower layer is the unresolved state: present,
dim, not yet readable. The button press is the measurement.

**Geology: the law of superposition.** Steno, 1669: in undisturbed strata the
lower layer is the older one. On screen, depth is order of arrival. The
prompt came first, so it is the base layer. The answer arrived later, so it
lies on top. The note is newest, so it replaces the answer on the top layer
when asked for, never a third stratum.

**Simple.** Zero labels. No captions, headers, hints, counters with words,
icons that need explaining, or on-screen buttons when a physical input or a
gesture exists. State is carried by three things only: position (upper field
or lower band), layer (behind or in front), weight (size and colour). If a
screen needs a word that is not content, the screen is wrong.

## 3. Canvas: a 466 circle split two thirds, one third

All numbers are in design pixels on the 466 face. `s()` in
`utils/layout.js` rescales them for any other round device.

| Row (y) | Chord width | Used for |
| --- | --- | --- |
| 56 | 303 | top of a three-line primary |
| 84 | 358 | top of the primary box |
| 120 | 408 | |
| 233 | 466 | widest row |
| 300 | 446 | top edge of the band |
| 311 | 439 | two-thirds line |
| 322 | 435 | top of the secondary box |
| 400 | 325 | |
| 418 | 278 | bottom of the secondary box |
| 440 | 214 | nothing below this |

**Zones**

| Zone | Box (x, y, w, h) | Notes |
| --- | --- | --- |
| Upper field | 0, 0, 466, 311 | the two thirds |
| Primary box | 53, 84, 360, 226 | text box inside the field, centred on y 197 |
| Band | 0, 300, 466, 166 | translucent layer, clipped by the round mask |
| Secondary box | 91, 322, 284, 96 | text box inside the band |
| Ring | arc radius 227, width 4 | ambient progress, no numerals |
| Overlap | y 300 to 310 | the band covers the last 10 px of the primary box |

The overlap is deliberate. It is the visible superposition: a two-line
prompt's descenders dip under the band's edge and dim. Ten pixels is enough
to show the layering and too little to cost legibility.

Two physical anchors make the split feel native to the hardware [Likely]:
the upper button sits level with the upper field, the lower button sits
level with the band. Upper button acts on the top layer's content; lower
button acts on the bottom layer's content. Never cross them.

## 4. Type

**Face.** Noto Sans, the Zepp OS system face [Certain, Zepp font doc].
Mneme bundles a 128 KB subset with Latin, Greek and Greek Extended so
breathings, iota subscripts and circumflexes exist as precomposed glyphs.
[Certain] The watch does no shaping: every string must be Unicode NFC. The
Anki converter and the deck tests enforce this.

**Weight.** Regular today. If blur is still a problem after the calibration
below, add a Noto Sans Medium subset for the primary layer only. Medium holds
its counters under blur; Bold closes them. Never Light.

**Scale.** Sizes are Zepp `text_size` values (em box in pixels). Angular
sizes assume 35 cm viewing distance; Snellen equivalents assume a 20/20
letter is 5 arcminutes tall.

| Step | Size | Cap height | At 35 cm | About | Fits (Greek, 360 px box) |
| --- | --- | --- | --- | --- | --- |
| P1 | 96 | 4.9 mm | 48′ | 20/190 | 6 characters, 1 line |
| P2 | 80 | 4.1 mm | 40′ | 20/160 | 8 characters, 1 line |
| P3 | 64 | 3.3 mm | 32′ | 20/130 | 10 per line, 2 lines |
| P4 | 52 | 2.7 mm | 26′ | 20/105 | 12 per line, 3 lines |
| P5 | 44 | 2.3 mm | 22′ | 20/90 | 15 per line, 3 lines |
| S1 | 44 | 2.3 mm | 22′ | 20/90 | 11 per line, 2 lines (284 px box) |
| S2 | 36 | 1.9 mm | 18′ | 20/73 | 14 per line, 2 lines |
| S3 | 32 | 1.6 mm | 16′ | 20/65 | 16 per line, 2 lines |

Rules:

- The primary picks the largest step whose wrapped result is at most three
  lines with no line overflowing. The secondary does the same with two
  lines. Shrink, never scroll, never ellipsis.
- Floor: 32 px anywhere on screen. If content does not fit at the floor, the
  content is too long. Fix the deck, not the layout.
- Line height 116% of the size, Zepp's own figure for Greek and Latin
  [Certain, font doc]. In Zepp terms: `line_space = round(0.16 * text_size)`.
- Polytonic capitals carry marks above the cap line. Give every text box
  `h >= lines * 1.35 * text_size` so nothing clips.
- Letter spacing 0. No condensed faces. No italics.
- Numbers are content, not labels: a bare number in the band is allowed
  (cards due), a number with a word is not.

**Content rule that follows from the type rule.** A card back must be
readable at S2 or larger: 28 characters or fewer. Keep the first meaning on
the back; move the rest into the note. Verb principal parts live in the note
and are shown only on request. The starter deck violates this in places and
should be trimmed to match.

## 5. Colour

Black ground because the pixels are off: highest contrast, no halo around
the glyphs for an uncorrected eye, and the round mask disappears.

| Token | Value | Role |
| --- | --- | --- |
| ground | `#000000` | everything behind everything |
| primary | `#EDEDED` | primary text; a step under white to soften bloom |
| secondary | `#C9CFEA` | secondary text; cool tint marks the other layer |
| band | `#2B3160` at alpha 200/255 | the front layer; composites to about `#232750` over black |
| latent band | `#2B3160` at alpha 90/255 | the unresolved state before reveal |
| ring | `#5A6EDC` | ambient progress |
| again | `#D8434E` | feedback flash |
| hard | `#E08A2E` | feedback flash |
| good | `#3FA35B` | feedback flash |
| easy | `#3B82F6` | feedback flash |

Constraints inherited from Zepp's colour doc [Certain]: avoid greys with RGB
channels between 1 and 46 (they render muddy on this AMOLED), keep
foreground to background contrast at 3:1 or more. Primary on ground is about
17:1; secondary on the composited band is about 9:1.

Colour never carries a meaning alone. Every colour change is paired with a
position or a haptic.

## 6. Layers

| Layer | Content | Behaviour |
| --- | --- | --- |
| 0 ground | black | never changes |
| 1 base, behind | primary content in the primary box | arrives first; may shrink one step if the band appears and lines collide (they do not by construction) |
| 2 front | band plus secondary content in the secondary box | latent (alpha 90, empty) until measured, then alpha 200 with content |
| 3 transient | feedback only: band colour flash, ring advance | at most 250 ms, never text |

Revealing means layer 2 appearing over layer 1. Content never migrates
between layers to change meaning. The note, when asked for, swaps into
layer 2 in place of the answer; the screen still holds exactly two pieces
of information.

## 7. Inputs

**The uncomfortable fact first.** [Likely] The two side buttons are not a JS
app's to take. Zepp's physical-buttons design doc states that JS
applications do not have permission to intercept button taps; only the one
second and five second long presses. The system reserves upper tap for the
app list and lower tap for quick start, and double tap is not a gesture two
button watches support at all. The `onKey` API exists, delivers `KEY_HOME`
and `KEY_SHORTCUT` with click, long press, press and release events, and
lets a callback return `true` to skip the default [Certain, API doc and
typings]. Whether the firmware honours that `true` for a tap on this watch
is exactly what the input probe settles (section 10). Design for three tiers
so the grammar survives either answer.

**Grammar.** Six verbs. Every screen binds the same verbs to the same inputs.

| Verb | Means | Tier 1: buttons (if the probe says yes) | Tier 2: swipes | Tier 3: tap zones |
| --- | --- | --- | --- | --- |
| ADVANCE | reveal; when revealed, accept (Good) | upper button click | | tap the upper field |
| REJECT | Again | lower button click | | tap the band |
| PROMOTE | Easy | | swipe up, after reveal | |
| DEMOTE | Hard | | swipe down, after reveal | |
| MORE | show the note in the band | | swipe left | |
| LEAVE | back | | swipe right (system default, kept) | |

Deck list uses the same bindings: ADVANCE opens the shown deck, REJECT steps
to the next deck (the list is a cycle, one deck on screen at a time, name in
the primary box, due count as a bare number in the band), swipe left syncs.

If taps are not interceptable but one second holds are: upper hold =
ADVANCE, lower hold = REJECT. Try it for a day before deciding; a one second
hold per card is slow, and tap zones may win. Never bind double click (not
supported) or five second holds (power menu).

**Tap zones** are the whole upper field and the whole band. They need no
eyes: the field is the top two thirds of the glass, the band is the bottom
third. No small targets exist anywhere.

**Feedback**, always without words:

| Event | Visual | Haptic (`@zos/sensor` Vibrator) |
| --- | --- | --- |
| reveal | band alpha 90 to 200, secondary appears | none |
| Good, Easy | band flashes its colour 200 ms, next card | `VIBRATOR_SCENE_SHORT_LIGHT` |
| Again, Hard | band flashes its colour 200 ms, card requeued | `VIBRATOR_SCENE_SHORT_STRONG` |
| session end | ring closes to a full circle | `VIBRATOR_SCENE_SHORT_MIDDLE` |

Response under 100 ms. Screen stays lit 45 s per face (setting). No
confirmation dialogs anywhere.

## 8. Screens (Mneme under this guide)

**Choose.** Primary box: deck name at the largest step that fits. Band: due
count as a bare number at S1, or empty when nothing is due. Ring: fraction
of today's cards already done across all decks. ADVANCE opens. REJECT steps
to the next deck. Swipe left syncs; the ring spins while it runs.

**Recall, latent.** Primary box: the prompt. Band at alpha 90, empty. Ring:
session progress. Nothing else.

**Recall, resolved.** Primary shrinks one step only if it had three lines.
Band at alpha 200 with the answer at S1 or S2. MORE swaps the note in.
ADVANCE accepts, REJECT rejects, PROMOTE and DEMOTE refine.

**Done.** Primary box: cards reviewed, bare number. Band: cards to relearn,
bare number, or empty. Ring full. ADVANCE learns ten more new cards if any
remain; LEAVE goes back.

The current Mneme pages violate this guide on purpose: they were built to
prove function first. Section 11 lists the changes.

## 9. Do not

- No labels, captions, titles, hints, "Show answer", "Sync", "12 left".
- No more than two pieces of information on screen. The note replaces the
  answer; it never joins it.
- No on-screen buttons where a button, a swipe or a zone exists.
- No scrolling text (`text_style.NONE` is a marquee). Wrap or shrink.
- No text under 32 px. No Light weight. No condensed face.
- No animation over 250 ms. No motion that has to finish before input works.
- No colour as sole carrier of meaning.
- No greys with channels 1 to 46. No white backgrounds.
- No dialogs, toasts with sentences, or confirmations.

## 10. Verify on the watch

The design rests on two facts only the hardware can confirm.

1. **Buttons.** Open Mneme, tap `input probe` at the bottom of the deck
   list. Press the upper button, the lower button, hold each for a second,
   swipe in all four directions. Each event prints as a line (`HOME click`,
   `SHORTCUT long press`, `swipe up`). If pressing a button throws you out
   to the app list, that tap is not interceptable and Tier 1 for that verb
   falls back to Tier 3. Report the lines back and the bindings get fixed.
2. **Legibility.** Hold the visual companion page open on your phone at
   wrist distance, glasses off, and read the type specimen in its physical
   scale mode. The smallest row you read without effort is your floor. If
   it is above 32 px, the scale shifts up one step across the board and the
   28 character content rule tightens to match.

## 11. Implementation notes for Zepp OS

- TEXT: `font: 'fonts/NotoSansGreek-Regular.ttf'`, `text_style.WRAP`,
  `line_space`, `align.CENTER_H` and `CENTER_V`; resize with
  `setProperty(prop.MORE, { y, h, text_size, text })` [Certain, TEXT doc].
- Band: `FILL_RECT` with `alpha` (API_LEVEL 3.0 and up), full width, `y`
  300, `h` 166 [Certain, FILL_RECT doc]. The round mask clips it.
- Ring: `ARC` at `x 6, y 6, w 454, h 454`, `line_width 4`, `start_angle
  -90`; 0 degrees is three o'clock [Certain, ARC doc].
- Inputs: one `onKey` and one `onGesture` registration per page, made in
  `build`, removed with `offKey()` and `offGesture()` in `onDestroy`.
  Return `true` to skip the system default [Certain, API docs].
- Haptics: `new Vibrator()` then `start({ mode: VIBRATOR_SCENE_SHORT_LIGHT })`
  [Certain, Vibrator doc].
- Screen: `setPageBrightTime`, `pauseDropWristScreenOff`, `setScrollLock`.
- Tap zones: two full-size `BUTTON` widgets in ground colour with empty
  text, created before the text widgets so text draws above them.

Changes to Mneme that this guide asks for, in order: strip labels from the
deck list and review page; replace the four grade buttons and "Show answer"
with zones, swipes and (after the probe) buttons; add the band and ring; add
haptics; move the note behind MORE; add the calibration scale setting; trim
starter deck backs to 28 characters.

## 12. Sources

- Zepp OS device list, physical keys, physical buttons design, onKey,
  onGesture, TEXT, FILL_RECT, ARC, Vibrator, font and colour pages, read
  from the `zepp-health/zeppos-docs` repository on 2026-09-26.
- M. Zych, F. Costa, I. Pikovski, Č. Brukner, "Quantum interferometric
  visibility as a witness of general relativistic proper time", Nature
  Communications 2, 505 (2011).
- A. R. H. Smith, M. Ahmadi, "Quantum clocks observe classical and quantum
  time dilation", Nature Communications 11, 5360 (2020).
- D. N. Page, W. K. Wootters, "Evolution without evolution", Physical
  Review D 27, 2885 (1983).
- N. Steno, De solido intra solidum naturaliter contento (1669), the law of
  superposition.

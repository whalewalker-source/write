# Simple Superposition

A design guide for reading, interacting and learning on the Amazfit Active 2
(Round) without glasses. Written for Mneme, meant for anything that runs on
this watch.

Status tags: [Certain] hard evidence (device docs, typings, measurement, the
watch itself), [Likely] strong inference, [Guessing] filling a gap. Untagged
rules are design decisions, not facts.

Revision 3. The screen is two equal halves; each field is its half plus a
third of a half past the midline, so the fields overlap through the middle
third and the band fades in across that whole zone. Text fills its field by
measurement, never below the calibrated 52 px floor, and keeps to its own
half. Both side buttons are confirmed interceptable, so all four grades live
on the buttons.

## 1. Premise

**The reader.** Near-sighted, no glasses at the wrist. The watch sits about
35 cm from the eyes. Whatever is on screen has to survive blur: large
x-height, hard contrast, few glyphs, nothing small anywhere. [Certain,
measured 2026-09-26] 52 px is the smallest size read comfortably at wrist
distance on a true-scale specimen.

**The device.** [Certain] Amazfit Active 2 (Round): 466 x 466 px, round,
1.32 in AMOLED, two physical buttons on the right, no rotating crown,
API_LEVEL 4.2 on Zepp OS 5.0 (Zepp device list, Active 2 Round row,
deviceSource 10092803 among eight ids).

| Fact | Value |
| --- | --- |
| Pixel pitch | 33.5 mm / 466 px = 0.072 mm per px |
| 100 px | 7.2 mm |
| Centre, radius | (233, 233), 233 px |
| Buttons | upper = HOME, lower = SHORTCUT [Certain, two-key layout doc] |
| Button positions | about 2 o'clock and 4 o'clock on the case [Likely] |

**The rules you gave.** Two equal parts. The upper part is overlapped by the
lower by a third of its height, and the lower by the upper by a third of its
height. The two fields overlap each other obviously and run past the edges
of the screen by the same 20 px they used to overlap by. Content always
fills its field, growing and shrinking about the fixed centre of that field.
The larger, upper piece is tinted back where the lower one covers it.
Buttons first, cardinal swipes second. No labels.

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
when asked for, never a third stratum. The middle third of the screen is
where the strata visibly interleave.

**Simple.** Zero labels. No captions, headers, hints, counters with words,
icons that need explaining, or on-screen buttons when a physical input or a
gesture exists. State is carried by three things only: position (upper or
lower), layer (behind or in front), weight (size and colour). If a screen
needs a word that is not content, the screen is wrong.

## 3. Canvas: two halves, each a third into the other

All numbers are design pixels on the 466 face; `s()` in `utils/layout.js`
rescales them for another round device.

| Constant | Value | Meaning |
| --- | --- | --- |
| midline | y 233 | the screen split into two equal halves |
| intrusion | 78 px | a third of a half: how far each field crosses the midline |
| bleed | 20 px | how far each field runs past the visible edge |

**Fields**

| Field | x, y, w, h | Text centre | Text may not cross | Notes |
| --- | --- | --- | --- | --- |
| Primary (behind) | −20, −20, 506, 331 | (233, 145.5) | y 233 | bleeds over the top and sides; ends 78 px below the midline |
| Band (in front) | −20, 155, 506, 331 | (233, 320.5) | y 233 | starts 78 px above the midline; bleeds over the bottom and sides |
| Overlap | y 155 to 311 | | | the middle third of the screen, shared by both fields |
| Ring | r 231, width 3 | | | hairline at the edge, drawn before the text |

The two fields are the same size, mirror images about the midline, and
overlap by 156 px: quite literally and quite obviously.

**The feather.** The band does not have an edge. It fades in across the
whole overlap, 8 strips of 19 to 20 px with alpha rising in equal steps
(1/9, 2/9 … 8/9 of full), then the body at full alpha from y 311 down.
Whatever part of the primary's text reaches into the overlap shows through
the strips, tinted back more the lower it goes. That is the visible
superposition, and it has no jarring line.

**Text keeps to its half.** Each field's text is centred on the field's
centre and may not cross the midline. With centres 87.5 px from the
midline, a text block can be at most 175 px tall in either field: one row
up to 150 px, two rows up to 75, three rows up to 50 (which is under the
floor, so in practice two rows). The fields overlap; the texts never do, in
any state. Without this rule a one-letter prompt at 290 px would sit under
the answer.

**Where the edge really is.** The screen edge is the circle. For a row of
text spanning rows y0 to y1, the allowed width is the narrowest chord
across that span plus twice the bleed, never more than 506:

| Row (y) | Chord | Allowed line width |
| --- | --- | --- |
| 40 | 261 | 301 |
| 60 | 312 | 352 |
| 80 | 351 | 391 |
| 100 | 383 | 423 |
| 145.5 (primary text centre) | 432 | 472 |
| 155 (band top) | 439 | 479 |
| 233 (midline) | 466 | 506 |
| 311 (primary bottom) | 439 | 479 |
| 320.5 (band text centre) | 432 | 472 |
| 360 | 391 | 431 |
| 400 | 325 | 365 |
| 420 | 278 | 318 |

**One anchor per field.** Each text widget's box is the whole field, with
horizontal and vertical centring, so the block grows and shrinks about the
field centre and nothing else on the screen moves. The primary text centre
is 87.5 px above the display centre and the band's 87.5 px below it: as
close to the middle as two non-colliding texts can sit.

Two physical anchors make this feel native to the hardware [Likely]: the
upper button sits level with the upper half, the lower button level with the
lower half. Upper button acts on the top layer's content; lower button acts
on the bottom layer's content. Never cross them.

## 4. Type: measured to fill

**Face.** Noto Sans, the Zepp OS system face [Certain, Zepp font doc].
Mneme bundles a 128 KB subset with Latin, Greek and Greek Extended so
breathings, iota subscripts and circumflexes exist as precomposed glyphs.
[Certain] The watch does no shaping: every string must be Unicode NFC. The
Anki converter and the deck tests enforce this.

**Weight.** Regular today. If blur is still a problem, add a Noto Sans
Medium subset for the primary layer only. Medium holds its counters under
blur; Bold closes them. Never Light.

**The fill rule.** There is no fixed scale. For every piece of content the
watch finds the largest size at which the text, wrapped inside its field,
obeys five limits, and uses it. [Certain] `getTextLayout(text, { text_size,
text_width, wrapped: 1, rows_max })` from `@zos/ui` returns width, height,
row count and whether it had to truncate, without drawing anything.

```
fit(text, field):
  lo = floor (52), hi = 300
  while lo <= hi:
    size = midpoint
    lay  = getTextLayout(text, { text_size: size, text_width: field.w,
                                 wrapped: 1, rows_max: field.maxRows })
    ok   = lay.result === 0                    # nothing truncated
        && lay.height <= field.h               # block fits the field
        && block stays on its side of the midline
        && every row's width <= narrowest chord across that row + 2 * bleed
    if ok: best = size, lo = size + 1  else hi = size - 1
  if nothing fit: search again between 32 and 51 and flag "below floor"
  if still nothing: show the engine's truncated text at 32 and flag it
```

Limits: primary up to 3 rows, band up to 2 rows, comfortable floor 52 px (a
setting, calibrated on your eyes), hard floor 32 px, wrapping only at
spaces. Shrink, never scroll. Truncation exists only as the last fallback
for content that is too long, and it is a bug in the deck, not the layout.

**What the rule yields.** Average Noto Sans advance about 0.56 em, row
height 1.16 em (Zepp's figure for Greek and Latin [Certain, font doc]).
Indicative; the watch measures the real string. The two fields are mirror
images, so one table serves both.

| Characters | Size | Rows |
| --- | --- | --- |
| 1 to 3 | 151 px (the 175 px block cap) | 1 |
| 5 | 132 px | 1 |
| 8 | 91 px | 1 |
| 10 | 75 px | 1 |
| 12 to 15 | 75 px | 2 |
| 18 | 71 px | 2 |
| 20 | 66 px | 2 |
| 21 | 61 px | 2 |
| 24 | 57 px | 2 |
| 26 | 54 px | 2 |
| 27 and up | under the floor | |

The legibility ladder (96, 80, 64, 52, 44, 36, 32) stays as a calibration
instrument in the companion page. It is not a layout rule.

| Size | Cap height | At 35 cm | About |
| --- | --- | --- | --- |
| 96 | 4.9 mm | 48′ | 20/190 |
| 80 | 4.1 mm | 40′ | 20/160 |
| 64 | 3.3 mm | 32′ | 20/130 |
| 52 | 2.7 mm | 26′ | 20/105, your floor |
| 44 | 2.3 mm | 22′ | 20/90 |
| 36 | 1.9 mm | 18′ | 20/73 |
| 32 | 1.6 mm | 16′ | 20/65, hard floor |

Other rules:

- Give the widget the whole field as its box; the fit keeps the block inside
  it. Use the engine's default row spacing so what was measured is what is
  drawn.
- Letter spacing 0. No condensed faces. No italics.
- Numbers are content, not labels: a bare number in the band is allowed
  (cards due), a number with a word is not.
- Bleed clips glyphs. At the widest row a first or last letter can lose up
  to 20 px. That is the look you asked for; if a clipped breathing ever costs
  a reading, drop the bleed to 10.

**Content rule that follows.** Fronts up to 24 characters, backs up to 20,
and both render at 57 px or more. Twenty-six characters is the ceiling
before the floor is hit. Keep the first meaning on the back; move the rest
into the note (the converter's `--first-meaning` does this). Verb principal
parts live in the note and are shown only on request. The bundled decks
follow this and the deck tests enforce it.

## 5. Colour

Black ground because the pixels are off: highest contrast, no halo around
the glyphs for an uncorrected eye, and the round mask disappears.

| Token | Value | Role |
| --- | --- | --- |
| ground | `#000000` | everything behind everything |
| primary | `#EDEDED` | primary text; a step under white to soften bloom |
| secondary | `#C9CFEA` | secondary text; cool tint marks the other layer |
| band | `#2B3160` at alpha 200/255 | the front layer's body; composites to about `#232750` over black |
| feather | `#2B3160` at alpha 22 to 178 in 8 steps | the band's fade across the overlap |
| latent | the same shape at 45% of those alphas (body 90) | the unresolved state before reveal |
| ring | `#5A6EDC` | ambient progress |
| again | `#D8434E` | feedback flash |
| hard | `#E08A2E` | feedback flash |
| good | `#3FA35B` | feedback flash |
| easy | `#3B82F6` | feedback flash |

Constraints inherited from Zepp's colour doc [Certain]: avoid greys with RGB
channels between 1 and 46 (they render muddy on this AMOLED), keep
foreground to background contrast at 3:1 or more. Primary on ground is about
17:1; secondary on the composited band about 9:1.

Colour never carries a meaning alone. Every colour change is paired with a
position or a haptic.

## 6. Layers

| Layer | Content | Behaviour |
| --- | --- | --- |
| 0 ground | black, the two tap zones, the 3 px ring at r 231 | never changes except the ring's arc |
| 1 base, behind | primary text filling the upper field | arrives first; unchanged by reveal |
| 2 front | the feathered band plus secondary text filling the lower field | latent (45% alpha, empty) until measured, then full alpha with content |
| 3 transient | feedback only: band colour flash, ring advance | at most 200 ms, never text |

Revealing means layer 2 gaining content and density over layer 1. Content
never migrates between layers to change meaning. The note, when asked for,
swaps into layer 2 in place of the answer; the screen still holds exactly
two pieces of information.

The ring is the one element that competes with bleeding glyphs. It is drawn
first, so text passes over it. If it reads as noise on the watch, remove it;
nothing else depends on it.

## 7. Inputs

**Confirmed on the watch, 2026-09-26.** [Certain] The input probe printed
all sixteen events: press, release and click for each button, press, long
press and release for a one second hold of each, and all four swipes, and
the app stayed in the foreground. Zepp's design doc says JS apps cannot
intercept button taps; on this firmware they can, and `onKey` returning
`true` suppresses the system's app-list and quick-start defaults. Double
click is not a gesture two-button watches support, and the five second hold
is the power menu; neither is bound.

**Grammar.** Six verbs. Every screen binds the same verbs to the same inputs.

| Verb | Means | Buttons | Swipes | Tap zones |
| --- | --- | --- | --- | --- |
| ADVANCE | reveal; when revealed, accept (Good) | upper click | | tap the upper half |
| REJECT | reveal; when revealed, Again | lower click | | tap the lower half |
| PROMOTE | Easy, after reveal | upper hold (1 s) | swipe up | |
| DEMOTE | Hard, after reveal | lower hold (1 s) | swipe down | |
| MORE | note replaces the answer in the band, and back | | swipe left | |
| LEAVE | back | | swipe right (system default, kept) | |

Deck list: ADVANCE opens the shown deck, REJECT steps to the next deck,
lower hold or swipe down steps back, upper hold or swipe left syncs with the
phone. Done screen: ADVANCE learns ten more new cards if any remain and
otherwise leaves, REJECT leaves.

The two-button watch has no rotating crown, so the buttons are the whole
tier: two clicks and two holds cover the four grades. A one second hold per
Easy or Hard is acceptable because Good is the common case and takes one
click.

**Tap zones** are the whole upper half and the whole lower half, split at
the midline. They need no eyes.

**Feedback**, always without words:

| Event | Visual | Haptic (`@zos/sensor` Vibrator) |
| --- | --- | --- |
| reveal | band 45% to full alpha, answer appears | none |
| step deck, toggle note | | `VIBRATOR_SCENE_SHORT_LIGHT` |
| Good, Easy | band flashes its colour 200 ms, next card | `VIBRATOR_SCENE_SHORT_LIGHT` |
| Again, Hard | band flashes its colour 200 ms, card requeued | `VIBRATOR_SCENE_SHORT_STRONG` |
| session end | ring closes and turns green | `VIBRATOR_SCENE_SHORT_MIDDLE` |
| sync | ring turns pale while running, band flashes green or red on completion | light, then middle or strong |

Response under 100 ms. Screen stays lit 45 s per face (setting). No
confirmation dialogs anywhere.

## 8. Screens (Mneme 0.2)

**Choose.** Upper field: deck name, fitted. Band: due count as a bare
number, fitted, band at full alpha; when only new cards remain, their count
at latent alpha; when nothing waits, empty and latent. Ring: fraction of
today's reviews already done across all decks.

**Recall, latent.** Upper field: the prompt, fitted, unchanged for the rest
of the card's life. Band latent, empty. Ring: session progress.

**Recall, resolved.** Band at full alpha with the answer, fitted. MORE swaps
the note in and out. Grades flash the band and move on.

**Done.** Upper field: cards reviewed, bare number. Band: cards that came
back as Again, bare number, or empty. Ring full and green.

## 9. Do not

- No labels, captions, titles, hints, "Show answer", "Sync", "12 left".
- No more than two pieces of information on screen. The note replaces the
  answer; it never joins it.
- No on-screen buttons where a button, a swipe or a zone exists.
- No fixed type sizes. Every piece of content is fitted to its field.
- No text crossing the midline. Fields overlap; texts never do.
- No scrolling text (`text_style.NONE` is a marquee). Wrap or shrink.
- No text under the calibrated floor except as a flagged fallback. No Light
  weight. No condensed face.
- No moving anchors: a field's box never changes, only its text size.
- No animation over 200 ms. No motion that has to finish before input works.
- No colour as sole carrier of meaning.
- No greys with channels 1 to 46. No white backgrounds.
- No dialogs, toasts, or confirmations.

## 10. Verified and still open

Verified on the watch: both buttons' taps and holds and all four swipes
reach the app and can be intercepted; 52 px is the comfortable floor.

Still open, and visible on first run of 0.2:

1. **Bleed.** [Likely] Widgets placed at negative coordinates and wider than
   the screen draw clipped. If the firmware refuses them, the fields shrink
   to the visible square and bleed applies only through the chord rule,
   losing at most 20 px at the single widest row.
2. **Measurement and the bundled font.** [Likely] `getTextLayout` measures
   with the system Noto Sans, which has the same metrics as the bundled
   subset. If fitted text ever clips a row, the difference is the cause, and
   a 4% safety factor on the measured width fixes it.
3. **The feather on hardware.** Eight alpha strips over a black ground
   should read as one gradient at 353 ppi. If banding shows, raise the step
   count to 12.

## 11. Implementation notes for Zepp OS

- Geometry: `utils/layout.js` derives everything from the device size:
  midline, intrusion, bleed, the two fields with their text limits, zones,
  ring.
- Fit: `utils/fit.js` is pure and tested; the stage passes it
  `getTextLayout`. Each field's `TEXT` widget has the field as its box,
  `align.CENTER_H` and `CENTER_V`, `text_style.WRAP`, the bundled font, and
  changes only `text_size` and `text` through `setProperty(prop.MORE, …)`
  [Certain, TEXT doc].
- Stage: `utils/stage.js` builds the layers in order: two ground-coloured
  `BUTTON` zones (taps), the `ARC` ring, the primary `TEXT`, eight
  `FILL_RECT` feather strips and the body (all `alpha`, API_LEVEL 3.0 and
  up [Certain, FILL_RECT doc]), the secondary `TEXT`.
- Inputs: one `onKey` and one `onGesture` registration per page, made in
  `build`, removed with `offKey()` and `offGesture()` in `onDestroy`;
  callbacks return `true` for HOME and SHORTCUT so the system's defaults do
  not fire, and `false` for swipe right so the system's back still works.
- Haptics: `new Vibrator()` then `start({ mode })` [Certain, Vibrator doc].
- Screen: `setPageBrightTime`, `pauseDropWristScreenOff`, `setScrollLock`.
- Settings: the comfortable floor is `floor` in the Zepp app settings page,
  mirrored to the watch on sync or at once while the app is open.

## 12. Sources

- Zepp OS device list, physical keys, physical buttons design, onKey,
  onGesture, getTextLayout, TEXT, FILL_RECT, ARC, Vibrator, font and colour
  pages, read from the `zepp-health/zeppos-docs` repository on 2026-09-26.
- Input probe run on the Amazfit Active 2 (Round), firmware 7.23.0.1,
  2026-09-26.
- M. Zych, F. Costa, I. Pikovski, Č. Brukner, "Quantum interferometric
  visibility as a witness of general relativistic proper time", Nature
  Communications 2, 505 (2011).
- A. R. H. Smith, M. Ahmadi, "Quantum clocks observe classical and quantum
  time dilation", Nature Communications 11, 5360 (2020).
- D. N. Page, W. K. Wootters, "Evolution without evolution", Physical
  Review D 27, 2885 (1983).
- N. Steno, De solido intra solidum naturaliter contento (1669), the law of
  superposition.

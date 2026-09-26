# Simple Superposition

A design guide for reading, interacting and learning on the Amazfit Active 2
(Round) without glasses. Written for Mneme, meant for anything that runs on
this watch.

Status tags: [Certain] hard evidence (device docs, typings, measurement),
[Likely] strong inference, [Guessing] filling a gap. Untagged rules are
design decisions, not facts.

Revision 2: overlap doubled to 20 px, fields bleed 20 px past the screen,
text fills its field by measurement instead of stepping through a fixed
scale, and every field grows and shrinks about one fixed centre.

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
behind the small one. The two overlap each other by 20 px and run past the
edges of the screen by the same 20 px. Content always fills its field: fewer
characters mean bigger type, more mean smaller, and the block grows and
shrinks about the fixed centre of its field. Buttons first, cardinal swipes
second. No labels: only content is ever on screen.

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

## 3. Canvas: two fields that overlap each other and the screen

All numbers are design pixels on the 466 face; `s()` in `utils/layout.js`
rescales them for any other round device. Two constants drive everything:

| Constant | Value | Meaning |
| --- | --- | --- |
| overlap | 20 px | how far the two fields overlap each other |
| bleed | 20 px | how far each field runs past the visible edge |
| two-thirds line | y 311 | the split, measured on the visible screen |

**Fields**

| Field | x, y, w, h | Centre | Notes |
| --- | --- | --- | --- |
| Primary field (behind) | −20, −20, 506, 341 | (233, 150.5) | bleeds 20 px over the top and both sides; ends 10 px below the split |
| Band (in front) | −20, 301, 506, 185 | (233, 393.5) | bleeds 20 px over the bottom and both sides; starts 10 px above the split |
| Overlap zone | y 301 to 321 | | the band covers this strip of the primary field |
| Ring | r 231, width 3 | | hairline at the very edge, drawn before the text |

The band is a `FILL_RECT` at alpha 200 when resolved, 90 when latent. The
round mask clips both fields; the parts outside the circle exist only so
that content can run to and past the edge.

**Where the edge really is.** The screen edge is the circle, not the
bounding square, so "20 px past the edge" is measured at the circle. For a
line of text spanning rows y0 to y1, the allowed width is the narrowest
chord across that span plus twice the bleed, never more than 506:

| Row (y) | Chord | Allowed line width (chord + 40) |
| --- | --- | --- |
| 20 | 189 | 229 |
| 40 | 261 | 301 |
| 60 | 312 | 352 |
| 84 | 358 | 398 |
| 120 | 408 | 448 |
| 150.5 (primary centre) | 436 | 476 |
| 233 | 466 | 506 |
| 301 (band top) | 446 | 486 |
| 311 (split) | 439 | 479 |
| 321 (primary bottom) | 431 | 471 |
| 350 | 403 | 443 |
| 393.5 (band centre) | 338 | 378 |
| 420 | 278 | 318 |
| 440 | 214 | 254 |
| 460 | 105 | 145 |

**One anchor per field.** Each text widget's box is the whole field, with
horizontal and vertical centring. Only `text_size` changes. The block
therefore always grows and shrinks about the field centre: (233, 150.5) for
the primary, (233, 393.5) for the band. Nothing else on the screen moves.

The primary centre sits 82 px above the display centre. A two-thirds split
and a central anchor pull against each other; the split won. A 3/5 split
would put the anchor at y 170, a half split at 233 with a band half the
screen. Say the word and the tables regenerate.

Two physical anchors make the split feel native to the hardware [Likely]:
the upper button sits level with the primary field, the lower button level
with the band. Upper button acts on the top layer's content; lower button
acts on the bottom layer's content. Never cross them.

## 4. Type: measured to fill

**Face.** Noto Sans, the Zepp OS system face [Certain, Zepp font doc].
Mneme bundles a 128 KB subset with Latin, Greek and Greek Extended so
breathings, iota subscripts and circumflexes exist as precomposed glyphs.
[Certain] The watch does no shaping: every string must be Unicode NFC. The
Anki converter and the deck tests enforce this.

**Weight.** Regular today. If blur is still a problem after calibration,
add a Noto Sans Medium subset for the primary layer only. Medium holds its
counters under blur; Bold closes them. Never Light.

**The fill rule.** There is no fixed scale. For every piece of content the
watch finds the largest size at which the text, wrapped inside its field,
obeys four limits, and uses it. [Certain] `getTextLayout(text, { text_size,
text_width, wrapped: 1, rows_max })` from `@zos/ui` returns width, height,
row count and whether it had to truncate, without drawing anything.

```
fit(text, field):
  lo = 32, hi = 300
  while lo <= hi:
    size = midpoint
    lay  = getTextLayout(text, { text_size: size, text_width: field.w,
                                 wrapped: 1, rows_max: field.maxRows })
    ok   = lay.result === 0                      # nothing truncated
        && lay.height <= field.h                 # block fits the field
        && every row's width <= narrowest chord across that row + 2 * bleed
    if ok: best = size, lo = size + 1  else hi = size - 1
  return best                                    # 32 if nothing fits: content too long
```

Row geometry for the chord test: block top = field centre − height / 2, row
height = height / rows, row i spans [top + i·rowH, top + (i + 1)·rowH].
`getTextLayout` reports one width for the block, so the widest row is
tested against every row's chord, which is conservative near the top of the
primary field and the bottom of the band. That is the safe side.

Limits: primary up to 3 rows, band up to 2 rows, floor 32 px everywhere,
wrapping only at spaces (a single long word is one row and simply gets
smaller). Shrink, never scroll, never ellipsis.

**What the rule yields.** Average Noto Sans advance about 0.56 em for Greek
and Latin, row height 1.16 em (Zepp's own figure for these scripts
[Certain, font doc]). Indicative; the watch measures the real string.

| Characters | Primary field | Band |
| --- | --- | --- |
| 1 | 250 px, 1 row | 124 px |
| 2 | 218 px | 117 px |
| 3 | 184 px | 106 px |
| 5 | 134 px | 85 px |
| 8 | 109 px, 2 rows (one word: about 92 on 1 row) | 64 px |
| 10 | 100 px, 2 rows | 56 px, 2 rows |
| 12 | 92 px, 2 rows | 53 px, 2 rows |
| 15 | 78 px, 2 rows | |
| 20 | 70 px, 2 rows | 42 px, 2 rows |
| 25 | 61 px, 3 rows | 38 px at 24 |
| 28 | | 35 px, 2 rows |
| 32 | 56 px, 3 rows | 32 px, the floor |
| 44 | 44 px, 3 rows | too long |

The legibility ladder (96, 80, 64, 52, 44, 36, 32) stays as a calibration
instrument in the companion page: it is what you read at wrist distance to
find your floor. It is no longer a layout rule.

| Size | Cap height | At 35 cm | About |
| --- | --- | --- | --- |
| 96 | 4.9 mm | 48′ | 20/190 |
| 80 | 4.1 mm | 40′ | 20/160 |
| 64 | 3.3 mm | 32′ | 20/130 |
| 52 | 2.7 mm | 26′ | 20/105 |
| 44 | 2.3 mm | 22′ | 20/90 |
| 36 | 1.9 mm | 18′ | 20/73 |
| 32 | 1.6 mm | 16′ | 20/65 |

Other rules:

- Row spacing: `line_space = round(0.16 * text_size)`. Give the widget the
  whole field as its box; the fit already keeps the block inside it.
- Polytonic capitals carry marks above the cap line; the 1.16 row height
  covers them. Letter spacing 0. No condensed faces. No italics.
- Numbers are content, not labels: a bare number in the band is allowed
  (cards due), a number with a word is not.
- Bleed clips glyphs. At the widest row a first or last letter can lose up
  to 20 px, which on a 96 px glyph is about a fifth of its width. That is
  the look you asked for; if a clipped breathing ever costs you a reading,
  drop the bleed to 10 and keep the overlap at 20.

**Content rule that follows.** A card back of 20 characters or fewer reads
at 42 px or more; 32 characters is the hard ceiling before the floor is
hit. Keep the first meaning on the back; move the rest into the note. Verb
principal parts live in the note and are shown only on request. The
starter deck violates this in places and will be trimmed to match.

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
| 0 ground | black, plus the 3 px ring at r 231 | never changes except the ring's arc |
| 1 base, behind | primary content filling the primary field | arrives first; refits when the band appears only if the content has to change |
| 2 front | band plus secondary content filling the band | latent (alpha 90, empty) until measured, then alpha 200 with content |
| 3 transient | feedback only: band colour flash, ring advance | at most 250 ms, never text |

The band overlaps the last 20 px of the primary field. When the primary
runs to three rows, its last row's descenders dip under the band's edge and
dim: that strip is the visible superposition. Revealing means layer 2
appearing over layer 1. Content never migrates between layers to change
meaning. The note, when asked for, swaps into layer 2 in place of the
answer; the screen still holds exactly two pieces of information.

The ring is the one element that competes with bleeding glyphs. It is drawn
first, so text passes over it. If it reads as noise on the watch, remove it;
nothing else in the guide depends on it.

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
| ADVANCE | reveal; when revealed, accept (Good) | upper button click | | tap the primary field |
| REJECT | Again | lower button click | | tap the band |
| PROMOTE | Easy | | swipe up, after reveal | |
| DEMOTE | Hard | | swipe down, after reveal | |
| MORE | show the note in the band | | swipe left | |
| LEAVE | back | | swipe right (system default, kept) | |

Deck list uses the same bindings: ADVANCE opens the shown deck, REJECT steps
to the next deck (the list is a cycle, one deck on screen at a time, name
filling the primary field, due count as a bare number filling the band),
swipe left syncs.

If taps are not interceptable but one second holds are: upper hold =
ADVANCE, lower hold = REJECT. Try it for a day before deciding; a one second
hold per card is slow, and tap zones may win. Never bind double click (not
supported) or five second holds (power menu).

**Tap zones** are the whole primary field and the whole band, split at
y 311. They need no eyes: the field is the top two thirds of the glass, the
band is the bottom third. No small targets exist anywhere.

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

**Choose.** Primary field: deck name, fitted. Band: due count as a bare
number, fitted (a two-digit count lands near 117 px), or empty when nothing
is due. Ring: fraction of today's cards already done across all decks.
ADVANCE opens. REJECT steps to the next deck. Swipe left syncs; the ring
spins while it runs.

**Recall, latent.** Primary field: the prompt, fitted. Band at alpha 90,
empty. Ring: session progress. Nothing else.

**Recall, resolved.** Primary unchanged. Band at alpha 200 with the answer,
fitted. MORE swaps the note in, refitted. ADVANCE accepts, REJECT rejects,
PROMOTE and DEMOTE refine.

**Done.** Primary field: cards reviewed, bare number, fitted. Band: cards to
relearn, bare number, or empty. Ring full. ADVANCE learns ten more new
cards if any remain; LEAVE goes back.

The current Mneme pages violate this guide on purpose: they were built to
prove function first. Section 11 lists the changes.

## 9. Do not

- No labels, captions, titles, hints, "Show answer", "Sync", "12 left".
- No more than two pieces of information on screen. The note replaces the
  answer; it never joins it.
- No on-screen buttons where a button, a swipe or a zone exists.
- No fixed type sizes. Every piece of content is fitted to its field.
- No scrolling text (`text_style.NONE` is a marquee). Wrap or shrink.
- No text under 32 px. No Light weight. No condensed face.
- No moving anchors: a field's box never changes, only its text size.
- No animation over 250 ms. No motion that has to finish before input works.
- No colour as sole carrier of meaning.
- No greys with channels 1 to 46. No white backgrounds.
- No dialogs, toasts with sentences, or confirmations.

## 10. Verify on the watch

The design rests on three facts only the hardware can confirm.

1. **Buttons.** Open Mneme, tap `input probe` at the bottom of the deck
   list. Press the upper button, the lower button, hold each for a second,
   swipe in all four directions. Each event prints as a line (`HOME click`,
   `SHORTCUT long press`, `swipe up`). If pressing a button throws you out
   to the app list, that tap is not interceptable and Tier 1 for that verb
   falls back to Tier 3. Report the lines back and the bindings get fixed.
2. **Legibility.** Hold the visual companion page open on your phone at
   wrist distance, glasses off, and read the ladder in its physical scale
   mode. The smallest row you read without effort is your floor. If it is
   above 32 px, the floor in the fit rule rises to match and the content
   ceiling tightens.
3. **Bleed.** Widgets placed at negative coordinates and wider than the
   screen [Likely] draw clipped, which is what the fields need. If the
   firmware refuses them, the fields shrink to 0, 0, 466 and the bleed
   applies only through the chord rule, which loses at most the 20 px at
   the single widest row.

## 11. Implementation notes for Zepp OS

- Fields: one `TEXT` per field, box equal to the field (`x −20, y −20, w 506,
  h 341` and `x −20, y 301, w 506, h 185`), `align.CENTER_H` and
  `CENTER_V`, `text_style.WRAP`, `font: 'fonts/NotoSansGreek-Regular.ttf'`.
  Change only `text_size`, `line_space` and `text` through
  `setProperty(prop.MORE, {...})` [Certain, TEXT doc].
- Fit: binary search over `getTextLayout` as in section 4, then apply. Cache
  the result per card and face; a deck of 500 cards costs nothing to refit
  lazily.
- Band: `FILL_RECT` with `alpha` (API_LEVEL 3.0 and up), `x −20, y 301,
  w 506, h 185` [Certain, FILL_RECT doc]. The round mask clips it.
- Ring: `ARC` at `x 2, y 2, w 462, h 462`, `line_width 3`, `start_angle -90`;
  0 degrees is three o'clock [Certain, ARC doc]. Create it first.
- Inputs: one `onKey` and one `onGesture` registration per page, made in
  `build`, removed with `offKey()` and `offGesture()` in `onDestroy`.
  Return `true` to skip the system default [Certain, API docs].
- Haptics: `new Vibrator()` then `start({ mode: VIBRATOR_SCENE_SHORT_LIGHT })`
  [Certain, Vibrator doc].
- Screen: `setPageBrightTime`, `pauseDropWristScreenOff`, `setScrollLock`.
- Tap zones: two `BUTTON` widgets in ground colour with empty text covering
  the primary field and the band, created before the text widgets so text
  draws above them.

Changes to Mneme that this guide asks for, in order: strip labels from the
deck list and review page; replace the four grade buttons and "Show answer"
with zones, swipes and (after the probe) buttons; add the band, the fit
routine and the ring; add haptics; move the note behind MORE; add the
calibration floor setting; trim starter deck backs to 20 characters where
possible and 32 at most.

## 12. Sources

- Zepp OS device list, physical keys, physical buttons design, onKey,
  onGesture, getTextLayout, TEXT, FILL_RECT, ARC, Vibrator, font and colour
  pages, read from the `zepp-health/zeppos-docs` repository on 2026-09-26.
- M. Zych, F. Costa, I. Pikovski, Č. Brukner, "Quantum interferometric
  visibility as a witness of general relativistic proper time", Nature
  Communications 2, 505 (2011).
- A. R. H. Smith, M. Ahmadi, "Quantum clocks observe classical and quantum
  time dilation", Nature Communications 11, 5360 (2020).
- D. N. Page, W. K. Wootters, "Evolution without evolution", Physical
  Review D 27, 2885 (1983).
- N. Steno, De solido intra solidum naturaliter contento (1669), the law of
  superposition.

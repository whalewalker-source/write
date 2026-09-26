// A small non-vocabulary deck, to show the app handles any prompt/answer pair.
// Present indicative active endings of thematic verbs, plus the article.
// Backs stay short; the fuller description is in the note.
export default {
  id: 'greek-endings',
  name: 'Greek endings',
  cards: [
    { id: 'pres-1s', f: '-ω', b: '1st sg.', n: 'present indicative active · λύω' },
    { id: 'pres-2s', f: '-εις', b: '2nd sg.', n: 'present indicative active · λύεις' },
    { id: 'pres-3s', f: '-ει', b: '3rd sg.', n: 'present indicative active · λύει' },
    { id: 'pres-1p', f: '-ομεν', b: '1st pl.', n: 'present indicative active · λύομεν' },
    { id: 'pres-2p', f: '-ετε', b: '2nd pl.', n: 'present indicative active · λύετε' },
    { id: 'pres-3p', f: '-ουσι(ν)', b: '3rd pl.', n: 'present indicative active · λύουσι(ν)' },
    { id: 'art-nom-s', f: 'ὁ, ἡ, τό', b: 'nom. sg.', n: 'the: nominative singular (m, f, n)' },
    { id: 'art-gen-s', f: 'τοῦ, τῆς, τοῦ', b: 'gen. sg.', n: 'the: genitive singular (m, f, n)' },
    { id: 'art-dat-s', f: 'τῷ, τῇ, τῷ', b: 'dat. sg.', n: 'the: dative singular (m, f, n)' },
    { id: 'art-acc-s', f: 'τόν, τήν, τό', b: 'acc. sg.', n: 'the: accusative singular (m, f, n)' },
    { id: 'art-nom-p', f: 'οἱ, αἱ, τά', b: 'nom. pl.', n: 'the: nominative plural (m, f, n)' },
    { id: 'art-gen-p', f: 'τῶν', b: 'gen. pl.', n: 'the: genitive plural (all genders)' },
    { id: 'art-dat-p', f: 'τοῖς, ταῖς, τοῖς', b: 'dat. pl.', n: 'the: dative plural (m, f, n)' },
    { id: 'art-acc-p', f: 'τούς, τάς, τά', b: 'acc. pl.', n: 'the: accusative plural (m, f, n)' }
  ]
}

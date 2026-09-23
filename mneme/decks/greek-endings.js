// A small non-vocabulary deck, to show the app handles any prompt/answer pair.
// Present indicative active endings of thematic verbs, plus the article.
export default {
  id: 'greek-endings',
  name: 'Greek endings',
  cards: [
    { id: 'pres-1s', f: '-ω', b: '1st sg. present active', n: 'λύω' },
    { id: 'pres-2s', f: '-εις', b: '2nd sg. present active', n: 'λύεις' },
    { id: 'pres-3s', f: '-ει', b: '3rd sg. present active', n: 'λύει' },
    { id: 'pres-1p', f: '-ομεν', b: '1st pl. present active', n: 'λύομεν' },
    { id: 'pres-2p', f: '-ετε', b: '2nd pl. present active', n: 'λύετε' },
    { id: 'pres-3p', f: '-ουσι(ν)', b: '3rd pl. present active', n: 'λύουσι(ν)' },
    { id: 'art-nom-s', f: 'ὁ, ἡ, τό', b: 'the — nominative singular (m, f, n)', n: '' },
    { id: 'art-gen-s', f: 'τοῦ, τῆς, τοῦ', b: 'the — genitive singular (m, f, n)', n: '' },
    { id: 'art-dat-s', f: 'τῷ, τῇ, τῷ', b: 'the — dative singular (m, f, n)', n: '' },
    { id: 'art-acc-s', f: 'τόν, τήν, τό', b: 'the — accusative singular (m, f, n)', n: '' },
    { id: 'art-nom-p', f: 'οἱ, αἱ, τά', b: 'the — nominative plural (m, f, n)', n: '' },
    { id: 'art-gen-p', f: 'τῶν', b: 'the — genitive plural (all genders)', n: '' },
    { id: 'art-dat-p', f: 'τοῖς, ταῖς, τοῖς', b: 'the — dative plural (m, f, n)', n: '' },
    { id: 'art-acc-p', f: 'τούς, τάς, τά', b: 'the — accusative plural (m, f, n)', n: '' }
  ]
}

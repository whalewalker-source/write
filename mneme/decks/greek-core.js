// Starter deck: high-frequency Attic vocabulary in dictionary form.
// Nouns: nominative, genitive, article. Adjectives: m, f, n. Verbs: first
// principal part on the front, the rest in the note. Replace or extend it
// with your own Anki export (see README).
export default {
  id: 'greek-core',
  name: 'Greek core',
  cards: [
    // nouns
    { id: 'logos', f: 'λόγος, λόγου, ὁ', b: 'word, speech; account, reason', n: '' },
    { id: 'arche', f: 'ἀρχή, ἀρχῆς, ἡ', b: 'beginning; rule, empire', n: '' },
    { id: 'anthropos', f: 'ἄνθρωπος, ἀνθρώπου, ὁ', b: 'human being, man', n: '' },
    { id: 'theos', f: 'θεός, θεοῦ, ὁ', b: 'god', n: '' },
    { id: 'polis', f: 'πόλις, πόλεως, ἡ', b: 'city, city-state', n: '' },
    { id: 'aner', f: 'ἀνήρ, ἀνδρός, ὁ', b: 'man, husband', n: '' },
    { id: 'gyne', f: 'γυνή, γυναικός, ἡ', b: 'woman, wife', n: '' },
    { id: 'ergon', f: 'ἔργον, ἔργου, τό', b: 'work, deed', n: '' },
    { id: 'psyche', f: 'ψυχή, ψυχῆς, ἡ', b: 'soul, life', n: '' },
    { id: 'nomos', f: 'νόμος, νόμου, ὁ', b: 'law, custom', n: '' },
    { id: 'dike', f: 'δίκη, δίκης, ἡ', b: 'justice; lawsuit; penalty', n: '' },
    { id: 'polemos', f: 'πόλεμος, πολέμου, ὁ', b: 'war', n: '' },
    { id: 'eirene', f: 'εἰρήνη, εἰρήνης, ἡ', b: 'peace', n: '' },
    { id: 'arete', f: 'ἀρετή, ἀρετῆς, ἡ', b: 'excellence, virtue', n: '' },
    { id: 'basileus', f: 'βασιλεύς, βασιλέως, ὁ', b: 'king', n: '' },
    { id: 'thalatta', f: 'θάλαττα, θαλάττης, ἡ', b: 'sea', n: 'Attic; elsewhere θάλασσα' },
    { id: 'ge', f: 'γῆ, γῆς, ἡ', b: 'earth, land', n: '' },
    { id: 'ouranos', f: 'οὐρανός, οὐρανοῦ, ὁ', b: 'sky, heaven', n: '' },
    { id: 'chronos', f: 'χρόνος, χρόνου, ὁ', b: 'time', n: '' },
    { id: 'hemera', f: 'ἡμέρα, ἡμέρας, ἡ', b: 'day', n: '' },
    { id: 'nyx', f: 'νύξ, νυκτός, ἡ', b: 'night', n: '' },
    { id: 'pragma', f: 'πρᾶγμα, πράγματος, τό', b: 'thing, matter, affair', n: '' },
    { id: 'soma', f: 'σῶμα, σώματος, τό', b: 'body', n: '' },
    { id: 'pais', f: 'παῖς, παιδός, ὁ / ἡ', b: 'child, boy, girl; slave', n: '' },
    { id: 'pater', f: 'πατήρ, πατρός, ὁ', b: 'father', n: '' },
    { id: 'meter', f: 'μήτηρ, μητρός, ἡ', b: 'mother', n: '' },
    { id: 'philos', f: 'φίλος, φίλου, ὁ', b: 'friend', n: 'also adj. φίλος, -η, -ον dear' },
    { id: 'hodos', f: 'ὁδός, ὁδοῦ, ἡ', b: 'road, way, journey', n: '' },
    { id: 'physis', f: 'φύσις, φύσεως, ἡ', b: 'nature', n: '' },
    { id: 'demos', f: 'δῆμος, δήμου, ὁ', b: 'the people; deme', n: '' },
    // verbs
    {
      id: 'lego',
      f: 'λέγω',
      b: 'say, speak; pick up, count',
      n: 'λέγω, λέξω / ἐρῶ, ἔλεξα / εἶπον, εἴρηκα, λέλεγμαι / εἴρημαι, ἐλέχθην / ἐρρήθην'
    },
    { id: 'lyo', f: 'λύω', b: 'loosen, release, destroy', n: 'λύω, λύσω, ἔλυσα, λέλυκα, λέλυμαι, ἐλύθην' },
    {
      id: 'paideuo',
      f: 'παιδεύω',
      b: 'educate, teach',
      n: 'παιδεύω, παιδεύσω, ἐπαίδευσα, πεπαίδευκα, πεπαίδευμαι, ἐπαιδεύθην'
    },
    { id: 'poieo', f: 'ποιέω', b: 'make, do', n: 'ποιέω, ποιήσω, ἐποίησα, πεποίηκα, πεποίημαι, ἐποιήθην' },
    { id: 'echo', f: 'ἔχω', b: 'have, hold', n: 'ἔχω, ἕξω / σχήσω, ἔσχον, ἔσχηκα, -ἔσχημαι, —' },
    {
      id: 'gignomai',
      f: 'γίγνομαι',
      b: 'become, be born, happen',
      n: 'γίγνομαι, γενήσομαι, ἐγενόμην, γέγονα, γεγένημαι, —'
    },
    { id: 'eimi', f: 'εἰμί', b: 'be', n: 'εἰμί, ἔσομαι; impf. ἦν' },
    { id: 'erchomai', f: 'ἔρχομαι', b: 'come, go', n: 'ἔρχομαι, ἐλεύσομαι / εἶμι, ἦλθον, ἐλήλυθα' },
    {
      id: 'horao',
      f: 'ὁράω',
      b: 'see',
      n: 'ὁράω, ὄψομαι, εἶδον, ἑόρακα / ἑώρακα, ἑώραμαι / ὦμμαι, ὤφθην'
    },
    { id: 'lambano', f: 'λαμβάνω', b: 'take, receive', n: 'λαμβάνω, λήψομαι, ἔλαβον, εἴληφα, εἴλημμαι, ἐλήφθην' },
    { id: 'didomi', f: 'δίδωμι', b: 'give', n: 'δίδωμι, δώσω, ἔδωκα, δέδωκα, δέδομαι, ἐδόθην' },
    { id: 'tithemi', f: 'τίθημι', b: 'put, place', n: 'τίθημι, θήσω, ἔθηκα, τέθηκα, τέθειμαι (κεῖμαι), ἐτέθην' },
    {
      id: 'histemi',
      f: 'ἵστημι',
      b: 'make stand, set up; (intrans.) stand',
      n: 'ἵστημι, στήσω, ἔστησα / ἔστην, ἕστηκα, ἕσταμαι, ἐστάθην'
    },
    { id: 'phero', f: 'φέρω', b: 'carry, bear', n: 'φέρω, οἴσω, ἤνεγκα / ἤνεγκον, ἐνήνοχα, ἐνήνεγμαι, ἠνέχθην' },
    { id: 'ago', f: 'ἄγω', b: 'lead', n: 'ἄγω, ἄξω, ἤγαγον, ἦχα, ἦγμαι, ἤχθην' },
    { id: 'manthano', f: 'μανθάνω', b: 'learn', n: 'μανθάνω, μαθήσομαι, ἔμαθον, μεμάθηκα' },
    {
      id: 'gignosko',
      f: 'γιγνώσκω',
      b: 'know, recognize; decide',
      n: 'γιγνώσκω, γνώσομαι, ἔγνων, ἔγνωκα, ἔγνωσμαι, ἐγνώσθην'
    },
    { id: 'boulomai', f: 'βούλομαι', b: 'want, wish', n: 'βούλομαι, βουλήσομαι, —, —, βεβούλημαι, ἐβουλήθην' },
    { id: 'oida', f: 'οἶδα', b: 'know', n: 'οἶδα, εἴσομαι; plpf. ᾔδη (perfect with present sense)' },
    { id: 'phemi', f: 'φημί', b: 'say, assert', n: 'φημί, φήσω, ἔφησα; impf. ἔφην' },
    // adjectives and pronouns
    { id: 'agathos', f: 'ἀγαθός, ἀγαθή, ἀγαθόν', b: 'good', n: '' },
    { id: 'kakos', f: 'κακός, κακή, κακόν', b: 'bad, evil', n: '' },
    { id: 'kalos', f: 'καλός, καλή, καλόν', b: 'beautiful, fine, noble', n: '' },
    { id: 'megas', f: 'μέγας, μεγάλη, μέγα', b: 'big, great', n: '' },
    { id: 'polys', f: 'πολύς, πολλή, πολύ', b: 'much; (pl.) many', n: '' },
    { id: 'pas', f: 'πᾶς, πᾶσα, πᾶν', b: 'all, every, whole', n: '' },
    { id: 'houtos', f: 'οὗτος, αὕτη, τοῦτο', b: 'this', n: '' },
    { id: 'ekeinos', f: 'ἐκεῖνος, ἐκείνη, ἐκεῖνο', b: 'that', n: '' },
    {
      id: 'autos',
      f: 'αὐτός, αὐτή, αὐτό',
      b: 'self (intensive); the same (with article); him, her, it (oblique cases)',
      n: ''
    },
    { id: 'tis-encl', f: 'τις, τι', b: 'someone, something; a certain', n: 'enclitic' },
    { id: 'tis-q', f: 'τίς; τί;', b: 'who? what? why?', n: 'interrogative, always acute' },
    // particles, conjunctions, negatives
    { id: 'men-de', f: 'μέν … δέ', b: 'on the one hand … on the other', n: 'both postpositive' },
    { id: 'gar', f: 'γάρ', b: 'for (explains what precedes)', n: 'postpositive' },
    { id: 'oun', f: 'οὖν', b: 'therefore, then', n: 'postpositive' },
    { id: 'alla', f: 'ἀλλά', b: 'but', n: '' },
    { id: 'kai', f: 'καί', b: 'and; also, even', n: 'καί … καί both … and' },
    { id: 'ou', f: 'οὐ, οὐκ, οὐχ', b: 'not (statements of fact)', n: 'οὐκ before vowel, οὐχ before rough breathing' },
    { id: 'me', f: 'μή', b: 'not (with imperative, subjunctive, infinitive)', n: '' },
    { id: 'hoste', f: 'ὥστε', b: 'so that, so as to (result)', n: '' },
    { id: 'hina', f: 'ἵνα', b: 'in order that (purpose)', n: 'with subjunctive or optative' },
    // prepositions
    { id: 'en', f: 'ἐν (+ dat.)', b: 'in, among', n: '' },
    { id: 'eis', f: 'εἰς (+ acc.)', b: 'into, to', n: '' },
    { id: 'ek', f: 'ἐκ, ἐξ (+ gen.)', b: 'out of, from', n: 'ἐξ before a vowel' },
    { id: 'pros', f: 'πρός', b: '(+ acc.) to, toward; (+ gen.) from; (+ dat.) near, in addition to', n: '' },
    { id: 'epi', f: 'ἐπί', b: '(+ gen.) on, upon; (+ dat.) on, at; (+ acc.) onto, against', n: '' },
    { id: 'dia', f: 'διά', b: '(+ gen.) through; (+ acc.) on account of', n: '' },
    { id: 'hypo', f: 'ὑπό', b: '(+ gen.) by (agent), under; (+ dat.) under; (+ acc.) under (motion)', n: '' },
    { id: 'peri', f: 'περί', b: '(+ gen.) about, concerning; (+ acc.) around', n: '' },
    { id: 'apo', f: 'ἀπό (+ gen.)', b: 'from, away from', n: '' },
    { id: 'meta', f: 'μετά', b: '(+ gen.) with; (+ acc.) after', n: '' }
  ]
}

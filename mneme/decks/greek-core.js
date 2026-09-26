// Starter deck: high-frequency Attic vocabulary in dictionary form.
// Fronts: nominative, genitive, article for nouns; m, f, n for adjectives;
// first principal part for verbs. Backs carry the first meaning only, at
// most 20 characters, so they fill the band above the comfortable floor.
// Everything else lives in the note, shown on request (swipe left).
export default {
  id: 'greek-core',
  name: 'Greek core',
  cards: [
    // nouns
    { id: 'logos', f: 'λόγος, λόγου, ὁ', b: 'word', n: 'speech; account, reason' },
    { id: 'arche', f: 'ἀρχή, ἀρχῆς, ἡ', b: 'beginning', n: 'rule, empire' },
    { id: 'anthropos', f: 'ἄνθρωπος, ἀνθρώπου, ὁ', b: 'human being', n: 'man' },
    { id: 'theos', f: 'θεός, θεοῦ, ὁ', b: 'god', n: '' },
    { id: 'polis', f: 'πόλις, πόλεως, ἡ', b: 'city', n: 'city-state' },
    { id: 'aner', f: 'ἀνήρ, ἀνδρός, ὁ', b: 'man', n: 'husband' },
    { id: 'gyne', f: 'γυνή, γυναικός, ἡ', b: 'woman', n: 'wife' },
    { id: 'ergon', f: 'ἔργον, ἔργου, τό', b: 'work', n: 'deed' },
    { id: 'psyche', f: 'ψυχή, ψυχῆς, ἡ', b: 'soul', n: 'life' },
    { id: 'nomos', f: 'νόμος, νόμου, ὁ', b: 'law', n: 'custom' },
    { id: 'dike', f: 'δίκη, δίκης, ἡ', b: 'justice', n: 'lawsuit; penalty' },
    { id: 'polemos', f: 'πόλεμος, πολέμου, ὁ', b: 'war', n: '' },
    { id: 'eirene', f: 'εἰρήνη, εἰρήνης, ἡ', b: 'peace', n: '' },
    { id: 'arete', f: 'ἀρετή, ἀρετῆς, ἡ', b: 'excellence', n: 'virtue' },
    { id: 'basileus', f: 'βασιλεύς, βασιλέως, ὁ', b: 'king', n: '' },
    { id: 'thalatta', f: 'θάλαττα, θαλάττης, ἡ', b: 'sea', n: 'Attic; elsewhere θάλασσα' },
    { id: 'ge', f: 'γῆ, γῆς, ἡ', b: 'earth', n: 'land' },
    { id: 'ouranos', f: 'οὐρανός, οὐρανοῦ, ὁ', b: 'sky', n: 'heaven' },
    { id: 'chronos', f: 'χρόνος, χρόνου, ὁ', b: 'time', n: '' },
    { id: 'hemera', f: 'ἡμέρα, ἡμέρας, ἡ', b: 'day', n: '' },
    { id: 'nyx', f: 'νύξ, νυκτός, ἡ', b: 'night', n: '' },
    { id: 'pragma', f: 'πρᾶγμα, πράγματος, τό', b: 'thing', n: 'matter, affair' },
    { id: 'soma', f: 'σῶμα, σώματος, τό', b: 'body', n: '' },
    { id: 'pais', f: 'παῖς, παιδός, ὁ / ἡ', b: 'child', n: 'boy, girl; slave' },
    { id: 'pater', f: 'πατήρ, πατρός, ὁ', b: 'father', n: '' },
    { id: 'meter', f: 'μήτηρ, μητρός, ἡ', b: 'mother', n: '' },
    { id: 'philos', f: 'φίλος, φίλου, ὁ', b: 'friend', n: 'also adj. φίλος, -η, -ον dear' },
    { id: 'hodos', f: 'ὁδός, ὁδοῦ, ἡ', b: 'road', n: 'way, journey' },
    { id: 'physis', f: 'φύσις, φύσεως, ἡ', b: 'nature', n: '' },
    { id: 'demos', f: 'δῆμος, δήμου, ὁ', b: 'the people', n: 'deme' },
    // verbs
    {
      id: 'lego',
      f: 'λέγω',
      b: 'say',
      n: 'speak; pick up, count · λέγω, λέξω / ἐρῶ, ἔλεξα / εἶπον, εἴρηκα, λέλεγμαι / εἴρημαι, ἐλέχθην / ἐρρήθην'
    },
    { id: 'lyo', f: 'λύω', b: 'loosen', n: 'release, destroy · λύω, λύσω, ἔλυσα, λέλυκα, λέλυμαι, ἐλύθην' },
    {
      id: 'paideuo',
      f: 'παιδεύω',
      b: 'educate',
      n: 'teach · παιδεύω, παιδεύσω, ἐπαίδευσα, πεπαίδευκα, πεπαίδευμαι, ἐπαιδεύθην'
    },
    { id: 'poieo', f: 'ποιέω', b: 'make', n: 'do · ποιέω, ποιήσω, ἐποίησα, πεποίηκα, πεποίημαι, ἐποιήθην' },
    { id: 'echo', f: 'ἔχω', b: 'have', n: 'hold · ἔχω, ἕξω / σχήσω, ἔσχον, ἔσχηκα, -ἔσχημαι, —' },
    {
      id: 'gignomai',
      f: 'γίγνομαι',
      b: 'become',
      n: 'be born, happen · γίγνομαι, γενήσομαι, ἐγενόμην, γέγονα, γεγένημαι, —'
    },
    { id: 'eimi', f: 'εἰμί', b: 'be', n: 'εἰμί, ἔσομαι; impf. ἦν' },
    { id: 'erchomai', f: 'ἔρχομαι', b: 'come', n: 'go · ἔρχομαι, ἐλεύσομαι / εἶμι, ἦλθον, ἐλήλυθα' },
    {
      id: 'horao',
      f: 'ὁράω',
      b: 'see',
      n: 'ὁράω, ὄψομαι, εἶδον, ἑόρακα / ἑώρακα, ἑώραμαι / ὦμμαι, ὤφθην'
    },
    { id: 'lambano', f: 'λαμβάνω', b: 'take', n: 'receive · λαμβάνω, λήψομαι, ἔλαβον, εἴληφα, εἴλημμαι, ἐλήφθην' },
    { id: 'didomi', f: 'δίδωμι', b: 'give', n: 'δίδωμι, δώσω, ἔδωκα, δέδωκα, δέδομαι, ἐδόθην' },
    { id: 'tithemi', f: 'τίθημι', b: 'put', n: 'place · τίθημι, θήσω, ἔθηκα, τέθηκα, τέθειμαι (κεῖμαι), ἐτέθην' },
    {
      id: 'histemi',
      f: 'ἵστημι',
      b: 'make stand',
      n: 'set up; (intrans.) stand · ἵστημι, στήσω, ἔστησα / ἔστην, ἕστηκα, ἕσταμαι, ἐστάθην'
    },
    { id: 'phero', f: 'φέρω', b: 'carry', n: 'bear · φέρω, οἴσω, ἤνεγκα / ἤνεγκον, ἐνήνοχα, ἐνήνεγμαι, ἠνέχθην' },
    { id: 'ago', f: 'ἄγω', b: 'lead', n: 'ἄγω, ἄξω, ἤγαγον, ἦχα, ἦγμαι, ἤχθην' },
    { id: 'manthano', f: 'μανθάνω', b: 'learn', n: 'μανθάνω, μαθήσομαι, ἔμαθον, μεμάθηκα' },
    {
      id: 'gignosko',
      f: 'γιγνώσκω',
      b: 'know',
      n: 'recognize; decide · γιγνώσκω, γνώσομαι, ἔγνων, ἔγνωκα, ἔγνωσμαι, ἐγνώσθην'
    },
    { id: 'boulomai', f: 'βούλομαι', b: 'want', n: 'wish · βούλομαι, βουλήσομαι, —, —, βεβούλημαι, ἐβουλήθην' },
    { id: 'oida', f: 'οἶδα', b: 'know', n: 'οἶδα, εἴσομαι; plpf. ᾔδη (perfect with present sense)' },
    { id: 'phemi', f: 'φημί', b: 'say', n: 'assert · φημί, φήσω, ἔφησα; impf. ἔφην' },
    // adjectives and pronouns
    { id: 'agathos', f: 'ἀγαθός, ἀγαθή, ἀγαθόν', b: 'good', n: '' },
    { id: 'kakos', f: 'κακός, κακή, κακόν', b: 'bad', n: 'evil' },
    { id: 'kalos', f: 'καλός, καλή, καλόν', b: 'beautiful', n: 'fine, noble' },
    { id: 'megas', f: 'μέγας, μεγάλη, μέγα', b: 'big', n: 'great' },
    { id: 'polys', f: 'πολύς, πολλή, πολύ', b: 'much', n: '(pl.) many' },
    { id: 'pas', f: 'πᾶς, πᾶσα, πᾶν', b: 'all', n: 'every, whole' },
    { id: 'houtos', f: 'οὗτος, αὕτη, τοῦτο', b: 'this', n: '' },
    { id: 'ekeinos', f: 'ἐκεῖνος, ἐκείνη, ἐκεῖνο', b: 'that', n: '' },
    {
      id: 'autos',
      f: 'αὐτός, αὐτή, αὐτό',
      b: 'self',
      n: 'the same (with article); him, her, it (oblique cases)'
    },
    { id: 'tis-encl', f: 'τις, τι', b: 'someone', n: 'something; a certain · enclitic' },
    { id: 'tis-q', f: 'τίς; τί;', b: 'who? what?', n: 'why? · interrogative, always acute' },
    // particles, conjunctions, negatives
    { id: 'men-de', f: 'μέν … δέ', b: 'on one hand …', n: 'on the one hand … on the other; both postpositive' },
    { id: 'gar', f: 'γάρ', b: 'for', n: 'explains what precedes; postpositive' },
    { id: 'oun', f: 'οὖν', b: 'therefore', n: 'then; postpositive' },
    { id: 'alla', f: 'ἀλλά', b: 'but', n: '' },
    { id: 'kai', f: 'καί', b: 'and', n: 'also, even · καί … καί both … and' },
    { id: 'ou', f: 'οὐ, οὐκ, οὐχ', b: 'not', n: 'statements of fact · οὐκ before vowel, οὐχ before rough breathing' },
    { id: 'me', f: 'μή', b: 'not (μή)', n: 'with imperative, subjunctive, infinitive' },
    { id: 'hoste', f: 'ὥστε', b: 'so that', n: 'so as to (result)' },
    { id: 'hina', f: 'ἵνα', b: 'in order that', n: 'purpose · with subjunctive or optative' },
    // prepositions
    { id: 'en', f: 'ἐν (+ dat.)', b: 'in', n: 'among' },
    { id: 'eis', f: 'εἰς (+ acc.)', b: 'into', n: 'to' },
    { id: 'ek', f: 'ἐκ, ἐξ (+ gen.)', b: 'out of', n: 'from · ἐξ before a vowel' },
    { id: 'pros', f: 'πρός', b: 'toward (+ acc.)', n: '(+ gen.) from; (+ dat.) near, in addition to' },
    { id: 'epi', f: 'ἐπί', b: 'on, upon (+ gen.)', n: '(+ dat.) on, at; (+ acc.) onto, against' },
    { id: 'dia', f: 'διά', b: 'through (+ gen.)', n: '(+ acc.) on account of' },
    { id: 'hypo', f: 'ὑπό', b: 'by, under (+ gen.)', n: '(+ dat.) under; (+ acc.) under (motion)' },
    { id: 'peri', f: 'περί', b: 'about (+ gen.)', n: 'concerning; (+ acc.) around' },
    { id: 'apo', f: 'ἀπό (+ gen.)', b: 'from', n: 'away from' },
    { id: 'meta', f: 'μετά', b: 'with (+ gen.)', n: '(+ acc.) after' }
  ]
}

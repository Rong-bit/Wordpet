// English grammar helpers for automatic verb tenses (三態) and noun plurals (複數變化)

// Comprehensive irregular verbs lookup table: [base]: [past, pastParticiple, ing]
const IRREGULAR_VERBS: Record<string, [string, string, string]> = {
  be: ['was/were', 'been', 'being'],
  is: ['was', 'been', 'being'],
  are: ['were', 'been', 'being'],
  am: ['was', 'been', 'being'],
  bear: ['bore', 'born', 'bearing'],
  beat: ['beat', 'beaten', 'beating'],
  become: ['became', 'become', 'becoming'],
  begin: ['began', 'begun', 'beginning'],
  bend: ['bent', 'bent', 'bending'],
  bet: ['bet', 'bet', 'betting'],
  bind: ['bound', 'bound', 'binding'],
  bite: ['bit', 'bitten', 'biting'],
  bleed: ['bled', 'bled', 'bleeding'],
  blow: ['blew', 'blown', 'blowing'],
  break: ['broke', 'broken', 'breaking'],
  breed: ['bred', 'bred', 'breeding'],
  bring: ['brought', 'brought', 'bringing'],
  broadcast: ['broadcast', 'broadcast', 'broadcasting'],
  build: ['built', 'built', 'building'],
  burn: ['burned/burnt', 'burned/burnt', 'burning'],
  burst: ['burst', 'burst', 'bursting'],
  buy: ['bought', 'bought', 'buying'],
  cast: ['cast', 'cast', 'casting'],
  catch: ['caught', 'caught', 'catching'],
  choose: ['chose', 'chosen', 'choosing'],
  cling: ['clung', 'clung', 'clinging'],
  come: ['came', 'come', 'coming'],
  cost: ['cost', 'cost', 'costing'],
  creep: ['crept', 'crept', 'creeping'],
  cut: ['cut', 'cut', 'cutting'],
  deal: ['dealt', 'dealt', 'dealing'],
  dig: ['dug', 'dug', 'digging'],
  do: ['did', 'done', 'doing'],
  draw: ['drew', 'drawn', 'drawing'],
  dream: ['dreamed/dreamt', 'dreamed/dreamt', 'dreaming'],
  drink: ['drank', 'drunk', 'drinking'],
  drive: ['drove', 'driven', 'driving'],
  eat: ['ate', 'eaten', 'eating'],
  fall: ['fell', 'fallen', 'falling'],
  feed: ['fed', 'fed', 'feeding'],
  feel: ['felt', 'felt', 'feeling'],
  fight: ['fought', 'fought', 'fighting'],
  find: ['found', 'found', 'finding'],
  flee: ['fled', 'fled', 'fleeing'],
  fly: ['flew', 'flown', 'flying'],
  forbid: ['forbade', 'forbidden', 'forbidding'],
  forget: ['forgot', 'forgotten', 'forgetting'],
  forgive: ['forgave', 'forgiven', 'forgiving'],
  freeze: ['froze', 'frozen', 'freezing'],
  get: ['got', 'got/gotten', 'getting'],
  give: ['gave', 'given', 'giving'],
  go: ['went', 'gone', 'going'],
  grind: ['ground', 'ground', 'grinding'],
  grow: ['grew', 'grown', 'growing'],
  hang: ['hung', 'hung', 'hanging'],
  have: ['had', 'had', 'having'],
  has: ['had', 'had', 'having'],
  hear: ['heard', 'heard', 'hearing'],
  hide: ['hid', 'hidden', 'hiding'],
  hit: ['hit', 'hit', 'hitting'],
  hold: ['held', 'held', 'holding'],
  hurt: ['hurt', 'hurt', 'hurting'],
  keep: ['kept', 'kept', 'keeping'],
  kneel: ['knelt', 'knelt', 'kneeling'],
  know: ['knew', 'known', 'knowing'],
  lay: ['laid', 'laid', 'laying'],
  lead: ['led', 'led', 'leading'],
  lean: ['leaned/leant', 'leaned/leant', 'leaning'],
  leap: ['leaped/leapt', 'leaped/leapt', 'leaping'],
  learn: ['learned/learnt', 'learned/learnt', 'learning'],
  leave: ['left', 'left', 'leaving'],
  lend: ['lent', 'lent', 'lending'],
  let: ['let', 'let', 'letting'],
  lie: ['lay', 'lain', 'lying'],
  light: ['lit/lighted', 'lit/lighted', 'lighting'],
  lose: ['lost', 'lost', 'losing'],
  make: ['made', 'made', 'making'],
  mean: ['meant', 'meant', 'meaning'],
  meet: ['met', 'met', 'meeting'],
  pay: ['paid', 'paid', 'paying'],
  put: ['put', 'put', 'putting'],
  quit: ['quit', 'quit', 'quitting'],
  read: ['read', 'read', 'reading'],
  ride: ['rode', 'ridden', 'riding'],
  ring: ['rang', 'rung', 'ringing'],
  rise: ['rose', 'risen', 'rising'],
  run: ['ran', 'run', 'running'],
  say: ['said', 'said', 'saying'],
  see: ['saw', 'seen', 'seeing'],
  seek: ['sought', 'sought', 'seeking'],
  sell: ['sold', 'sold', 'selling'],
  send: ['sent', 'sent', 'sending'],
  set: ['set', 'set', 'setting'],
  sew: ['sewed', 'sewn/sewed', 'sewing'],
  shake: ['shook', 'shaken', 'shaking'],
  shine: ['shone', 'shone', 'shining'],
  shoot: ['shot', 'shot', 'shooting'],
  show: ['showed', 'shown/showed', 'showing'],
  shrink: ['shrank', 'shrunk', 'shrinking'],
  shut: ['shut', 'shut', 'shutting'],
  sing: ['sang', 'sung', 'singing'],
  sink: ['sank', 'sunk', 'sinking'],
  sit: ['sat', 'sat', 'sitting'],
  sleep: ['slept', 'slept', 'sleeping'],
  slide: ['slid', 'slid', 'sliding'],
  smell: ['smelled/smelt', 'smelled/smelt', 'smelling'],
  speak: ['spoke', 'spoken', 'speaking'],
  speed: ['sped/speeded', 'sped/speeded', 'speeding'],
  spell: ['spelled/spelt', 'spelled/spelt', 'spelling'],
  spend: ['spent', 'spent', 'spending'],
  spill: ['spilled/spilt', 'spilled/spilt', 'spilling'],
  spin: ['spun', 'spun', 'spinning'],
  spit: ['spat', 'spat', 'spitting'],
  split: ['split', 'split', 'splitting'],
  spoil: ['spoiled/spoilt', 'spoiled/spoilt', 'spoiling'],
  spread: ['spread', 'spread', 'spreading'],
  spring: ['sprang', 'sprung', 'springing'],
  stand: ['stood', 'stood', 'standing'],
  steal: ['stole', 'stolen', 'stealing'],
  stick: ['stuck', 'stuck', 'sticking'],
  sting: ['stung', 'stung', 'stinging'],
  strike: ['struck', 'struck', 'striking'],
  swear: ['swore', 'sworn', 'swearing'],
  sweep: ['swept', 'swept', 'sweeping'],
  swim: ['swam', 'swum', 'swimming'],
  swing: ['swung', 'swung', 'swinging'],
  take: ['took', 'taken', 'taking'],
  teach: ['taught', 'taught', 'teaching'],
  tear: ['tore', 'torn', 'tearing'],
  tell: ['told', 'told', 'telling'],
  think: ['thought', 'thought', 'thinking'],
  throw: ['threw', 'thrown', 'throwing'],
  understand: ['understood', 'understood', 'understanding'],
  upset: ['upset', 'upset', 'upsetting'],
  wake: ['woke', 'woken', 'waking'],
  wear: ['wore', 'worn', 'wearing'],
  weave: ['wove', 'woven', 'weaving'],
  weep: ['wept', 'wept', 'weeping'],
  win: ['won', 'won', 'winning'],
  wind: ['wound', 'wound', 'winding'],
  withdraw: ['withdrew', 'withdrawn', 'withdrawing'],
  write: ['wrote', 'written', 'writing'],
};

// Irregular plural nouns lookup
const IRREGULAR_NOUNS: Record<string, string> = {
  child: 'children',
  person: 'people',
  man: 'men',
  woman: 'women',
  foot: 'feet',
  tooth: 'teeth',
  goose: 'geese',
  mouse: 'mice',
  ox: 'oxen',
  sheep: 'sheep',
  deer: 'deer',
  fish: 'fish',
  species: 'species',
  series: 'series',
  aircraft: 'aircraft',
  crisis: 'crises',
  analysis: 'analyses',
  thesis: 'theses',
  basis: 'bases',
  parenthesis: 'parentheses',
  datum: 'data',
  medium: 'media',
  bacterium: 'bacteria',
  curriculum: 'curricula',
  phenomenon: 'phenomena',
  criterion: 'criteria',
  cactus: 'cacti / cactuses',
  fungus: 'fungi',
  nucleus: 'nuclei',
  syllabus: 'syllabi',
  focus: 'foci / focuses',
  leaf: 'leaves',
  knife: 'knives',
  life: 'lives',
  wife: 'wives',
  half: 'halves',
  wolf: 'wolves',
  shelf: 'shelves',
  thief: 'thieves',
  calf: 'calves',
  loaf: 'loaves',
  hero: 'heroes',
  potato: 'potatoes',
  tomato: 'tomatoes',
  echo: 'echoes',
  veto: 'vetoes',
  photo: 'photos',
  piano: 'pianos',
  radio: 'radios',
  video: 'videos',
  zoo: 'zoos',
  roof: 'roofs',
  chief: 'chiefs',
  cliff: 'cliffs',
  safe: 'safes',
};

export interface VerbForms {
  base: string;
  past: string;
  pastParticiple: string;
  ing: string;
}

export interface NounForms {
  singular: string;
  plural: string;
}

const VOWELS = new Set(['a', 'e', 'i', 'o', 'u']);

/**
 * Automatically determine the three forms (and -ing) of any English verb.
 */
export function getVerbForms(rawVerb: string): VerbForms {
  const clean = rawVerb.trim().toLowerCase();
  if (!clean) {
    return { base: '', past: '', pastParticiple: '', ing: '' };
  }

  // 1. Direct irregular match
  if (IRREGULAR_VERBS[clean]) {
    const [past, pastParticiple, ing] = IRREGULAR_VERBS[clean];
    return { base: clean, past, pastParticiple, ing };
  }

  // 2. Prefixed irregular verb (e.g., overcome -> came, rewritten -> written)
  for (const baseIrreg in IRREGULAR_VERBS) {
    if (clean.endsWith(baseIrreg) && clean.length > baseIrreg.length) {
      const prefix = clean.slice(0, clean.length - baseIrreg.length);
      const [past, pastParticiple, ing] = IRREGULAR_VERBS[baseIrreg];
      return {
        base: clean,
        past: `${prefix}${past}`,
        pastParticiple: `${prefix}${pastParticiple}`,
        ing: `${prefix}${ing}`,
      };
    }
  }

  // 3. Regular verb inflection rules
  let past = '';
  let ing = '';

  const len = clean.length;
  const lastChar = clean[len - 1];
  const secondLastChar = len > 1 ? clean[len - 2] : '';
  const thirdLastChar = len > 2 ? clean[len - 3] : '';

  // -ing derivation
  if (clean.endsWith('ie')) {
    ing = `${clean.slice(0, -2)}ying`; // lie -> lying, tie -> tying
  } else if (clean.endsWith('ee') || clean.endsWith('oe') || clean.endsWith('ye')) {
    ing = `${clean}ing`; // see -> seeing
  } else if (lastChar === 'e') {
    ing = `${clean.slice(0, -1)}ing`; // write -> writing, love -> loving
  } else if (
    len >= 3 &&
    !VOWELS.has(lastChar) &&
    lastChar !== 'w' &&
    lastChar !== 'x' &&
    lastChar !== 'y' &&
    VOWELS.has(secondLastChar) &&
    !VOWELS.has(thirdLastChar)
  ) {
    // Single syllable / stressed CVC consonant doubling
    ing = `${clean}${lastChar}ing`; // stop -> stopping, plan -> planning
  } else {
    ing = `${clean}ing`;
  }

  // past & pastParticiple derivation
  if (lastChar === 'e') {
    past = `${clean}d`; // love -> loved, dance -> danced
  } else if (lastChar === 'y' && !VOWELS.has(secondLastChar)) {
    past = `${clean.slice(0, -1)}ied`; // study -> studied, cry -> cried
  } else if (
    len >= 3 &&
    !VOWELS.has(lastChar) &&
    lastChar !== 'w' &&
    lastChar !== 'x' &&
    lastChar !== 'y' &&
    VOWELS.has(secondLastChar) &&
    !VOWELS.has(thirdLastChar)
  ) {
    past = `${clean}${lastChar}ed`; // stop -> stopped, clap -> clapped
  } else {
    past = `${clean}ed`;
  }

  return {
    base: clean,
    past,
    pastParticiple: past,
    ing,
  };
}

/**
 * Automatically determine the plural form of any English noun.
 */
export function getNounForms(rawNoun: string): NounForms {
  const clean = rawNoun.trim().toLowerCase();
  if (!clean) {
    return { singular: '', plural: '' };
  }

  // 1. Direct irregular match
  if (IRREGULAR_NOUNS[clean]) {
    return { singular: clean, plural: IRREGULAR_NOUNS[clean] };
  }

  const len = clean.length;
  const lastChar = clean[len - 1];
  const secondLastChar = len > 1 ? clean[len - 2] : '';

  // 2. Rules
  // Ends in s, x, z, ch, sh
  if (
    clean.endsWith('s') ||
    clean.endsWith('x') ||
    clean.endsWith('z') ||
    clean.endsWith('ch') ||
    clean.endsWith('sh')
  ) {
    return { singular: clean, plural: `${clean}es` }; // bus -> buses, box -> boxes, watch -> watches
  }

  // Ends in consonant + y -> ies
  if (lastChar === 'y' && !VOWELS.has(secondLastChar)) {
    return { singular: clean, plural: `${clean.slice(0, -1)}ies` }; // baby -> babies, city -> cities
  }

  // Ends in f / fe -> ves
  if (clean.endsWith('fe')) {
    return { singular: clean, plural: `${clean.slice(0, -2)}ves` }; // knife -> knives, life -> lives
  }
  if (clean.endsWith('f') && clean !== 'cliff' && clean !== 'roof' && clean !== 'chief' && clean !== 'safe') {
    return { singular: clean, plural: `${clean.slice(0, -1)}ves` }; // leaf -> leaves, wolf -> wolves
  }

  // Ends in consonant + o -> usually es
  if (lastChar === 'o' && !VOWELS.has(secondLastChar)) {
    return { singular: clean, plural: `${clean}es` }; // hero -> heroes
  }

  // Default: + s
  return { singular: clean, plural: `${clean}s` };
}

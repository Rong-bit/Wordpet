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

export interface DetectedPOS {
  pos: 'v.' | 'n.' | 'adj.' | 'adv.' | 'phr.' | 'prep.';
  label: string;
  reason: string;
}

const COMMON_PREPOSITIONS = new Set([
  'in', 'on', 'at', 'by', 'for', 'with', 'about', 'against', 'between',
  'into', 'through', 'during', 'before', 'after', 'above', 'below', 'to',
  'from', 'up', 'down', 'under', 'behind', 'over', 'across', 'along',
  'among', 'around', 'without', 'within', 'toward', 'towards', 'onto',
  'upon', 'inside', 'outside', 'beside', 'beyond', 'throughout',
]);

const COMMON_BASE_VERBS = new Set([
  'take', 'make', 'go', 'come', 'get', 'see', 'know', 'give', 'find',
  'think', 'tell', 'become', 'leave', 'feel', 'put', 'bring', 'begin',
  'keep', 'hold', 'write', 'stand', 'hear', 'let', 'mean', 'set', 'meet',
  'run', 'pay', 'sit', 'speak', 'lie', 'lead', 'read', 'grow', 'lose',
  'fall', 'send', 'build', 'understand', 'draw', 'break', 'spend', 'cut',
  'rise', 'drive', 'buy', 'wear', 'choose', 'eat', 'swim', 'sing', 'fly',
  'teach', 'sell', 'throw', 'win', 'shake', 'forget', 'wake', 'like', 'love',
  'hate', 'want', 'need', 'help', 'work', 'play', 'live', 'stay', 'stop',
  'start', 'finish', 'open', 'close', 'ask', 'answer', 'try', 'look', 'watch',
  'listen', 'call', 'talk', 'walk', 'jump', 'move', 'change', 'turn', 'follow',
  'create', 'provide', 'allow', 'add', 'kill', 'reach', 'pass', 'decide',
  'return', 'hope', 'explain', 'carry', 'develop', 'agree', 'support', 'hit',
  'produce', 'cover', 'catch', 'enjoy', 'remember', 'prefer', 'learn', 'study',
  'protect', 'improve', 'increase', 'decrease', 'reduce', 'manage', 'practice',
  'describe', 'compare', 'connect', 'collect', 'discover', 'explore', 'invent',
]);

/**
 * Automatically analyze an English word and its Chinese meaning to determine its Part of Speech (詞性).
 */
export function detectPartOfSpeech(rawWord: string, rawMeaning: string): DetectedPOS {
  const cleanWord = rawWord.trim().toLowerCase();
  const cleanMeaning = rawMeaning.trim();

  // 1. Check for phrases (multiple words separated by spaces or hyphens)
  if (cleanWord.includes(' ') || cleanWord.includes('-')) {
    return {
      pos: 'phr.',
      label: 'phr. 片語',
      reason: '單字含空格或連字號，辨識為複合片語',
    };
  }

  // 2. Prepositions
  if (COMMON_PREPOSITIONS.has(cleanWord)) {
    return {
      pos: 'prep.',
      label: 'prep. 介系詞',
      reason: `「${cleanWord}」為常見英文介系詞`,
    };
  }
  if (
    cleanMeaning.startsWith('在...') ||
    cleanMeaning.startsWith('向...') ||
    cleanMeaning.startsWith('從...') ||
    cleanMeaning.startsWith('關於') ||
    cleanMeaning.startsWith('為了') ||
    cleanMeaning.startsWith('朝著') ||
    cleanMeaning.startsWith('隨著') ||
    cleanMeaning.startsWith('在...之間') ||
    cleanMeaning.includes('介系詞')
  ) {
    return {
      pos: 'prep.',
      label: 'prep. 介系詞',
      reason: '中文釋義具備介系詞特徵（在.../向.../關於）',
    };
  }

  // 3. Adjectives (adj.) - Strong Chinese signal (ends with '的')
  if (
    cleanMeaning.endsWith('的') ||
    cleanMeaning.includes('...的') ||
    cleanMeaning.includes('性的') ||
    cleanMeaning.endsWith('樣的') ||
    cleanMeaning.endsWith('似的')
  ) {
    return {
      pos: 'adj.',
      label: 'adj. 形容詞',
      reason: '中文釋義以「...的」結尾，強特徵為形容詞',
    };
  }

  // 4. Adverbs (adv.) - Strong Chinese signal (ends with '地' or '得') or English -ly
  if (
    cleanMeaning.endsWith('地') ||
    cleanMeaning.endsWith('得') ||
    cleanMeaning.includes('...地') ||
    cleanMeaning.startsWith('非常') ||
    cleanMeaning.startsWith('特別') ||
    cleanMeaning.startsWith('極其')
  ) {
    return {
      pos: 'adv.',
      label: 'adv. 副詞',
      reason: '中文釋義以「...地」或程度修飾特徵，辨識為副詞',
    };
  }
  if (
    cleanWord.length > 3 &&
    cleanWord.endsWith('ly') &&
    cleanWord !== 'family' &&
    cleanWord !== 'ally' &&
    cleanWord !== 'rely' &&
    cleanWord !== 'supply' &&
    cleanWord !== 'apply'
  ) {
    return {
      pos: 'adv.',
      label: 'adv. 副詞',
      reason: '英文具備副詞後綴「-ly」',
    };
  }
  if (cleanWord.endsWith('ward') || cleanWord.endsWith('wards') || cleanWord.endsWith('wise')) {
    return {
      pos: 'adv.',
      label: 'adv. 副詞',
      reason: '英文具備副詞方向/方式後綴（-ward / -wise）',
    };
  }

  // 5. English Suffix rules for Adjectives (adj.)
  if (
    cleanWord.endsWith('ful') ||
    cleanWord.endsWith('less') ||
    cleanWord.endsWith('able') ||
    cleanWord.endsWith('ible') ||
    cleanWord.endsWith('ous') ||
    cleanWord.endsWith('ious') ||
    cleanWord.endsWith('ive') ||
    cleanWord.endsWith('ative') ||
    cleanWord.endsWith('itive') ||
    cleanWord.endsWith('ic') ||
    cleanWord.endsWith('ical') ||
    cleanWord.endsWith('ish')
  ) {
    return {
      pos: 'adj.',
      label: 'adj. 形容詞',
      reason: '英文具備經典形容詞後綴（-ful/-able/-ous/-ive/-ic 等）',
    };
  }

  // 6. English Suffix rules for Nouns (n.)
  if (
    cleanWord.endsWith('tion') ||
    cleanWord.endsWith('sion') ||
    cleanWord.endsWith('ment') ||
    cleanWord.endsWith('ness') ||
    cleanWord.endsWith('ity') ||
    cleanWord.endsWith('ance') ||
    cleanWord.endsWith('ence') ||
    cleanWord.endsWith('ship') ||
    cleanWord.endsWith('hood') ||
    cleanWord.endsWith('dom') ||
    cleanWord.endsWith('ist') ||
    cleanWord.endsWith('ism') ||
    cleanWord.endsWith('logy') ||
    cleanWord.endsWith('graphy') ||
    cleanWord.endsWith('tude') ||
    IRREGULAR_NOUNS[cleanWord]
  ) {
    return {
      pos: 'n.',
      label: 'n. 名詞',
      reason: '英文具備經典名詞後綴（-tion/-ment/-ness/-ity 或名詞字典庫）',
    };
  }

  // 7. Check if in Verb dictionary or verb suffixes (-ize, -ify, -ate)
  if (
    IRREGULAR_VERBS[cleanWord] ||
    COMMON_BASE_VERBS.has(cleanWord) ||
    cleanWord.endsWith('ize') ||
    cleanWord.endsWith('ise') ||
    cleanWord.endsWith('ify') ||
    (cleanWord.endsWith('ate') && cleanWord.length > 4)
  ) {
    return {
      pos: 'v.',
      label: 'v. 動詞',
      reason: '符合動詞詞庫或動詞後綴（-ize/-ify/-ate 等）',
    };
  }

  // 8. Chinese verb action keywords
  const actionKeywords = [
    '使', '令', '讓', '做', '跑', '走', '吃', '喝', '拿', '帶', '放', '開',
    '關', '幫', '變', '給', '換', '加', '減', '贏', '輸', '建', '停', '住',
    '睡', '醒', '笑', '哭', '叫', '唱', '跳', '修', '洗', '切', '選', '查',
    '寄', '借', '還', '寫', '讀', '看', '聽', '說', '買', '賣', '想', '學',
    '問', '答', '愛', '恨', '玩', '練', '考', '算', '飛', '遊', '推', '拉',
    '尋找', '探索', '保護', '改善', '管理', '創造', '提供', '允許', '決定',
    '解釋', '支持', '生產', '享受', '記得', '進行',
  ];

  if (actionKeywords.some(kw => cleanMeaning.includes(kw))) {
    return {
      pos: 'v.',
      label: 'v. 動詞',
      reason: '中文釋義含有動作語義特徵',
    };
  }

  // 9. Default fallback: Most common part of speech in English is Noun
  return {
    pos: 'n.',
    label: 'n. 名詞',
    reason: '標準名詞詞類判定',
  };
}

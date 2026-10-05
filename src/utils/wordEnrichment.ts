import { Word } from '../types';
import { INITIAL_WORDS } from '../data/initialWords';
import { getNounForms, getVerbForms } from './englishGrammar';
import { toTraditional } from './traditional';

export interface EnrichedContent {
  phonetic?: string;
  exampleEn: string;
  exampleZh: string;
  confusionNotes: string;
  source: 'builtin' | 'ai' | 'dictionary';
}

const GEMINI_KEY_STORAGE = 'wordpet_gemini_key';

export const getGeminiKey = (): string => {
  try {
    const stored = localStorage.getItem(GEMINI_KEY_STORAGE);
    if (stored) return stored;
  } catch {
    // localStorage unavailable
  }
  return (import.meta as any).env?.VITE_GEMINI_API_KEY || '';
};

export const setGeminiKey = (key: string) => {
  try {
    if (key.trim()) localStorage.setItem(GEMINI_KEY_STORAGE, key.trim());
    else localStorage.removeItem(GEMINI_KEY_STORAGE);
  } catch {
    // localStorage unavailable
  }
};

const TEMPLATE_EXAMPLE_PATTERNS = [
  /^We should .+ this (carefully|properly)\.$/,
  /^This is an? .+, and these are .+\.$/,
  /^Remember the usage of ".+"\.$/,
  /^Practice using ".+"\.$/,
  /^I looked up the word ".+" to learn how it is used\.$/,
];

const TEMPLATE_NOTE_PATTERNS = [/^【動詞三態】/, /^【名詞複數變化】/, /持續複習以加深長期記憶/, /匯入單字$/];

export const isTemplateContent = (w: Pick<Word, 'exampleEn' | 'confusionNotes'>): boolean => {
  const ex = (w.exampleEn || '').trim();
  const notes = (w.confusionNotes || '').trim();
  return (
    !ex ||
    TEMPLATE_EXAMPLE_PATTERNS.some(re => re.test(ex)) ||
    !notes ||
    TEMPLATE_NOTE_PATTERNS.some(re => re.test(notes))
  );
};

const isPlaceholderPhonetic = (w: Word) =>
  !w.phonetic || w.phonetic.trim() === `/${w.word.trim().toLowerCase()}/`;

/** True if the sentence uses the word itself or a regular inflection of it (study → studied, make → making). */
export const sentenceUsesWord = (sentence: string, word: string): boolean => {
  const key = word.trim().toLowerCase();
  if (!key || !sentence) return false;
  const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const forms = new Set([key]);
  if (!key.includes(' ')) {
    if (key.length > 3 && /[ey]$/.test(key)) forms.add(key.slice(0, -1));
    if (/[^aeiou][aeiou][bdgmnprt]$/.test(key)) forms.add(key + key.slice(-1));
  }
  const re = new RegExp(`\\b(${[...forms].map(escape).join('|')})[a-z]*\\b`, 'i');
  return re.test(sentence);
};

/**
 * If `word` is not a known word in the library, return the closest known spelling (likely typo fix).
 * Phrases and words already present in the library are treated as correct.
 */
const isSubsequence = (short: string, long: string) => {
  let i = 0;
  for (const ch of long) if (ch === short[i]) i++;
  return i === short.length;
};

export const findSpellingSuggestion = (word: string, library: Word[]): string | null => {
  const raw = word.trim();
  if (/^[A-Z][a-z]+$/.test(raw)) return null;
  const key = raw.toLowerCase();
  if (key.length < 3 || /[^a-z'-]/.test(key)) return null;
  const known = [...INITIAL_WORDS, ...library];
  if (known.some(w => w.word.trim().toLowerCase() === key)) return null;
  const maxDist = key.length <= 4 ? 1 : 2;
  // Lower score wins: edit distance first, then prefer "dropped a letter" typos (aple → apple),
  // then same first letter.
  let best: string | null = null;
  let bestScore = Infinity;
  for (const w of known) {
    const other = w.word.trim().toLowerCase();
    if (other.includes(' ') || Math.abs(other.length - key.length) > maxDist) continue;
    const sameLetters = other.length === key.length && [...other].sort().join('') === [...key].sort().join('');
    const d = sameLetters ? 1 : levenshtein(key, other);
    if (d > maxDist) continue;
    const score = d * 10 + (isSubsequence(key, other) ? 0 : 3) + (other[0] === key[0] ? 0 : 2);
    if (score < bestScore) {
      best = other;
      bestScore = score;
    }
  }
  return best;
};

const fromLibrary = (word: Word, library: Word[]): EnrichedContent | null => {
  const key = word.word.trim().toLowerCase();
  const match = [...INITIAL_WORDS, ...library].find(
    w => w.id !== word.id && w.word.trim().toLowerCase() === key && !isTemplateContent(w)
  );
  if (!match) return null;
  return {
    phonetic: match.phonetic,
    exampleEn: match.exampleEn,
    exampleZh: match.exampleZh,
    confusionNotes: match.confusionNotes,
    source: 'builtin',
  };
};

const fromGemini = async (
  word: Word,
  apiKey: string
): Promise<EnrichedContent | { misspelled: true; suggestion: string } | null> => {
  const prompt = `你是台灣的英文老師。請為英文單字「${word.word}」(${word.partOfSpeech}，中文：${word.meaning}) 產生學習卡內容。
如果「${word.word}」不是正確拼寫的英文單字或片語（例如打錯字），請只回傳 {"misspelled": true, "suggestion": "最可能的正確拼法"}。
否則只回傳 JSON（例句必須原樣使用「${word.word}」這個拼法或它的詞形變化，不可改用其他單字）：
{
  "phonetic": "KK 或 IPA 音標，例如 /pɝsəˈvɪr/",
  "exampleEn": "一句自然、道地、15~25 字的英文例句，必須使用此單字並符合上述詞性與中文意思",
  "exampleZh": "例句的繁體中文（台灣用語）翻譯",
  "confusionNotes": "觀念解析，繁體中文 60~110 字，依序包含：常見搭配詞或介系詞、拼寫或字義易混淆的單字（附中文）、字首字根記憶法。不要加標題前綴。"
}
所有中文一律使用繁體中文（台灣用語），不可出現任何簡體字。`;

  for (const model of ['gemini-flash-latest', 'gemini-2.5-flash']) {
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json', temperature: 0.6 },
        }),
      });
      if (!res.ok) continue;
      const data = await res.json();
      const text: string = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const parsed = JSON.parse(text.replace(/^```(json)?|```$/g, '').trim());
      if (parsed?.misspelled && typeof parsed.suggestion === 'string' && parsed.suggestion.trim()) {
        const suggestion = parsed.suggestion.trim();
        if (suggestion.toLowerCase() !== word.word.trim().toLowerCase()) return { misspelled: true, suggestion };
      }
      if (parsed?.exampleEn && parsed?.confusionNotes && sentenceUsesWord(String(parsed.exampleEn), word.word)) {
        return {
          phonetic: parsed.phonetic || undefined,
          exampleEn: String(parsed.exampleEn).trim(),
          exampleZh: String(parsed.exampleZh || '').trim(),
          confusionNotes: String(parsed.confusionNotes).trim(),
          source: 'ai',
        };
      }
    } catch {
      // try next model
    }
  }
  return null;
};

const POS_MAP: Record<string, string> = {
  v: 'verb',
  n: 'noun',
  adj: 'adjective',
  adv: 'adverb',
  prep: 'preposition',
};

const PREFIXES: [string, string][] = [
  ['inter', '在…之間'], ['trans', '跨越'], ['super', '超越'], ['under', '在下/不足'], ['micro', '微小'],
  ['multi', '多'], ['anti', '反對'], ['auto', '自己'], ['over', '過度'], ['semi', '半'], ['tele', '遠'],
  ['post', '在後'], ['fore', '在前'], ['with', '向後/反'], ['per', '穿透/徹底'], ['pre', '在前/預先'],
  ['pro', '向前'], ['sub', '在下'], ['dis', '否定/分離'], ['mis', '錯誤'], ['con', '共同'], ['com', '共同'],
  ['uni', '單一'], ['out', '超過/向外'], ['re', '再/回'], ['un', '不'], ['de', '向下/去除'], ['ex', '向外'],
  ['in', '不/向內'], ['im', '不/向內'], ['ab', '離開'], ['ad', '朝向'], ['en', '使'],
];

const SUFFIXES: [string, string][] = [
  ['ation', '名詞：…的行為'], ['tion', '名詞：…的行為'], ['sion', '名詞：…的行為'], ['ment', '名詞：結果/狀態'],
  ['ness', '名詞：性質'], ['ity', '名詞：性質'], ['ance', '名詞：狀態'], ['ence', '名詞：狀態'],
  ['able', '可…的'], ['ible', '可…的'], ['ful', '充滿…的'], ['less', '沒有…的'], ['ous', '具有…的'],
  ['ive', '有…傾向的'], ['ize', '使…化'], ['ise', '使…化'], ['ify', '使成為'], ['ist', '…的人'],
  ['er', '…的人/物'], ['or', '…的人/物'], ['al', '…的'], ['ic', '…的'], ['ly', '副詞'],
];

const COMMON_CONFUSABLES: Record<string, [string, string][]> = {
  affect: [['effect', '影響、效果 (n.)']],
  effect: [['affect', '影響 (v.)']],
  accept: [['except', '除了']],
  except: [['accept', '接受']],
  adapt: [['adopt', '採用、收養']],
  adopt: [['adapt', '適應、改編']],
  persevere: [['preserve', '保存、維護']],
  preserve: [['persevere', '堅持不懈']],
  principal: [['principle', '原則']],
  principle: [['principal', '校長、主要的']],
  complement: [['compliment', '讚美']],
  compliment: [['complement', '補充']],
  stationary: [['stationery', '文具']],
  stationery: [['stationary', '靜止的']],
  desert: [['dessert', '甜點']],
  dessert: [['desert', '沙漠、拋棄']],
  lose: [['loose', '鬆的']],
  loose: [['lose', '遺失']],
  quite: [['quiet', '安靜的']],
  quiet: [['quite', '相當']],
  advice: [['advise', '建議 (v.)']],
  advise: [['advice', '建議 (n.)']],
  economic: [['economical', '節省的']],
  economical: [['economic', '經濟的']],
  sensible: [['sensitive', '敏感的']],
  sensitive: [['sensible', '明智的']],
};

const levenshtein = (a: string, b: string) => {
  const dp = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = dp[0];
    dp[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = dp[j];
      dp[j] = a[i - 1] === b[j - 1] ? prev : 1 + Math.min(prev, dp[j], dp[j - 1]);
      prev = tmp;
    }
  }
  return dp[b.length];
};

const findConfusables = (word: string, library: Word[]): string[] => {
  const key = word.toLowerCase();
  const found = new Map<string, string>();
  (COMMON_CONFUSABLES[key] || []).forEach(([w, m]) => found.set(w, m));
  if (key.length >= 5) {
    for (const w of [...INITIAL_WORDS, ...library]) {
      const other = w.word.trim().toLowerCase();
      if (other === key || found.has(other) || other.includes(' ')) continue;
      const sameLetters = other.length === key.length && [...other].sort().join('') === [...key].sort().join('');
      if (sameLetters || levenshtein(key, other) <= 2) found.set(other, w.meaning);
      if (found.size >= 2) break;
    }
  }
  return [...found.entries()].slice(0, 2).map(([w, m]) => `${w} (${m})`);
};

const buildMnemonic = (word: string): string => {
  const key = word.toLowerCase();
  if (key.includes(' ')) return '';
  const parts: string[] = [];
  let rest = key;
  const prefix = PREFIXES.find(([p]) => rest.startsWith(p) && rest.length - p.length >= 3);
  if (prefix) {
    parts.push(`${prefix[0]}(${prefix[1]})`);
    rest = rest.slice(prefix[0].length);
  }
  const suffix = SUFFIXES.find(([s]) => rest.endsWith(s) && rest.length - s.length >= 3);
  let suffixPart = '';
  if (suffix) {
    suffixPart = `-${suffix[0]}(${suffix[1]})`;
    rest = rest.slice(0, -suffix[0].length);
  }
  if (!prefix && !suffix) return '';
  parts.push(rest);
  if (suffixPart) parts.push(suffixPart);
  return `記憶法：${parts.join(' + ')}。`;
};

const translateToZh = async (text: string): Promise<string> => {
  try {
    const res = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|zh-TW`
    );
    if (!res.ok) return '';
    const data = await res.json();
    const out: string = data?.responseData?.translatedText || '';
    return /[\u4e00-\u9fff]/.test(out) ? out : '';
  } catch {
    return '';
  }
};

const wordCount = (s: string) => s.trim().split(/\s+/).length;

const fromWiktionary = async (word: string): Promise<string | undefined> => {
  try {
    const res = await fetch(`https://en.wiktionary.org/api/rest_v1/page/definition/${encodeURIComponent(word)}`);
    if (!res.ok) return undefined;
    const data = await res.json();
    const examples: string[] = (data?.en || [])
      .flatMap((m: any) => m?.definitions || [])
      .flatMap((d: any) => [...(d?.parsedExamples || []).map((e: any) => e?.example), ...(d?.examples || [])])
      .filter(Boolean)
      .map((e: string) => e.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim());
    return examples.find(
      e => wordCount(e) >= 6 && wordCount(e) <= 28 && /[.!?]$/.test(e) && sentenceUsesWord(e, word)
    );
  } catch {
    return undefined;
  }
};

const fromTatoeba = async (word: string): Promise<{ en: string; zh?: string } | undefined> => {
  try {
    const res = await fetch(
      `https://api.tatoeba.org/unstable/sentences?lang=eng&q=${encodeURIComponent(word)}&sort=relevance&showtrans:lang=cmn&limit=50`
    );
    if (!res.ok) return undefined;
    const data = await res.json();
    const candidates = (data?.data || [])
      .map((s: any) => ({
        en: String(s?.text || ''),
        zh: (s?.translations || []).flat().find((t: any) => t?.lang === 'cmn')?.text as string | undefined,
      }))
      .filter((s: { en: string }) => wordCount(s.en) >= 6 && wordCount(s.en) <= 22);
    const pick = (fn: (s: { en: string; zh?: string }) => boolean) => candidates.find(fn);
    return pick(s => sentenceUsesWord(s.en, word) && !!s.zh) || pick(s => sentenceUsesWord(s.en, word));
  } catch {
    return undefined;
  }
};

const fromDictionary = async (word: Word, library: Word[]): Promise<EnrichedContent | null> => {
  let entries: any[] = [];
  try {
    const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word.word.trim())}`);
    if (res.ok) entries = await res.json();
  } catch {
    // offline or blocked
  }

  const wantedPos = POS_MAP[word.partOfSpeech.replace('.', '')] || '';
  const meanings: any[] = entries.flatMap(e => e?.meanings || []);
  const ordered = [...meanings.filter(m => m.partOfSpeech === wantedPos), ...meanings.filter(m => m.partOfSpeech !== wantedPos)];

  const examples: string[] = ordered
    .flatMap(m => (m.definitions || []).map((d: any) => d.example as string))
    .filter((ex): ex is string => !!ex && ex.length >= 20 && ex.length <= 180);
  let example = examples.find(ex => sentenceUsesWord(ex, word.word) && wordCount(ex) >= 5);
  let fallbackZh: string | undefined;
  if (!example) example = await fromWiktionary(word.word.trim());
  if (!example) {
    const tatoeba = await fromTatoeba(word.word.trim());
    example = tatoeba?.en;
    fallbackZh = tatoeba?.zh;
  }

  const synonyms = Array.from(
    new Set<string>(ordered.flatMap(m => [...(m.synonyms || []), ...(m.definitions || []).flatMap((d: any) => d.synonyms || [])]))
  ).slice(0, 3);
  const antonyms = Array.from(
    new Set<string>(ordered.flatMap(m => [...(m.antonyms || []), ...(m.definitions || []).flatMap((d: any) => d.antonyms || [])]))
  ).slice(0, 2);
  const phonetic: string | undefined =
    entries.find(e => e?.phonetic)?.phonetic || entries.flatMap(e => e?.phonetics || []).find((p: any) => p?.text)?.text;

  const notes: string[] = [];
  if (word.partOfSpeech.startsWith('v')) {
    const f = getVerbForms(word.word);
    notes.push(`動詞三態：${f.base} → ${f.past} → ${f.pastParticiple}（${f.ing}）。`);
  } else if (word.partOfSpeech.startsWith('n')) {
    const f = getNounForms(word.word);
    notes.push(`複數：${f.plural}。`);
  }
  if (synonyms.length) notes.push(`同義字：${synonyms.join('、')}。`);
  if (antonyms.length) notes.push(`反義字：${antonyms.join('、')}。`);
  const confusables = findConfusables(word.word.trim(), library);
  if (confusables.length) notes.push(`注意與 ${confusables.join('、')} 拼寫易混淆。`);
  const mnemonic = buildMnemonic(word.word.trim());
  if (mnemonic) notes.push(mnemonic);

  if (!example && !synonyms.length && !phonetic && !confusables.length && !mnemonic) return null;

  let exampleEn = example || '';
  let exampleZh = '';
  if (exampleEn) {
    exampleZh =
      (await translateToZh(exampleEn)) || fallbackZh || `（「${word.word}」在此句中的意思：${word.meaning}）`;
  } else {
    exampleEn = `I looked up the word "${word.word}" to learn how it is used.`;
    exampleZh = `我查了「${word.word}」（${word.meaning}）這個字，學習它的用法。`;
  }

  return {
    phonetic,
    exampleEn,
    exampleZh,
    confusionNotes: notes.join(' '),
    source: 'dictionary',
  };
};

/**
 * Fill in example sentence, translation and concept notes for a word:
 * built-in library first, then Gemini (if a key is configured), then free dictionary APIs.
 */
export interface EnrichResult {
  patch: Partial<Word> | null;
  /** Likely correct spelling when the word looks like a typo; no content is generated in that case. */
  suggestion?: string;
}

const dictionaryKnows = async (word: string): Promise<boolean | null> => {
  try {
    const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);
    if (res.status === 404) return false;
    return res.ok ? true : null;
  } catch {
    return null;
  }
};

export const enrichWord = async (
  word: Word,
  library: Word[],
  options: { skipSpellCheck?: boolean } = {}
): Promise<EnrichResult> => {
  let result: EnrichedContent | null = fromLibrary(word, library);

  if (!result) {
    const local = options.skipSpellCheck ? null : findSpellingSuggestion(word.word, library);
    if (getGeminiKey()) {
      const ai = await fromGemini(word, getGeminiKey());
      if (ai && 'misspelled' in ai) {
        if (!options.skipSpellCheck) return { patch: null, suggestion: ai.suggestion };
      } else {
        result = ai;
      }
    }
    if (!result && local && (await dictionaryKnows(word.word.trim())) !== true) {
      return { patch: null, suggestion: local };
    }
    if (!result) result = await fromDictionary(word, library);
  }

  if (!result) return { patch: null };
  const [exampleZh, confusionNotes] = await Promise.all([
    toTraditional(result.exampleZh),
    toTraditional(result.confusionNotes),
  ]);
  const patch: Partial<Word> = {
    exampleEn: result.exampleEn,
    exampleZh,
    confusionNotes,
  };
  if (result.phonetic && isPlaceholderPhonetic(word)) patch.phonetic = result.phonetic;
  return { patch };
};

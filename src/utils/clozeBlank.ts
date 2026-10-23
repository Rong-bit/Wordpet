import { getNounForms, getVerbForms } from './englishGrammar';

export interface ClozeBlankResult {
  /** Sentence with the first match replaced by one `_` per letter (spaces kept). */
  clozeSentence: string;
  /** Exact surface form that was blanked (preserves casing from the sentence). */
  blankedForm: string;
  /** Underscore mask shown in the sentence, e.g. "persevere" → "_________". */
  blankMask: string;
}

/** Map each letter/digit to `_`; keep spaces and punctuation so phrase shape stays visible. */
export const toLetterBlanks = (surface: string): string =>
  [...surface].map(ch => (/[A-Za-z0-9]/.test(ch) ? '_' : ch)).join('');

/**
 * Overlay typed letters onto a blank mask.
 * Only A–Z / 0–9 from `typed` fill `_` slots; remaining `_` stay; spaces/punct in the mask are kept.
 * e.g. mask `____ __` + typed `l` → `l___ __`; + `look up` → `look up`
 */
export const applyAnswerToBlankMask = (mask: string, typed: string): string => {
  if (!mask) return '';
  const letters = [...typed].filter(ch => /[A-Za-z0-9]/.test(ch));
  let i = 0;
  return [...mask]
    .map(ch => {
      if (ch !== '_') return ch;
      if (i < letters.length) return letters[i++];
      return '_';
    })
    .join('');
};

export type BlankSlotStatus = 'empty' | 'correct' | 'wrong' | 'fixed';

export interface BlankSlot {
  char: string;
  status: BlankSlotStatus;
}

/** Count how many letter slots (`_`) a mask has. */
export const countBlankSlots = (mask: string): number =>
  [...mask].filter(ch => ch === '_').length;

/**
 * Build per-character slots for colored fill-in UI.
 * Typed letters overlay `_`; leftover `_` stay; each filled letter is correct (green) or wrong (red)
 * vs the expected surface form (aligned to `_` slots only).
 */
export const buildBlankSlots = (
  mask: string,
  typed: string,
  expectedSurface: string
): BlankSlot[] => {
  if (!mask) return [];
  const expectedLetters = [...expectedSurface].filter(ch => /[A-Za-z0-9]/.test(ch));
  const typedLetters = [...typed].filter(ch => /[A-Za-z0-9]/.test(ch));
  let ei = 0;
  let ti = 0;

  return [...mask].map(ch => {
    if (ch !== '_') return { char: ch, status: 'fixed' as const };
    const expected = expectedLetters[ei++] ?? '';
    if (ti >= typedLetters.length) return { char: '_', status: 'empty' as const };
    const typedCh = typedLetters[ti++];
    const ok = !!expected && typedCh.toLowerCase() === expected.toLowerCase();
    return { char: typedCh, status: (ok ? 'correct' : 'wrong') as BlankSlotStatus };
  });
};

/** Keep typing natural but cap alphanumeric chars to the number of `_` slots. */
export const limitTypedToBlankSlots = (typed: string, maxSlots: number): string => {
  if (maxSlots <= 0) return '';
  let used = 0;
  let out = '';
  for (const ch of typed) {
    if (/[A-Za-z0-9]/.test(ch)) {
      if (used >= maxSlots) continue;
      used += 1;
      out += ch;
    } else if (ch === ' ' || ch === '-' || ch === "'") {
      out += ch;
    }
  }
  return out;
};

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Collect plausible surface forms for a headword (lemma + common inflections). */
export const collectWordForms = (word: string): string[] => {
  const key = word.trim().toLowerCase();
  if (!key) return [];

  const forms = new Set<string>([key]);

  if (key.includes(' ')) {
    return [...forms];
  }

  // Loose stem variants (same idea as sentenceUsesWord)
  if (key.length > 3 && /[ey]$/.test(key)) forms.add(key.slice(0, -1));
  if (/[^aeiou][aeiou][bdgmnprt]$/.test(key)) forms.add(key + key.slice(-1));

  const verb = getVerbForms(key);
  for (const raw of [verb.base, verb.past, verb.pastParticiple, verb.ing]) {
    for (const part of raw.split('/')) {
      const f = part.trim().toLowerCase();
      if (f) forms.add(f);
    }
  }

  const noun = getNounForms(key);
  if (noun.singular) forms.add(noun.singular);
  if (noun.plural) forms.add(noun.plural);

  // Common regular suffixes on the lemma itself
  forms.add(`${key}s`);
  forms.add(`${key}es`);
  forms.add(`${key}ed`);
  forms.add(`${key}ing`);
  if (key.endsWith('y') && key.length > 2) {
    forms.add(`${key.slice(0, -1)}ies`);
    forms.add(`${key.slice(0, -1)}ied`);
  }
  if (key.endsWith('e')) {
    forms.add(`${key}d`);
    forms.add(`${key.slice(0, -1)}ing`);
  }

  return [...forms].filter(Boolean).sort((a, b) => b.length - a.length);
};

/**
 * Blank the first occurrence of `word` (or a common inflection) in an English sentence.
 * Returns null when the sentence is empty or no match is found.
 */
export const blankWordInSentence = (sentence: string, word: string): ClozeBlankResult | null => {
  const example = (sentence || '').trim();
  const lemma = (word || '').trim();
  if (!example || !lemma) return null;

  const forms = collectWordForms(lemma);
  if (forms.length === 0) return null;

  const pattern = forms.map(escapeRegExp).join('|');
  // Phrases: allow flexible internal whitespace; single tokens use word boundaries.
  const re = lemma.includes(' ')
    ? new RegExp(`(${pattern.replace(/\s+/g, '\\s+')})`, 'i')
    : new RegExp(`\\b(${pattern})\\b`, 'i');

  const match = re.exec(example);
  if (!match || match.index === undefined) return null;

  const blankedForm = match[1];
  const blankMask = toLetterBlanks(blankedForm);
  const clozeSentence =
    example.slice(0, match.index) + blankMask + example.slice(match.index + blankedForm.length);

  return { clozeSentence, blankedForm, blankMask };
};

/** Accept lemma or the blanked surface form (case-insensitive). */
export const isClozeAnswerCorrect = (
  typed: string,
  lemma: string,
  blankedForm?: string | null
): boolean => {
  const answer = typed.trim().toLowerCase();
  if (!answer) return false;
  if (answer === lemma.trim().toLowerCase()) return true;
  if (blankedForm && answer === blankedForm.trim().toLowerCase()) return true;
  return false;
};

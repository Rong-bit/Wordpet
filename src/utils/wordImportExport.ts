import { Word, WordCategory } from '../types';
import { detectPartOfSpeech, getVerbForms, getNounForms } from './englishGrammar';

/**
 * Generate CSV content with UTF-8 BOM for Excel compatibility
 */
export function exportWordsToCSV(words: Word[]): string {
  const headers = ['Word', 'PartOfSpeech', 'Meaning', 'Category', 'ExampleEn', 'ExampleZh', 'GrammarNotes'];
  
  const escapeCSV = (str: string) => {
    if (!str) return '""';
    const escaped = str.replace(/"/g, '""');
    return `"${escaped}"`;
  };

  const rows = words.map(w => [
    escapeCSV(w.word),
    escapeCSV(w.partOfSpeech),
    escapeCSV(w.meaning),
    escapeCSV(w.category),
    escapeCSV(w.exampleEn),
    escapeCSV(w.exampleZh),
    escapeCSV(w.confusionNotes),
  ].join(','));

  // Prepend UTF-8 BOM (\uFEFF) to make sure Excel opens Traditional Chinese correctly
  return '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
}

/**
 * Generate JSON backup content
 */
export function exportWordsToJSON(words: Word[]): string {
  return JSON.stringify(words, null, 2);
}

/**
 * Generate clean Text format
 */
export function exportWordsToTXT(words: Word[]): string {
  return words.map(w => `${w.word} [${w.partOfSpeech}] ${w.meaning}`).join('\r\n');
}

/**
 * Download a file in browser
 */
export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Parse raw text or CSV or JSON into structured Word objects with auto grammar inflections
 */
export function parseImportedContent(
  rawContent: string,
  defaultCategory: WordCategory = 'custom'
): Word[] {
  const trimmed = rawContent.trim();
  if (!trimmed) return [];

  // 1. Try parsing as JSON array
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].word && parsed[0].meaning) {
        return parsed.map((item, idx) => {
          const word = String(item.word || '').trim();
          const meaning = String(item.meaning || '').trim();
          const detected = detectPartOfSpeech(word, meaning);
          const pos = item.partOfSpeech || detected.pos;
          return {
            id: item.id || `w_import_${Date.now()}_${idx}`,
            word,
            phonetic: item.phonetic || `/${word.toLowerCase()}/`,
            partOfSpeech: pos,
            meaning,
            exampleEn: item.exampleEn || `Practice using "${word}".`,
            exampleZh: item.exampleZh || `多多練習使用這個單字。`,
            confusionNotes: item.confusionNotes || `【${pos}】匯入單字`,
            category: (item.category as WordCategory) || defaultCategory,
            level: item.level || 2,
            repetition: item.repetition || 0,
            easeFactor: item.easeFactor || 2.5,
            intervalDays: item.intervalDays || 0,
            lastReviewedAt: item.lastReviewedAt || null,
            nextReviewAt: item.nextReviewAt || new Date().toISOString(),
            consecutiveCorrect: item.consecutiveCorrect || 0,
            totalAttempts: item.totalAttempts || 0,
            mistakeCount: item.mistakeCount || 0,
            isWeak: !!item.isWeak,
            status: item.status || 'new',
          };
        });
      }
    } catch {
      // Not JSON, continue to line-by-line parsing
    }
  }

  // 2. Line-by-line parsing (supports CSV, TSV, hyphen, colon, slash delimiters)
  const lines = trimmed.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const result: Word[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Skip potential CSV header
    if (i === 0 && (line.toLowerCase().startsWith('word') || line.toLowerCase().startsWith('"word"'))) {
      continue;
    }

    let word = '';
    let pos = '';
    let meaning = '';
    let category = defaultCategory;

    // Detect delimiter
    // Priority: comma CSV with quotes, tab, comma, semicolon, hyphen, pipe
    if (line.includes('\t')) {
      const parts = line.split('\t').map(p => p.trim());
      word = parts[0] || '';
      if (parts.length >= 3) {
        pos = parts[1];
        meaning = parts.slice(2).join(' ');
      } else {
        meaning = parts[1] || '';
      }
    } else if (line.includes(',')) {
      // Split by comma ignoring commas inside quotes
      const matches = line.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g);
      const parts = matches
        ? matches.map(p => p.trim().replace(/^"|"$/g, '').trim())
        : line.split(',').map(p => p.trim());

      word = parts[0] || '';
      if (parts.length >= 3) {
        // e.g. apple, n., 蘋果
        if (parts[1].endsWith('.') || ['n', 'v', 'adj', 'adv', 'phr', 'prep'].includes(parts[1])) {
          pos = parts[1];
          meaning = parts[2];
        } else {
          meaning = parts[1];
          category = (parts[2] as WordCategory) || defaultCategory;
        }
      } else {
        meaning = parts[1] || '';
      }
    } else if (line.includes(' - ') || line.includes(' — ') || line.includes(': ') || line.includes('：')) {
      const separator = line.includes(' - ') ? ' - ' : line.includes(' — ') ? ' — ' : line.includes(': ') ? ': ' : '：';
      const [w, ...rest] = line.split(separator);
      word = w.trim();
      meaning = rest.join(' ').trim();
    } else {
      // Space separated
      const parts = line.split(/\s+/);
      if (parts.length >= 2) {
        word = parts[0];
        meaning = parts.slice(1).join(' ');
      }
    }

    if (!word) continue;

    // Extract POS if meaning has [v.] or (v.) prefix
    const posMatch = meaning.match(/^\[?(v\.|n\.|adj\.|adv\.|phr\.|prep\.)\]?\s*/i) ||
                     meaning.match(/^\(?(v\.|n\.|adj\.|adv\.|phr\.|prep\.)\)?\s*/i);
    if (posMatch) {
      pos = posMatch[1].toLowerCase();
      meaning = meaning.slice(posMatch[0].length).trim();
    }

    // Standardize POS
    if (pos && !pos.endsWith('.')) {
      pos = `${pos}.`;
    }

    // Auto-detect POS if missing
    if (!pos) {
      const detected = detectPartOfSpeech(word, meaning);
      pos = detected.pos;
    }

    // Generate grammatical inflections
    let confusionNotes = '';
    let exampleEn = '';
    let exampleZh = '';

    if (pos.startsWith('v')) {
      const forms = getVerbForms(word);
      confusionNotes = `【動詞三態】原形：${forms.base} | 過去式：${forms.past} | 過去分詞：${forms.pastParticiple} | 現在分詞：${forms.ing}`;
      exampleEn = `We should ${forms.base} this properly.`;
      exampleZh = `我們應該好好「${meaning}」。`;
    } else if (pos.startsWith('n')) {
      const forms = getNounForms(word);
      confusionNotes = `【名詞複數變化】單數：${forms.singular} | 複數：${forms.plural}`;
      exampleEn = `This is a ${forms.singular}, and these are ${forms.plural}.`;
      exampleZh = `這是一個「${meaning}」，那些是複數形態。`;
    } else {
      confusionNotes = `【${pos}】匯入自我擴充單字，持續複習以加深長期記憶。`;
      exampleEn = `Remember the usage of "${word}".`;
      exampleZh = `請記住「${meaning}」的語境用法。`;
    }

    result.push({
      id: `w_import_${Date.now()}_${i}`,
      word,
      phonetic: `/${word.toLowerCase()}/`,
      partOfSpeech: pos,
      meaning: meaning || '學習單字',
      exampleEn,
      exampleZh,
      confusionNotes,
      category,
      level: 2,
      repetition: 0,
      easeFactor: 2.5,
      intervalDays: 0,
      lastReviewedAt: null,
      nextReviewAt: new Date().toISOString(),
      consecutiveCorrect: 0,
      totalAttempts: 0,
      mistakeCount: 0,
      isWeak: false,
      status: 'new',
    });
  }

  return result;
}

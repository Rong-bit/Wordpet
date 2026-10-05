// Lazy, lightweight Simplified → Taiwan Traditional conversion for text fetched at runtime
// (MyMemory / Tatoeba / Gemini). Uses character-level + Taiwan phrase dictionaries (~50 KB)
// instead of the full 1 MB OpenCC phrase table.
type Convert = (text: string) => string;

// Frequent words whose characters map one-to-many and need phrase context (the full phrase table is ~1 MB).
const COMMON_PHRASES: [string, string][] = [
  ['尽管', '儘管'], ['尽量', '儘量'], ['尽快', '儘快'], ['不尽', '不盡'], ['头发', '頭髮'], ['理发', '理髮'],
  ['以后', '以後'], ['后来', '後來'], ['然后', '然後'], ['之后', '之後'], ['最后', '最後'], ['皇后', '皇后'],
  ['干净', '乾淨'], ['干燥', '乾燥'], ['饼干', '餅乾'], ['干涉', '干涉'], ['干部', '幹部'], ['能干', '能幹'],
  ['面条', '麵條'], ['面包', '麵包'], ['一只', '一隻'], ['只有', '只有'], ['里面', '裡面'], ['这里', '這裡'],
  ['那里', '那裡'], ['哪里', '哪裡'], ['公里', '公里'], ['系统', '系統'], ['联系', '聯繫'], ['关系', '關係'],
  ['准备', '準備'], ['标准', '標準'], ['制造', '製造'], ['复杂', '複雜'], ['重复', '重複'], ['恢复', '恢復'],
  ['回复', '回覆'], ['答复', '答覆'], ['周末', '週末'], ['每周', '每週'], ['松开', '鬆開'], ['放松', '放鬆'],
  ['台湾', '台灣'], ['舞台', '舞台'], ['钟表', '鐘錶'], ['手表', '手錶'], ['采取', '採取'], ['发现', '發現'],
];

let converterPromise: Promise<Convert> | null = null;

const loadConverter = (): Promise<Convert> => {
  if (!converterPromise) {
    converterPromise = Promise.all([
      import('opencc-js/core'),
      import('opencc-js/dict/STCharacters'),
      import('opencc-js/dict/TWPhrases'),
      import('opencc-js/dict/TWVariantsPhrases'),
      import('opencc-js/dict/TWVariants'),
    ])
      .then(([core, st, twPhrases, twVariantsPhrases, twVariants]) =>
        core.ConverterFactory(
          [COMMON_PHRASES, st.default],
          [twPhrases.default],
          [twVariantsPhrases.default, twVariants.default]
        ) as Convert
      )
      .catch(err => {
        converterPromise = null;
        throw err;
      });
  }
  return converterPromise;
};

const hasCjk = (text: string) => /[\u3400-\u9fff]/.test(text);

export const toTraditional = async (text: string): Promise<string> => {
  if (!text || !hasCjk(text)) return text;
  try {
    const convert = await loadConverter();
    return convert(text);
  } catch {
    return text;
  }
};

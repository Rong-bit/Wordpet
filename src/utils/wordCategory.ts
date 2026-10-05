import { Word, WordCategory } from '../types';

export const getWordCategories = (w: Word): WordCategory[] =>
  w.extraCategories?.length ? Array.from(new Set([w.category, ...w.extraCategories])) : [w.category];

export const isInCategory = (w: Word, category: string): boolean =>
  w.category === category || !!w.extraCategories?.includes(category as WordCategory);

export const addCategoryPatch = (w: Word, category: WordCategory): Partial<Word> => ({
  extraCategories: Array.from(new Set([...(w.extraCategories ?? []), category])),
});

export const removeCategoryPatch = (w: Word, category: WordCategory): Partial<Word> => ({
  extraCategories: (w.extraCategories ?? []).filter(c => c !== category),
});

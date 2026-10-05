import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Word, WordCategory } from '../types';
import { speakEnglish } from '../utils/tts';
import { getVerbForms, getNounForms, detectPartOfSpeech } from '../utils/englishGrammar';
import {
  exportWordsToCSV,
  exportWordsToJSON,
  exportWordsToTXT,
  downloadFile,
  parseImportedContent,
} from '../utils/wordImportExport';
import {
  enrichWord,
  findSpellingSuggestion,
  getGeminiKey,
  isTemplateContent,
  setGeminiKey,
} from '../utils/wordEnrichment';
import { isBankWordId } from '../utils/wordBank';
import {
  Search,
  Plus,
  Volume2,
  Bookmark,
  CheckCircle,
  AlertTriangle,
  Clock,
  Sparkles,
  BookOpen,
  Filter,
  Flame,
  Pencil,
  Trash2,
  Download,
  Upload,
  FileText,
  Check,
  MoreHorizontal,
} from 'lucide-react';

const PAGE_SIZE = 60;
const MAX_BATCH_ENRICH = 30;

interface WordLibraryProps {
  words: Word[];
  progressIds?: Set<string>;
  onAddWord: (word: Word) => void;
  onImportWords?: (words: Word[]) => void;
  onUpdateWord?: (word: Word) => void;
  onPatchWord?: (wordId: string, patch: Partial<Word>) => void;
  onDeleteWord?: (wordId: string) => void;
  onToggleWeak: (wordId: string) => void;
  onStartSpecificQuiz: (selectedWords: Word[]) => void;
  voiceGender: 'en-US' | 'en-GB';
  voiceSpeed: number;
}

export const WordLibrary: React.FC<WordLibraryProps> = ({
  words,
  progressIds,
  onAddWord,
  onImportWords,
  onUpdateWord,
  onPatchWord,
  onDeleteWord,
  onToggleWeak,
  onStartSpecificQuiz,
  voiceGender,
  voiceSpeed,
}) => {
  const [enrichingIds, setEnrichingIds] = useState<Set<string>>(new Set());
  const [failedEnrichIds, setFailedEnrichIds] = useState<Set<string>>(new Set());
  const [spellingSuggestions, setSpellingSuggestions] = useState<Record<string, string>>({});
  const [isBatchEnriching, setIsBatchEnriching] = useState(false);
  const [hasGeminiKey, setHasGeminiKey] = useState(() => !!getGeminiKey());
  const wordsRef = useRef(words);
  wordsRef.current = words;

  const runEnrich = async (target: Word, options: { skipSpellCheck?: boolean } = {}) => {
    setEnrichingIds(prev => new Set(prev).add(target.id));
    setFailedEnrichIds(prev => {
      const next = new Set(prev);
      next.delete(target.id);
      return next;
    });
    setSpellingSuggestions(prev => {
      if (!(target.id in prev)) return prev;
      const { [target.id]: _, ...rest } = prev;
      return rest;
    });
    const { patch, suggestion } = await enrichWord(target, wordsRef.current, options);
    if (patch) {
      onPatchWord?.(target.id, patch);
    } else {
      setFailedEnrichIds(prev => new Set(prev).add(target.id));
      if (suggestion) setSpellingSuggestions(prev => ({ ...prev, [target.id]: suggestion }));
    }
    setEnrichingIds(prev => {
      const next = new Set(prev);
      next.delete(target.id);
      return next;
    });
  };

  const handleFixSpelling = (target: Word, corrected: string) => {
    const fixed: Word = {
      ...target,
      word: corrected,
      phonetic: `/${corrected.toLowerCase()}/`,
      exampleEn: '',
      exampleZh: '',
      confusionNotes: '',
    };
    onUpdateWord?.(fixed);
    runEnrich(fixed);
  };

  const runBatchEnrich = async (targets: Word[]) => {
    if (isBatchEnriching || targets.length === 0) return;
    setIsBatchEnriching(true);
    for (const t of targets) {
      await runEnrich(t);
      await new Promise(r => setTimeout(r, 350));
    }
    setIsBatchEnriching(false);
  };

  const handleConfigureGeminiKey = () => {
    const current = getGeminiKey();
    const input = window.prompt(
      '請貼上 Gemini API 金鑰（可至 Google AI Studio 免費申請）。\n設定後會用 AI 產生更道地的例句與觀念解析；留空並按確定可清除金鑰。\n金鑰只會儲存在這台裝置的瀏覽器中。',
      current
    );
    if (input === null) return;
    setGeminiKey(input);
    setHasGeminiKey(!!getGeminiKey());
  };
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [filterMode, setFilterMode] = useState<'all' | 'due' | 'weak' | 'mastered'>('all');
  const [levelFilter, setLevelFilter] = useState<number>(0);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [searchTerm, selectedCategory, filterMode, levelFilter]);

  useEffect(() => {
    setLevelFilter(0);
  }, [selectedCategory]);

  const isUnstarted = (w: Word) => !!progressIds && !progressIds.has(w.id);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [isManualPos, setIsManualPos] = useState(false);

  // New Word Form State - Simplified & Clean
  const [newWord, setNewWord] = useState({
    word: '',
    partOfSpeech: 'v.',
    meaning: '',
    category: 'custom' as WordCategory,
  });

  // Real-time Part of Speech Detection
  const detectedPOS = (newWord.word.trim() || newWord.meaning.trim())
    ? detectPartOfSpeech(newWord.word, newWord.meaning)
    : null;

  // Auto-switch POS unless user manually override
  useEffect(() => {
    if (!isManualPos && detectedPOS) {
      setNewWord(prev => (prev.partOfSpeech !== detectedPOS.pos ? { ...prev, partOfSpeech: detectedPOS.pos } : prev));
    }
  }, [newWord.word, newWord.meaning, isManualPos, detectedPOS]);

  const isVerb = newWord.partOfSpeech.startsWith('v');
  const isNoun = newWord.partOfSpeech.startsWith('n');

  const liveVerbForms = isVerb && newWord.word.trim() ? getVerbForms(newWord.word) : null;
  const liveNounForms = isNoun && newWord.word.trim() ? getNounForms(newWord.word) : null;

  // Real-time Duplicate Detection for Add Word
  const cleanInputWord = newWord.word.trim().toLowerCase();
  const cleanInputMeaning = newWord.meaning.trim();

  const existingWordMatches = cleanInputWord
    ? words.filter(w => w.word.toLowerCase() === cleanInputWord)
    : [];

  const addSpellingSuggestion = useMemo(
    () => (showAddModal && cleanInputWord ? findSpellingSuggestion(cleanInputWord, words) : null),
    [showAddModal, cleanInputWord, words]
  );

  const exactMeaningMatch = existingWordMatches.find(w => {
    if (!cleanInputMeaning) return false;
    const existingM = w.meaning.trim();
    if (existingM === cleanInputMeaning) return true;
    const cleanTokens = cleanInputMeaning.split(/[,、，；;\s]+/).filter(Boolean);
    const existingTokens = existingM.split(/[,、，；;\s]+/).filter(Boolean);
    return (
      cleanTokens.some(t => existingTokens.includes(t)) ||
      existingM.includes(cleanInputMeaning) ||
      cleanInputMeaning.includes(existingM)
    );
  });

  // Editing Word State
  const [editingWord, setEditingWord] = useState<Word | null>(null);
  const [editForm, setEditForm] = useState({
    word: '',
    partOfSpeech: 'v.',
    meaning: '',
    category: 'custom' as WordCategory,
  });
  const [isEditManualPos, setIsEditManualPos] = useState(true);

  // Duplicate Detection for Edit Word
  const cleanEditWord = editForm.word.trim().toLowerCase();
  const cleanEditMeaning = editForm.meaning.trim();
  const duplicateEditMatch = editingWord && cleanEditWord
    ? words.find(
        w =>
          w.id !== editingWord.id &&
          w.word.toLowerCase() === cleanEditWord &&
          (w.meaning.trim() === cleanEditMeaning ||
            w.meaning.includes(cleanEditMeaning) ||
            cleanEditMeaning.includes(w.meaning))
      )
    : null;

  const startEditingWord = (w: Word) => {
    setEditingWord(w);
    setEditForm({
      word: w.word,
      partOfSpeech: w.partOfSpeech,
      meaning: w.meaning,
      category: w.category,
    });
    setIsEditManualPos(true);
  };

  const detectedEditPOS = (editForm.word.trim() || editForm.meaning.trim())
    ? detectPartOfSpeech(editForm.word, editForm.meaning)
    : null;

  useEffect(() => {
    if (!isEditManualPos && detectedEditPOS) {
      setEditForm(prev => (prev.partOfSpeech !== detectedEditPOS.pos ? { ...prev, partOfSpeech: detectedEditPOS.pos } : prev));
    }
  }, [editForm.word, editForm.meaning, isEditManualPos, detectedEditPOS]);

  const isEditVerb = editForm.partOfSpeech.startsWith('v');
  const isEditNoun = editForm.partOfSpeech.startsWith('n');

  const liveEditVerbForms = isEditVerb && editForm.word.trim() ? getVerbForms(editForm.word) : null;
  const liveEditNounForms = isEditNoun && editForm.word.trim() ? getNounForms(editForm.word) : null;

  const handleSaveEditWord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingWord || !editForm.word.trim() || !editForm.meaning.trim()) return;

    const trimmedWord = editForm.word.trim();
    const trimmedMeaning = editForm.meaning.trim();

    let confusionNotes = editingWord.confusionNotes;
    let exampleEn = editingWord.exampleEn;
    let exampleZh = editingWord.exampleZh;
    let phonetic = editingWord.phonetic;

    const contentChanged =
      trimmedWord.toLowerCase() !== editingWord.word.trim().toLowerCase() ||
      editForm.partOfSpeech !== editingWord.partOfSpeech;

    if (!contentChanged) {
      // keep existing example sentence & notes
    } else if (isEditVerb) {
      const forms = getVerbForms(trimmedWord);
      confusionNotes = `【動詞三態】原形：${forms.base} | 過去式：${forms.past} | 過去分詞：${forms.pastParticiple} | 現在分詞：${forms.ing}`;
      exampleEn = `We should ${forms.base} this carefully.`;
      exampleZh = `我們應該好好「${trimmedMeaning}」。`;
    } else if (isEditNoun) {
      const forms = getNounForms(trimmedWord);
      confusionNotes = `【名詞複數變化】單數：${forms.singular} | 複數：${forms.plural}`;
      exampleEn = `This is a ${forms.singular}, and these are ${forms.plural}.`;
      exampleZh = `這是一個「${trimmedMeaning}」，那些是複數形態。`;
    } else {
      confusionNotes = `【${editForm.partOfSpeech}】重要詞彙，持續複習以加深長期記憶。`;
      exampleEn = `Remember the usage of "${trimmedWord}".`;
      exampleZh = `請記住「${trimmedMeaning}」的語境用法。`;
    }
    if (trimmedWord.toLowerCase() !== editingWord.word.trim().toLowerCase()) {
      phonetic = `/${trimmedWord.toLowerCase()}/`;
    }

    const updated: Word = {
      ...editingWord,
      word: trimmedWord,
      phonetic,
      partOfSpeech: editForm.partOfSpeech,
      meaning: trimmedMeaning,
      category: editForm.category,
      confusionNotes,
      exampleEn,
      exampleZh,
    };

    onUpdateWord?.(updated);
    setEditingWord(null);
    if (contentChanged || isTemplateContent(updated)) {
      runEnrich(updated);
    }
  };

  const handleDeleteConfirm = (word: Word) => {
    const ok = window.confirm(
      isBankWordId(word.id)
        ? `確定要清除「${word.word} (${word.meaning})」的學習紀錄嗎？單字仍會保留在內建詞庫中，變回未學習的新字。`
        : `確定要從單字庫中刪除「${word.word} (${word.meaning})」嗎？此動作無法復原。`
    );
    if (ok) {
      onDeleteWord?.(word.id);
    }
  };

  // Export Modal State
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportScope, setExportScope] = useState<'custom' | 'filtered' | 'all'>('custom');
  const [exportFormat, setExportFormat] = useState<'csv' | 'json' | 'txt'>('csv');

  // Import Modal State
  const [showImportModal, setShowImportModal] = useState(false);
  const [importText, setImportText] = useState('');
  const [importCategory, setImportCategory] = useState<WordCategory>('custom');
  const [parsedImportWords, setParsedImportWords] = useState<Word[]>([]);
  const [importSuccessMsg, setImportSuccessMsg] = useState<string | null>(null);

  // Handle Export Download
  const handleExecuteExport = () => {
    let targetWords = words;
    if (exportScope === 'custom') {
      targetWords = words.filter(w => w.category === 'custom');
    } else if (exportScope === 'filtered') {
      targetWords = filteredWords;
    }

    if (targetWords.length === 0) {
      alert('所選範圍目前沒有單字可供匯出！');
      return;
    }

    const timestamp = new Date().toISOString().slice(0, 10);
    if (exportFormat === 'csv') {
      const csv = exportWordsToCSV(targetWords);
      downloadFile(csv, `wordpet_words_${exportScope}_${timestamp}.csv`, 'text/csv;charset=utf-8;');
    } else if (exportFormat === 'json') {
      const json = exportWordsToJSON(targetWords);
      downloadFile(json, `wordpet_words_${exportScope}_${timestamp}.json`, 'application/json');
    } else {
      const txt = exportWordsToTXT(targetWords);
      downloadFile(txt, `wordpet_words_${exportScope}_${timestamp}.txt`, 'text/plain;charset=utf-8;');
    }

    setShowExportModal(false);
  };

  // Handle file upload import
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setImportText(content);
        const parsed = parseImportedContent(content, importCategory);
        setParsedImportWords(parsed);
      }
    };
    reader.readAsText(file);
  };

  // Handle text paste input change
  const handleTextChange = (text: string) => {
    setImportText(text);
    const parsed = parseImportedContent(text, importCategory);
    setParsedImportWords(parsed);
  };

  const handleCategoryChangeForImport = (cat: WordCategory) => {
    setImportCategory(cat);
    if (importText.trim()) {
      const parsed = parseImportedContent(importText, cat);
      setParsedImportWords(parsed);
    }
  };

  const handleConfirmImport = () => {
    if (parsedImportWords.length === 0) return;
    const existingMap = new Map(words.map(w => [w.word.toLowerCase(), w]));
    const duplicates = parsedImportWords.filter(w => existingMap.has(w.word.toLowerCase()));
    onImportWords?.(parsedImportWords);
    const addedCount = parsedImportWords.length - duplicates.length;
    runBatchEnrich(
      parsedImportWords.filter(w => !existingMap.has(w.word.toLowerCase()) && isTemplateContent(w))
    );
    setShowImportModal(false);
    setImportText('');
    setParsedImportWords([]);
    if (duplicates.length > 0) {
      setImportSuccessMsg(`🎉 成功匯入 ${addedCount} 個新單字！（已自動略過 ${duplicates.length} 個在庫重複單字）`);
    } else {
      setImportSuccessMsg(`🎉 成功匯入 ${addedCount} 個單字至「${categoryLabels[importCategory] || '自訂單字庫'}」！`);
    }
    setTimeout(() => setImportSuccessMsg(null), 5000);
  };

  const now = new Date().getTime();

  // Filter words
  const searchLower = searchTerm.trim().toLowerCase();
  const filteredWords = words.filter(w => {
    // Search filter
    const matchesSearch =
      !searchLower ||
      w.word.toLowerCase().includes(searchLower) ||
      w.meaning.includes(searchTerm.trim());

    // Category filter
    const matchesCategory =
      selectedCategory === 'all' || w.category === selectedCategory;

    const matchesLevel = !levelFilter || w.level === levelFilter;

    // Mode filter
    let matchesMode = true;
    if (filterMode === 'due') {
      matchesMode = !isUnstarted(w) && new Date(w.nextReviewAt).getTime() <= now;
    } else if (filterMode === 'weak') {
      matchesMode = w.isWeak;
    } else if (filterMode === 'mastered') {
      matchesMode = w.status === 'mastered';
    }

    return matchesSearch && matchesCategory && matchesLevel && matchesMode;
  });

  const visibleWords = filteredWords.slice(0, visibleCount);

  const availableLevels =
    selectedCategory === 'all'
      ? []
      : Array.from(new Set(words.filter(w => w.category === selectedCategory).map(w => w.level))).sort((a, b) => a - b);

  const templateWords = filteredWords
    .filter(w => isTemplateContent(w) && !failedEnrichIds.has(w.id))
    .slice(0, MAX_BATCH_ENRICH);

  const handleCreateWord = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedWord = newWord.word.trim();
    const trimmedMeaning = newWord.meaning.trim();
    if (!trimmedWord || !trimmedMeaning) return;

    // Duplicate Check Warning Confirmation
    if (exactMeaningMatch) {
      const confirmAdd = window.confirm(
        `【重複單字提醒】\n\n單字庫中已收錄「${exactMeaningMatch.word} (${exactMeaningMatch.meaning})」[分類：${categoryLabels[exactMeaningMatch.category] || exactMeaningMatch.category}]，中文釋義相同！\n\n您確定仍要重複建立一筆新單字嗎？\n（點擊「取消」將帶您前往查看現有單字，避免重複學習與分散複習次數）`
      );
      if (!confirmAdd) {
        setShowAddModal(false);
        setSearchTerm(exactMeaningMatch.word);
        return;
      }
    }

    let confusionNotes = '';
    let exampleEn = '';
    let exampleZh = '';

    if (isVerb) {
      const forms = getVerbForms(trimmedWord);
      confusionNotes = `【動詞三態】原形：${forms.base} | 過去式：${forms.past} | 過去分詞：${forms.pastParticiple} | 現在分詞：${forms.ing}`;
      exampleEn = `We should ${forms.base} this carefully.`;
      exampleZh = `我們應該好好「${trimmedMeaning}」。`;
    } else if (isNoun) {
      const forms = getNounForms(trimmedWord);
      confusionNotes = `【名詞複數變化】單數：${forms.singular} | 複數：${forms.plural}`;
      exampleEn = `This is a ${forms.singular}, and these are ${forms.plural}.`;
      exampleZh = `這是一個「${trimmedMeaning}」，那些是複數形態。`;
    } else {
      confusionNotes = `【${newWord.partOfSpeech}】重要自我擴充單字，持續複習以加深長期記憶。`;
      exampleEn = `Remember the usage of "${trimmedWord}".`;
      exampleZh = `請記住「${trimmedMeaning}」的語境用法。`;
    }

    const created: Word = {
      id: `w_custom_${Date.now()}`,
      word: trimmedWord,
      phonetic: `/${trimmedWord.toLowerCase()}/`,
      partOfSpeech: newWord.partOfSpeech,
      meaning: trimmedMeaning,
      exampleEn,
      exampleZh,
      confusionNotes,
      category: newWord.category,
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
    };

    onAddWord(created);
    runEnrich(created);
    setShowAddModal(false);
    setNewWord({
      word: '',
      partOfSpeech: 'v.',
      meaning: '',
      category: 'custom',
    });
  };

  const categories = [
    { id: 'all', label: '全部' },
    { id: 'junior', label: '國中' },
    { id: 'highschool', label: '高中' },
    { id: 'toeic', label: '多益' },
    { id: 'toefl', label: '托福' },
    { id: 'business', label: '商務' },
    { id: 'daily', label: '生活' },
    { id: 'custom', label: '自訂' },
  ];

  const categoryLabels: Record<string, string> = {
    junior: '國中必背',
    highschool: '高中 7000',
    toeic: '多益 TOEIC',
    toefl: '托福 TOEFL',
    business: '商務職場',
    daily: '常用生活',
    custom: '自訂',
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold font-fun text-white">單字庫</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            共 {words.length} 字
            {progressIds ? `・學習中 ${progressIds.size} 字` : ''}
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Secondary tools: export / import / AI */}
          <div className="relative">
            <button
              onClick={() => setShowMoreMenu(o => !o)}
              className={`flex items-center justify-center rounded-xl border border-slate-700 px-2.5 py-2 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer ${
                showMoreMenu ? 'bg-slate-800 text-white' : ''
              }`}
              title="更多工具"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
            {showMoreMenu && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setShowMoreMenu(false)} />
                <div className="absolute left-0 sm:left-auto sm:right-0 top-full mt-2 z-40 w-60 rounded-2xl border border-slate-800 bg-slate-900 p-1.5 shadow-2xl">
                  {[
                    {
                      key: 'import',
                      icon: <Upload className="h-4 w-4" />,
                      label: '匯入單字',
                      onClick: () => setShowImportModal(true),
                    },
                    {
                      key: 'export',
                      icon: <Download className="h-4 w-4" />,
                      label: '匯出單字',
                      onClick: () => setShowExportModal(true),
                    },
                    {
                      key: 'ai',
                      icon: <Sparkles className="h-4 w-4" />,
                      label: hasGeminiKey ? 'AI 金鑰（已啟用）' : '設定 AI 金鑰',
                      onClick: handleConfigureGeminiKey,
                    },
                  ].map(item => (
                    <button
                      key={item.key}
                      onClick={() => {
                        setShowMoreMenu(false);
                        item.onClick();
                      }}
                      className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
                    >
                      <span className="text-slate-500">{item.icon}</span>
                      {item.label}
                    </button>
                  ))}
                  {templateWords.length > 0 && (
                    <button
                      onClick={() => {
                        setShowMoreMenu(false);
                        runBatchEnrich(templateWords);
                      }}
                      disabled={isBatchEnriching}
                      className="w-full flex items-start gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer disabled:opacity-50 border-t border-slate-800 mt-1 pt-2.5"
                      title="為缺少真實例句與觀念解析的單字自動補全"
                    >
                      <FileText className="h-4 w-4 text-slate-500 shrink-0" />
                      <span>
                        {isBatchEnriching ? '補全中…' : '補全例句與解析'}
                        <span className="block text-[11px] font-normal text-slate-500">目前清單前 {templateWords.length} 字</span>
                      </span>
                    </button>
                  )}
                </div>
              </>
            )}
          </div>

          {filteredWords.length > 0 && (
            <button
              onClick={() => onStartSpecificQuiz(filteredWords.slice(0, 30))}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 rounded-xl border border-slate-700 hover:bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-200 transition-colors cursor-pointer"
            >
              測驗此清單（{filteredWords.length > 30 ? '前 30' : filteredWords.length}）
            </button>
          )}

          <button
            onClick={() => {
              setIsManualPos(false);
              setShowAddModal(true);
            }}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-3.5 py-2 text-xs font-bold text-white transition-colors cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            新增單字
          </button>
        </div>
      </div>

      {isBatchEnriching && (
        <p className="text-xs text-indigo-300 animate-pulse">正在補全例句與解析…</p>
      )}

      {/* Import Success Toast Banner */}
      {importSuccessMsg && (
        <div className="rounded-2xl bg-emerald-950/70 border border-emerald-500/40 p-3.5 text-xs text-emerald-300 flex items-center justify-between shadow-lg animate-in fade-in duration-200">
          <div className="flex items-center gap-2 font-bold">
            <Check className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>{importSuccessMsg}</span>
          </div>
          <button
            onClick={() => setImportSuccessMsg(null)}
            className="text-slate-400 hover:text-white p-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="space-y-2.5 rounded-2xl bg-slate-900/80 p-3.5 sm:p-4 border border-slate-800">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="搜尋英文或中文…"
            className="w-full rounded-xl bg-slate-950 border border-slate-700/80 pl-9 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Status filter */}
        <div className="flex items-center gap-3">
          <span className="w-8 shrink-0 text-xs font-semibold text-slate-500">狀態</span>
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            {([
              { id: 'all', label: '全部' },
              { id: 'due', label: '待複習' },
              { id: 'weak', label: '易錯' },
              { id: 'mastered', label: '已掌握' },
            ] as const).map(opt => (
              <button
                key={opt.id}
                onClick={() => setFilterMode(opt.id)}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold shrink-0 transition-colors cursor-pointer ${
                  filterMode === opt.id
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Category filter */}
        <div className="flex items-center gap-3">
          <span className="w-8 shrink-0 text-xs font-semibold text-slate-500">分類</span>
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold shrink-0 transition-colors cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {availableLevels.length > 1 && (
          <div className="flex items-center gap-3">
            <span className="w-8 shrink-0 text-xs font-semibold text-slate-500">級別</span>
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
              {[0, ...availableLevels].map(lv => (
                <button
                  key={lv}
                  onClick={() => setLevelFilter(lv)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-semibold shrink-0 transition-colors cursor-pointer ${
                    levelFilter === lv
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  {lv === 0 ? '全部' : `L${lv}`}
                </button>
              ))}
            </div>
          </div>
        )}

        <p className="text-xs text-slate-500">
          符合條件 {filteredWords.length} 字
          {filteredWords.length > visibleWords.length ? `，目前顯示前 ${visibleWords.length} 字` : ''}
        </p>
      </div>

      {/* Words Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filteredWords.length === 0 ? (
          <div className="col-span-full py-12 text-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/30">
            <p className="text-slate-400 text-sm">查無符合條件的單字</p>
            <p className="text-xs text-slate-500 mt-1">
              可以嘗試更換搜尋關鍵字，或點擊上方按鈕新增自訂單字！
            </p>
          </div>
        ) : (
          visibleWords.map(w => {
            const unstarted = isUnstarted(w);
            const isDue = !unstarted && new Date(w.nextReviewAt).getTime() <= now;

            return (
              <div
                key={w.id}
                className="flex flex-col rounded-2xl border border-slate-800 bg-slate-900/70 p-4 sm:p-5 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-xl sm:text-2xl font-bold font-fun text-white tracking-wide break-all">{w.word}</h3>
                      <button
                        onClick={() => speakEnglish(w.word, voiceGender, voiceSpeed)}
                        className="shrink-0 text-slate-500 hover:text-indigo-400 p-1 transition-colors cursor-pointer"
                        title="朗讀"
                      >
                        <Volume2 className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="mt-0.5 text-xs text-slate-500">
                      <span className="font-mono">{w.phonetic}</span>
                      <span className="mx-1.5">·</span>
                      <span className="text-slate-400">{w.partOfSpeech}</span>
                      <span className="mx-1.5">·</span>
                      {categoryLabels[w.category] || w.category}
                    </p>
                  </div>

                  {/* Status Badge */}
                  {unstarted ? (
                    <span className="shrink-0 rounded-md bg-slate-800 text-slate-300 text-[11px] px-2 py-0.5 font-semibold">
                      新字
                    </span>
                  ) : w.status === 'mastered' ? (
                    <span className="shrink-0 rounded-md bg-emerald-500/15 text-emerald-300 text-[11px] px-2 py-0.5 font-semibold">
                      精通
                    </span>
                  ) : isDue ? (
                    <span className="shrink-0 rounded-md bg-amber-500/15 text-amber-300 text-[11px] px-2 py-0.5 font-semibold">
                      待複習
                    </span>
                  ) : (
                    <span className="shrink-0 rounded-md bg-slate-800 text-slate-400 text-[11px] px-2 py-0.5">
                      間隔中
                    </span>
                  )}
                </div>

                <p className="text-base sm:text-lg font-semibold text-slate-100 mt-2">{w.meaning}</p>

                {/* Example sentence */}
                {w.exampleEn && (
                  <div className="mt-3 rounded-xl bg-slate-950/50 px-3 py-2.5 text-sm">
                    <p className="text-slate-200 leading-relaxed">{w.exampleEn}</p>
                    <p className="text-slate-500 text-xs sm:text-sm mt-1">{w.exampleZh}</p>
                  </div>
                )}

                {/* Notes */}
                {w.confusionNotes && (
                  <p className="mt-2.5 text-xs sm:text-sm text-slate-400 leading-relaxed">
                    <span className="text-slate-300 font-semibold">解析：</span>{w.confusionNotes}
                  </p>
                )}

                {enrichingIds.has(w.id) ? (
                  <p className="mt-2 text-xs text-indigo-300 animate-pulse">正在產生例句與解析…</p>
                ) : (
                  isTemplateContent(w) && (
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => runEnrich(w)}
                        disabled={isBatchEnriching}
                        className="flex items-center gap-1 text-xs font-semibold text-indigo-300 hover:text-indigo-200 transition-colors cursor-pointer disabled:opacity-50"
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                        補全例句與解析
                      </button>
                      {failedEnrichIds.has(w.id) && !spellingSuggestions[w.id] && (
                        <span className="text-xs text-rose-300">
                          查無資料或網路不通{hasGeminiKey ? '' : '，可設定 AI 金鑰後再試'}
                        </span>
                      )}
                      {spellingSuggestions[w.id] && (
                        <span className="flex flex-wrap items-center gap-1.5 text-xs text-amber-200">
                          「{w.word}」可能拼錯了，是不是
                          <b className="font-mono text-white">{spellingSuggestions[w.id]}</b>？
                          <button
                            onClick={() => handleFixSpelling(w, spellingSuggestions[w.id])}
                            className="rounded-md bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 px-2 py-0.5 font-bold text-amber-100 cursor-pointer"
                          >
                            改成 {spellingSuggestions[w.id]}
                          </button>
                          <button
                            onClick={() => runEnrich(w, { skipSpellCheck: true })}
                            className="text-slate-400 hover:text-slate-200 underline cursor-pointer"
                          >
                            拼字沒錯，繼續補全
                          </button>
                        </span>
                      )}
                    </div>
                  )
                )}

                {/* Footer: SRS metrics + actions */}
                <div className="mt-auto pt-3">
                  <div className="pt-2.5 border-t border-slate-800/60 flex items-center justify-between gap-2">
                    <span className="text-[11px] text-slate-500">
                      {unstarted
                        ? '尚未開始學習'
                        : `複習 ${w.repetition} 次・間隔 ${w.intervalDays} 天・連對 ${w.consecutiveCorrect}`}
                    </span>
                    <div className="flex items-center gap-0.5 shrink-0">
                      <button
                        onClick={() => onToggleWeak(w.id)}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                          w.isWeak
                            ? 'bg-rose-500/15 text-rose-400'
                            : 'text-slate-500 hover:text-rose-400 hover:bg-slate-800'
                        }`}
                        title={w.isWeak ? '已標記為易錯（點擊取消）' : '標記為易錯'}
                      >
                        <AlertTriangle className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => startEditingWord(w)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                        title="編輯"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      {!unstarted && (
                        <button
                          onClick={() => handleDeleteConfirm(w)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
                          title={isBankWordId(w.id) ? '清除此單字的學習紀錄' : '刪除此單字'}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {filteredWords.length > visibleWords.length && (
        <div className="flex justify-center">
          <button
            onClick={() => setVisibleCount(c => c + PAGE_SIZE)}
            className="rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 px-5 py-2 text-xs font-bold text-slate-200 transition-colors cursor-pointer"
          >
            顯示更多（還有 {filteredWords.length - visibleWords.length} 字）
          </button>
        </div>
      )}

      <p className="text-[11px] leading-relaxed text-slate-500 text-center px-2">
        內建詞庫來源：大考中心《高中英文參考詞彙表》（非營利使用）、教育部國中小參考字彙表、
        NGSL Project TOEIC / Business Service List（CC BY-SA 4.0）、ECDICT 中文釋義（MIT）。
      </p>

      {/* ADD CUSTOM WORD MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-slate-700 bg-slate-900 p-5 sm:p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-lg font-bold font-fun text-white flex items-center gap-2">
                <Plus className="h-5 w-5 text-indigo-400" />
                新增單字
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateWord} className="space-y-3.5">
              <div className="grid grid-cols-3 gap-2.5">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    英文單字 *
                  </label>
                  <input
                    type="text"
                    required
                    autoFocus
                    value={newWord.word}
                    onChange={e => setNewWord({ ...newWord, word: e.target.value })}
                    placeholder="例如: take, study, child, box..."
                    className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    詞性 *
                  </label>
                  <select
                    value={newWord.partOfSpeech}
                    onChange={e => {
                      setIsManualPos(true);
                      setNewWord({ ...newWord, partOfSpeech: e.target.value });
                    }}
                    className="w-full rounded-xl bg-slate-800 border border-slate-700 px-2 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 font-bold"
                  >
                    <option value="v.">v. 動詞</option>
                    <option value="n.">n. 名詞</option>
                    <option value="adj.">adj. 形容詞</option>
                    <option value="adv.">adv. 副詞</option>
                    <option value="phr.">phr. 片語</option>
                    <option value="prep.">prep. 介系詞</option>
                  </select>
                </div>
              </div>

              {addSpellingSuggestion && (
                <div className="flex flex-wrap items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                  <span>
                    可能拼錯了，是不是 <b className="font-mono text-white">{addSpellingSuggestion}</b>？
                  </span>
                  <button
                    type="button"
                    onClick={() => setNewWord(prev => ({ ...prev, word: addSpellingSuggestion }))}
                    className="rounded-md bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 px-2 py-0.5 font-bold text-amber-100 cursor-pointer"
                  >
                    改成 {addSpellingSuggestion}
                  </button>
                  <span className="text-[10px] text-slate-400">拼字正確可忽略</span>
                </div>
              )}

              {/* Intelligent POS Auto-Detection Banner */}
              {detectedPOS && (
                <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-xs animate-in fade-in duration-150">
                  <div className="flex items-center gap-1.5 text-indigo-300">
                    <Sparkles className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                    <span>
                      智慧偵測詞性：
                      <b className="text-amber-300 font-bold ml-1">{detectedPOS.label}</b>
                      <span className="text-[10px] text-slate-400 ml-1.5 hidden sm:inline">
                        （{detectedPOS.reason}）
                      </span>
                    </span>
                  </div>
                  {isManualPos && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsManualPos(false);
                        setNewWord(prev => ({ ...prev, partOfSpeech: detectedPOS.pos }));
                      }}
                      className="text-[10px] text-indigo-400 hover:text-indigo-200 underline font-semibold ml-2 cursor-pointer"
                    >
                      重新採用建議
                    </button>
                  )}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  中文釋義 *
                </label>
                <input
                  type="text"
                  required
                  value={newWord.meaning}
                  onChange={e => setNewWord({ ...newWord, meaning: e.target.value })}
                  placeholder="例如: 拿取、接受；學習；孩子"
                  className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Exact Duplicate Warning Banner */}
              {exactMeaningMatch && (
                <div className="rounded-2xl bg-amber-500/15 border border-amber-500/40 p-3.5 space-y-2 animate-in fade-in duration-200">
                  <div className="flex items-start gap-2.5 text-xs">
                    <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="font-bold text-amber-200">
                        ⚠️ 單字庫中已收錄相同單字與中文釋義！
                      </div>
                      <div className="text-slate-300 mt-1 text-[11px] leading-relaxed">
                        已存在單字：<b className="text-white font-mono">{exactMeaningMatch.word}</b>
                        <span className="mx-1 px-1.5 py-0.5 rounded bg-slate-800 text-indigo-300 text-[10px] font-semibold">
                          {exactMeaningMatch.partOfSpeech}
                        </span>
                        「<b className="text-amber-300">{exactMeaningMatch.meaning}</b>」
                        <span className="text-slate-400 ml-1">
                          （收錄於：{categoryLabels[exactMeaningMatch.category] || exactMeaningMatch.category}）
                        </span>
                      </div>
                      <div className="mt-2.5 flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setShowAddModal(false);
                            startEditingWord(exactMeaningMatch);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-amber-500/30 hover:bg-amber-500/40 border border-amber-500/50 text-[11px] font-bold text-amber-200 cursor-pointer flex items-center gap-1 transition-colors"
                        >
                          <Pencil className="h-3 w-3" />
                          直接修改已收錄的單字
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSearchTerm(exactMeaningMatch.word);
                            setShowAddModal(false);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 cursor-pointer transition-colors"
                        >
                          前往查看該單字
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Polysemy / Different Meaning Notice */}
              {!exactMeaningMatch && existingWordMatches.length > 0 && (
                <div className="rounded-2xl bg-indigo-500/10 border border-indigo-500/30 p-3 space-y-1 text-xs animate-in fade-in duration-150">
                  <div className="flex items-start gap-2">
                    <Sparkles className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="text-indigo-200 font-semibold">
                        ℹ️ 單字庫已收錄此英文單字（不同中文釋義）：
                      </div>
                      <div className="text-[11px] text-slate-300 mt-0.5">
                        現有單字：
                        {existingWordMatches.map((m, idx) => (
                          <span key={idx} className="mr-2">
                            <b className="text-white font-mono">{m.word}</b> [{m.partOfSpeech}]「{m.meaning}」
                          </span>
                        ))}
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">
                        若您要建立多重詞性或延伸釋義，可繼續建立新單字！
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  詞庫分類
                </label>
                <select
                  value={newWord.category}
                  onChange={e => setNewWord({ ...newWord, category: e.target.value as WordCategory })}
                  className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="custom">⭐️ 自訂單字本</option>
                  <option value="junior">🎒 國中必背單字</option>
                  <option value="highschool">🏫 高中 7000 單</option>
                  <option value="toeic">💼 多益 TOEIC</option>
                  <option value="toefl">🎓 托福 TOEFL</option>
                  <option value="business">🏢 商務職場</option>
                  <option value="daily">☕ 常用生活</option>
                </select>
              </div>

              {/* AUTOMATIC GRAMMAR INFLECTION DISPLAY */}
              {isVerb && (
                <div className="rounded-2xl bg-indigo-950/60 border border-indigo-500/30 p-3.5 space-y-2 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-indigo-300 flex items-center gap-1.5">
                      <Sparkles className="h-4 w-4 text-amber-400" />
                      ⚡ 動詞三態（系統智慧自動生成）：
                    </span>
                    <span className="text-[10px] text-indigo-300/80 font-mono">自動存入單字卡</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-2 text-center">
                      <div className="text-[10px] text-slate-400 mb-0.5">原形 (Base)</div>
                      <div className="font-bold font-mono text-amber-300 truncate">
                        {liveVerbForms?.base || '—'}
                      </div>
                    </div>
                    <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-2 text-center">
                      <div className="text-[10px] text-slate-400 mb-0.5">過去式 (Past)</div>
                      <div className="font-bold font-mono text-emerald-300 truncate">
                        {liveVerbForms?.past || '—'}
                      </div>
                    </div>
                    <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-2 text-center">
                      <div className="text-[10px] text-slate-400 mb-0.5">過去分詞 (P.P.)</div>
                      <div className="font-bold font-mono text-sky-300 truncate">
                        {liveVerbForms?.pastParticiple || '—'}
                      </div>
                    </div>
                    <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-2 text-center">
                      <div className="text-[10px] text-slate-400 mb-0.5">現在分詞 (-ing)</div>
                      <div className="font-bold font-mono text-purple-300 truncate">
                        {liveVerbForms?.ing || '—'}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {isNoun && (
                <div className="rounded-2xl bg-indigo-950/60 border border-indigo-500/30 p-3.5 space-y-2 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-indigo-300 flex items-center gap-1.5">
                      <Sparkles className="h-4 w-4 text-amber-400" />
                      📦 名詞複數變化（系統智慧自動生成）：
                    </span>
                    <span className="text-[10px] text-indigo-300/80 font-mono">自動存入單字卡</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2.5 text-xs">
                    <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-2.5 text-center">
                      <div className="text-[10px] text-slate-400 mb-0.5">單數 (Singular)</div>
                      <div className="font-bold font-mono text-amber-300 truncate">
                        {liveNounForms?.singular || '—'}
                      </div>
                    </div>
                    <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-2.5 text-center">
                      <div className="text-[10px] text-slate-400 mb-0.5">複數 (Plural)</div>
                      <div className="font-bold font-mono text-emerald-300 truncate">
                        {liveNounForms?.plural || '—'}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-400 hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={!newWord.word.trim() || !newWord.meaning.trim()}
                  className={`rounded-xl px-5 py-2 text-xs font-bold text-white transition-all shadow-lg active:scale-95 cursor-pointer ${
                    !newWord.word.trim() || !newWord.meaning.trim()
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30'
                  }`}
                >
                  確認建立加入字庫
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT WORD MODAL */}
      {editingWord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-indigo-500/40 bg-slate-900 p-5 sm:p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-lg font-bold font-fun text-white flex items-center gap-2">
                <Pencil className="h-5 w-5 text-amber-400" />
                修改單字內容
              </h3>
              <button
                type="button"
                onClick={() => setEditingWord(null)}
                className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditWord} className="space-y-3.5">
              <div className="grid grid-cols-3 gap-2.5">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    英文單字 *
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.word}
                    onChange={e => setEditForm({ ...editForm, word: e.target.value })}
                    className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    詞性 *
                  </label>
                  <select
                    value={editForm.partOfSpeech}
                    onChange={e => {
                      setIsEditManualPos(true);
                      setEditForm({ ...editForm, partOfSpeech: e.target.value });
                    }}
                    className="w-full rounded-xl bg-slate-800 border border-slate-700 px-2 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 font-bold"
                  >
                    <option value="v.">v. 動詞</option>
                    <option value="n.">n. 名詞</option>
                    <option value="adj.">adj. 形容詞</option>
                    <option value="adv.">adv. 副詞</option>
                    <option value="phr.">phr. 片語</option>
                    <option value="prep.">prep. 介系詞</option>
                  </select>
                </div>
              </div>

              {/* Intelligent POS Auto-Detection Banner */}
              {detectedEditPOS && (
                <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-xs animate-in fade-in duration-150">
                  <div className="flex items-center gap-1.5 text-indigo-300">
                    <Sparkles className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                    <span>
                      智慧偵測詞性：
                      <b className="text-amber-300 font-bold ml-1">{detectedEditPOS.label}</b>
                      <span className="text-[10px] text-slate-400 ml-1.5 hidden sm:inline">
                        （{detectedEditPOS.reason}）
                      </span>
                    </span>
                  </div>
                  {isEditManualPos && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditManualPos(false);
                        setEditForm(prev => ({ ...prev, partOfSpeech: detectedEditPOS.pos }));
                      }}
                      className="text-[10px] text-indigo-400 hover:text-indigo-200 underline font-semibold ml-2 cursor-pointer"
                    >
                      重新採用建議
                    </button>
                  )}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  中文釋義 *
                </label>
                <input
                  type="text"
                  required
                  value={editForm.meaning}
                  onChange={e => setEditForm({ ...editForm, meaning: e.target.value })}
                  className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-bold text-amber-300"
                />
              </div>

              {/* Duplicate Detection Alert in Edit Modal */}
              {duplicateEditMatch && (
                <div className="rounded-2xl bg-amber-500/15 border border-amber-500/40 p-3 space-y-1 text-xs animate-in fade-in duration-200">
                  <div className="flex items-center gap-2 text-amber-300 font-bold">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    <span>⚠️ 修改後的單字與另一筆現有單字重複：</span>
                  </div>
                  <div className="text-[11px] text-slate-300 pl-6">
                    已存在單字：<b className="text-white font-mono">{duplicateEditMatch.word}</b>
                    <span className="mx-1 px-1 rounded bg-slate-800 text-indigo-300 text-[10px]">{duplicateEditMatch.partOfSpeech}</span>
                    「<b className="text-amber-300">{duplicateEditMatch.meaning}</b>」
                    <span className="text-slate-400 ml-1">
                      （收錄於：{categoryLabels[duplicateEditMatch.category] || duplicateEditMatch.category}）
                    </span>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  詞庫分類
                </label>
                <select
                  value={editForm.category}
                  onChange={e => setEditForm({ ...editForm, category: e.target.value as WordCategory })}
                  className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="custom">⭐️ 自訂單字本</option>
                  <option value="junior">🎒 國中必背單字</option>
                  <option value="highschool">🏫 高中 7000 單</option>
                  <option value="toeic">💼 多益 TOEIC</option>
                  <option value="toefl">🎓 托福 TOEFL</option>
                  <option value="business">🏢 商務職場</option>
                  <option value="daily">☕ 常用生活</option>
                </select>
              </div>

              {/* AUTOMATIC GRAMMAR INFLECTION DISPLAY */}
              {isEditVerb && (
                <div className="rounded-2xl bg-indigo-950/60 border border-indigo-500/30 p-3.5 space-y-2 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-indigo-300 flex items-center gap-1.5">
                      <Sparkles className="h-4 w-4 text-amber-400" />
                      ⚡ 動詞三態（自動更新）：
                    </span>
                    <span className="text-[10px] text-indigo-300/80 font-mono">儲存時將自動套用</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-2 text-center">
                      <div className="text-[10px] text-slate-400 mb-0.5">原形 (Base)</div>
                      <div className="font-bold font-mono text-amber-300 truncate">
                        {liveEditVerbForms?.base || '—'}
                      </div>
                    </div>
                    <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-2 text-center">
                      <div className="text-[10px] text-slate-400 mb-0.5">過去式 (Past)</div>
                      <div className="font-bold font-mono text-emerald-300 truncate">
                        {liveEditVerbForms?.past || '—'}
                      </div>
                    </div>
                    <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-2 text-center">
                      <div className="text-[10px] text-slate-400 mb-0.5">過去分詞 (P.P.)</div>
                      <div className="font-bold font-mono text-sky-300 truncate">
                        {liveEditVerbForms?.pastParticiple || '—'}
                      </div>
                    </div>
                    <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-2 text-center">
                      <div className="text-[10px] text-slate-400 mb-0.5">現在分詞 (-ing)</div>
                      <div className="font-bold font-mono text-purple-300 truncate">
                        {liveEditVerbForms?.ing || '—'}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {isEditNoun && (
                <div className="rounded-2xl bg-indigo-950/60 border border-indigo-500/30 p-3.5 space-y-2 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-indigo-300 flex items-center gap-1.5">
                      <Sparkles className="h-4 w-4 text-amber-400" />
                      📦 名詞複數變化（自動更新）：
                    </span>
                    <span className="text-[10px] text-indigo-300/80 font-mono">儲存時將自動套用</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2.5 text-xs">
                    <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-2.5 text-center">
                      <div className="text-[10px] text-slate-400 mb-0.5">單數 (Singular)</div>
                      <div className="font-bold font-mono text-amber-300 truncate">
                        {liveEditNounForms?.singular || '—'}
                      </div>
                    </div>
                    <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-2.5 text-center">
                      <div className="text-[10px] text-slate-400 mb-0.5">複數 (Plural)</div>
                      <div className="font-bold font-mono text-emerald-300 truncate">
                        {liveEditNounForms?.plural || '—'}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => handleDeleteConfirm(editingWord)}
                  className="rounded-xl px-3 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-950/40 border border-rose-900/40 transition-colors cursor-pointer flex items-center gap-1"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  刪除單字
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingWord(null)}
                    className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-400 hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    disabled={!editForm.word.trim() || !editForm.meaning.trim()}
                    className={`rounded-xl px-5 py-2 text-xs font-bold text-white transition-all shadow-lg active:scale-95 cursor-pointer ${
                      !editForm.word.trim() || !editForm.meaning.trim()
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30'
                    }`}
                  >
                    儲存變更
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EXPORT WORDS MODAL */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-slate-700 bg-slate-900 p-5 sm:p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-lg font-bold font-fun text-white flex items-center gap-2">
                <Download className="h-5 w-5 text-sky-400" />
                匯出單字本
              </h3>
              <button
                type="button"
                onClick={() => setShowExportModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">
                  1. 選擇匯出單字範圍：
                </label>
                <div className="grid grid-cols-1 gap-2">
                  <label
                    onClick={() => setExportScope('custom')}
                    className={`flex items-center justify-between p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                      exportScope === 'custom'
                        ? 'bg-sky-500/10 border-sky-500/50 text-white'
                        : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">⭐️</span>
                      <div>
                        <div className="font-bold">僅自訂單字本</div>
                        <div className="text-[10px] text-slate-400">只匯出自己建立的學習單字</div>
                      </div>
                    </div>
                    <span className="font-mono text-sky-400 font-bold">
                      {words.filter(w => w.category === 'custom').length} 字
                    </span>
                  </label>

                  <label
                    onClick={() => setExportScope('filtered')}
                    className={`flex items-center justify-between p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                      exportScope === 'filtered'
                        ? 'bg-sky-500/10 border-sky-500/50 text-white'
                        : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">📋</span>
                      <div>
                        <div className="font-bold">目前清單篩選結果</div>
                        <div className="text-[10px] text-slate-400">根據目前分類或搜尋關鍵字所得</div>
                      </div>
                    </div>
                    <span className="font-mono text-sky-400 font-bold">
                      {filteredWords.length} 字
                    </span>
                  </label>

                  <label
                    onClick={() => setExportScope('all')}
                    className={`flex items-center justify-between p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                      exportScope === 'all'
                        ? 'bg-sky-500/10 border-sky-500/50 text-white'
                        : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">📚</span>
                      <div>
                        <div className="font-bold">全庫所有單字</div>
                        <div className="text-[10px] text-slate-400">包含系統預設分類與所有自訂單字</div>
                      </div>
                    </div>
                    <span className="font-mono text-sky-400 font-bold">
                      {words.length} 字
                    </span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">
                  2. 選擇匯出格式：
                </label>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setExportFormat('csv')}
                    className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                      exportFormat === 'csv'
                        ? 'bg-emerald-500/20 border-emerald-500 text-white font-bold'
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    <FileText className="h-5 w-5 text-emerald-400" />
                    <span>CSV 試算表</span>
                    <span className="text-[9px] text-slate-400">Excel / Sheets</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setExportFormat('json')}
                    className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                      exportFormat === 'json'
                        ? 'bg-amber-500/20 border-amber-500 text-white font-bold'
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    <Download className="h-5 w-5 text-amber-400" />
                    <span>JSON 備份檔</span>
                    <span className="text-[9px] text-slate-400">完整進度複習備份</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setExportFormat('txt')}
                    className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                      exportFormat === 'txt'
                        ? 'bg-indigo-500/20 border-indigo-500 text-white font-bold'
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    <BookOpen className="h-5 w-5 text-indigo-400" />
                    <span>純文字 TXT</span>
                    <span className="text-[9px] text-slate-400">單字清單列印</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowExportModal(false)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-400 hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={handleExecuteExport}
                  className="rounded-xl bg-sky-600 hover:bg-sky-500 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-sky-600/30 transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
                >
                  <Download className="h-3.5 w-3.5" />
                  下載匯出檔案
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* IMPORT WORDS MODAL */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-slate-700 bg-slate-900 p-5 sm:p-6 shadow-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4 shrink-0">
              <h3 className="text-lg font-bold font-fun text-white flex items-center gap-2">
                <Upload className="h-5 w-5 text-emerald-400" />
                批量匯入單字
              </h3>
              <button
                type="button"
                onClick={() => setShowImportModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3.5 overflow-y-auto pr-1">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  1. 選擇匯入時所屬詞庫分類：
                </label>
                <select
                  value={importCategory}
                  onChange={e => handleCategoryChangeForImport(e.target.value as WordCategory)}
                  className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="custom">⭐️ 自訂單字本 (預設)</option>
                  <option value="junior">🎒 國中必背單字</option>
                  <option value="highschool">🏫 高中 7000 單</option>
                  <option value="toeic">💼 多益 TOEIC</option>
                  <option value="toefl">🎓 托福 TOEFL</option>
                  <option value="business">🏢 商務職場</option>
                  <option value="daily">☕ 常用生活</option>
                </select>
              </div>

              {/* Upload file button */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  2. 方式一：上傳檔案 (.csv / .json / .txt)
                </label>
                <label className="flex items-center justify-center gap-2 w-full p-3 rounded-xl border border-dashed border-slate-700 bg-slate-800/40 hover:bg-slate-800 hover:border-slate-600 cursor-pointer transition-colors text-xs text-slate-300">
                  <Upload className="h-4 w-4 text-indigo-400" />
                  <span>點擊選擇檔案上傳</span>
                  <input
                    type="file"
                    accept=".csv,.json,.txt"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Paste Text Area */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-300">
                    3. 方式二：直接貼上單字文字清單
                  </label>
                  <span className="text-[10px] text-slate-400">
                    一行一單字，系統自動辨識詞性與三態！
                  </span>
                </div>
                <textarea
                  rows={4}
                  value={importText}
                  onChange={e => handleTextChange(e.target.value)}
                  placeholder={`每行一個單字，支援格式：\napple, n., 蘋果\nstudy, 學習\ntake - 拿取\nbeautiful, 美麗的`}
                  className="w-full rounded-xl bg-slate-800 border border-slate-700 p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              {/* Parsed Preview */}
              {parsedImportWords.length > 0 && (
                <div className="rounded-2xl bg-indigo-950/40 border border-indigo-500/30 p-3 space-y-2 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-indigo-300 flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                      已成功解析 {parsedImportWords.length} 個單字：
                    </span>
                    <span className="text-[10px] text-slate-400">
                      （自動分析詞性、動詞三態及名詞複數）
                    </span>
                  </div>
                  <div className="max-h-36 overflow-y-auto space-y-1 pr-1">
                    {parsedImportWords.map((w, idx) => {
                      const isDup = words.some(ew => ew.word.toLowerCase() === w.word.toLowerCase());
                      return (
                        <div
                          key={idx}
                          className={`flex items-center justify-between p-1.5 rounded-lg border text-xs font-mono transition-colors ${
                            isDup
                              ? 'bg-amber-950/30 border-amber-500/30'
                              : 'bg-slate-900/80 border-slate-800'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 truncate">
                            <b className="text-white">{w.word}</b>
                            <span className="text-[10px] px-1 rounded bg-slate-800 text-indigo-300">
                              {w.partOfSpeech}
                            </span>
                            <span className="text-slate-300 truncate">{w.meaning}</span>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {isDup && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-sans font-bold">
                                ⚠️ 已在字庫
                              </span>
                            )}
                            {w.partOfSpeech.startsWith('v') && (
                              <span className="text-[9px] text-amber-400/90 font-sans hidden sm:inline">
                                三態已生成
                              </span>
                            )}
                            {w.partOfSpeech.startsWith('n') && (
                              <span className="text-[9px] text-emerald-400/90 font-sans hidden sm:inline">
                                複數已生成
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800 mt-2 shrink-0">
              <button
                type="button"
                onClick={() => setShowImportModal(false)}
                className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-400 hover:bg-slate-800 transition-colors cursor-pointer"
              >
                取消
              </button>
              <button
                type="button"
                disabled={parsedImportWords.length === 0}
                onClick={handleConfirmImport}
                className={`rounded-xl px-5 py-2 text-xs font-bold text-white transition-all shadow-lg active:scale-95 cursor-pointer flex items-center gap-1.5 ${
                  parsedImportWords.length === 0
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30'
                }`}
              >
                <Check className="h-3.5 w-3.5" />
                確認匯入 ({parsedImportWords.length} 個單字)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

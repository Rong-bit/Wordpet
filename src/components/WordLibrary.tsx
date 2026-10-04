import React, { useState, useEffect } from 'react';
import { Word, WordCategory } from '../types';
import { speakEnglish } from '../utils/tts';
import { getVerbForms, getNounForms, detectPartOfSpeech } from '../utils/englishGrammar';
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
} from 'lucide-react';

interface WordLibraryProps {
  words: Word[];
  onAddWord: (word: Word) => void;
  onUpdateWord?: (word: Word) => void;
  onDeleteWord?: (wordId: string) => void;
  onToggleWeak: (wordId: string) => void;
  onStartSpecificQuiz: (selectedWords: Word[]) => void;
  voiceGender: 'en-US' | 'en-GB';
  voiceSpeed: number;
}

export const WordLibrary: React.FC<WordLibraryProps> = ({
  words,
  onAddWord,
  onUpdateWord,
  onDeleteWord,
  onToggleWeak,
  onStartSpecificQuiz,
  voiceGender,
  voiceSpeed,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [filterMode, setFilterMode] = useState<'all' | 'due' | 'weak' | 'mastered'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
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

  // Editing Word State
  const [editingWord, setEditingWord] = useState<Word | null>(null);
  const [editForm, setEditForm] = useState({
    word: '',
    partOfSpeech: 'v.',
    meaning: '',
    category: 'custom' as WordCategory,
  });
  const [isEditManualPos, setIsEditManualPos] = useState(true);

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

    if (isEditVerb) {
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

    const updated: Word = {
      ...editingWord,
      word: trimmedWord,
      phonetic: `/${trimmedWord.toLowerCase()}/`,
      partOfSpeech: editForm.partOfSpeech,
      meaning: trimmedMeaning,
      category: editForm.category,
      confusionNotes,
      exampleEn,
      exampleZh,
    };

    onUpdateWord?.(updated);
    setEditingWord(null);
  };

  const handleDeleteConfirm = (word: Word) => {
    const ok = window.confirm(`確定要從單字庫中刪除「${word.word} (${word.meaning})」嗎？此動作無法復原。`);
    if (ok) {
      onDeleteWord?.(word.id);
    }
  };

  const now = new Date().getTime();

  // Filter words
  const filteredWords = words.filter(w => {
    // Search filter
    const matchesSearch =
      w.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.meaning.includes(searchTerm);

    // Category filter
    const matchesCategory =
      selectedCategory === 'all' || w.category === selectedCategory;

    // Mode filter
    let matchesMode = true;
    if (filterMode === 'due') {
      matchesMode = new Date(w.nextReviewAt).getTime() <= now;
    } else if (filterMode === 'weak') {
      matchesMode = w.isWeak;
    } else if (filterMode === 'mastered') {
      matchesMode = w.status === 'mastered';
    }

    return matchesSearch && matchesCategory && matchesMode;
  });

  const handleCreateWord = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedWord = newWord.word.trim();
    const trimmedMeaning = newWord.meaning.trim();
    if (!trimmedWord || !trimmedMeaning) return;

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
    setShowAddModal(false);
    setNewWord({
      word: '',
      partOfSpeech: 'v.',
      meaning: '',
      category: 'custom',
    });
  };

  const categories = [
    { id: 'all', label: '全部單字' },
    { id: 'junior', label: '國中必背單字' },
    { id: 'highschool', label: '高中 7000 單' },
    { id: 'toeic', label: '多益 TOEIC' },
    { id: 'toefl', label: '托福 TOEFL' },
    { id: 'business', label: '商務職場' },
    { id: 'daily', label: '常用生活' },
    { id: 'custom', label: '⭐️ 自訂單字本' },
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
          <h2 className="text-2xl font-bold font-fun text-white flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-indigo-400" />
            單字庫與自訂學習區
          </h2>
          <p className="text-xs text-slate-400">
            共收錄 {words.length} 個單字・可新增自學單字庫並進行專屬熟悉測驗
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {filteredWords.length > 0 && (
            <button
              onClick={() => onStartSpecificQuiz(filteredWords)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/40 border border-indigo-500/40 px-3.5 py-2 text-xs font-bold text-indigo-200 transition-colors"
            >
              <Sparkles className="h-3.5 w-3.5 text-indigo-300" />
              測驗此清單 ({filteredWords.length})
            </button>
          )}

          <button
            onClick={() => {
              setIsManualPos(false);
              setShowAddModal(true);
            }}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-4 py-2 text-xs font-bold text-white transition-colors shadow-lg shadow-indigo-600/30 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            新增自訂單字
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-3 rounded-2xl bg-slate-900/80 p-4 border border-slate-800">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="搜尋英文單字或中文釋義..."
              className="w-full rounded-xl bg-slate-950 border border-slate-700/80 pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Quick Status Filter Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setFilterMode('all')}
              className={`rounded-lg px-2.5 py-1.5 text-xs font-medium shrink-0 transition-colors ${
                filterMode === 'all'
                  ? 'bg-indigo-600 text-white font-bold'
                  : 'text-slate-400 hover:text-white bg-slate-800/40'
              }`}
            >
              全部
            </button>
            <button
              onClick={() => setFilterMode('due')}
              className={`rounded-lg px-2.5 py-1.5 text-xs font-medium shrink-0 transition-colors ${
                filterMode === 'due'
                  ? 'bg-indigo-600 text-white font-bold'
                  : 'text-slate-400 hover:text-white bg-slate-800/40'
              }`}
            >
              待複習
            </button>
            <button
              onClick={() => setFilterMode('weak')}
              className={`rounded-lg px-2.5 py-1.5 text-xs font-medium shrink-0 transition-colors ${
                filterMode === 'weak'
                  ? 'bg-rose-600 text-white font-bold'
                  : 'text-rose-300 hover:text-white bg-rose-950/40'
              }`}
            >
              易錯弱點
            </button>
            <button
              onClick={() => setFilterMode('mastered')}
              className={`rounded-lg px-2.5 py-1.5 text-xs font-medium shrink-0 transition-colors ${
                filterMode === 'mastered'
                  ? 'bg-emerald-600 text-white font-bold'
                  : 'text-emerald-300 hover:text-white bg-emerald-950/40'
              }`}
            >
              已掌握
            </button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`rounded-xl px-3 py-1 text-xs shrink-0 transition-all ${
                selectedCategory === cat.id
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-bold'
                  : 'text-slate-400 hover:text-slate-200 border border-transparent hover:bg-slate-800/40'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
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
          filteredWords.map(w => {
            const isDue = new Date(w.nextReviewAt).getTime() <= now;

            return (
              <div
                key={w.id}
                className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 hover:border-slate-700 transition-all hover:shadow-lg"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold font-fun text-white">{w.word}</h3>
                    <span className="text-xs text-slate-400 font-mono">{w.phonetic}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-indigo-300 font-semibold">
                      {w.partOfSpeech}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 font-medium">
                      {categoryLabels[w.category] || w.category}
                    </span>
                    <button
                      onClick={() => speakEnglish(w.word, voiceGender, voiceSpeed)}
                      className="text-slate-400 hover:text-indigo-400 p-1 transition-colors"
                      title="朗讀"
                    >
                      <Volume2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Edit Word Button */}
                    <button
                      onClick={() => startEditingWord(w)}
                      className="p-1.5 rounded-lg text-xs text-slate-400 hover:text-indigo-300 hover:bg-slate-800 transition-colors cursor-pointer"
                      title="修改單字內容 (拼寫、中文、詞性、分類)"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>

                    {/* Delete Word Button */}
                    <button
                      onClick={() => handleDeleteConfirm(w)}
                      className="p-1.5 rounded-lg text-xs text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
                      title="刪除此單字"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>

                    {/* Weak Button Toggle */}
                    <button
                      onClick={() => onToggleWeak(w.id)}
                      className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                        w.isWeak
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : 'text-slate-500 hover:text-rose-400 hover:bg-slate-800'
                      }`}
                      title={w.isWeak ? '已標記為易錯單字' : '標記為不熟/易錯'}
                    >
                      <AlertTriangle className="h-3.5 w-3.5" />
                    </button>

                    {/* Status Badge */}
                    {w.status === 'mastered' ? (
                      <span className="rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] px-2 py-0.5 font-bold">
                        精通
                      </span>
                    ) : isDue ? (
                      <span className="rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] px-2 py-0.5 font-bold">
                        今日待複習
                      </span>
                    ) : (
                      <span className="rounded-md bg-slate-800 text-slate-400 text-[10px] px-2 py-0.5">
                        間隔中
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-sm font-bold text-amber-300 mt-1">{w.meaning}</p>

                {/* Example sentence */}
                <div className="mt-2.5 rounded-xl bg-slate-950/60 p-2.5 border border-slate-800/80 text-xs">
                  <p className="text-slate-300 italic">{w.exampleEn}</p>
                  <p className="text-slate-400 text-[11px] mt-0.5">{w.exampleZh}</p>
                </div>

                {/* Notes */}
                {w.confusionNotes && (
                  <p className="mt-2 text-[11px] text-slate-400 line-clamp-2">
                    💡 <span className="text-slate-300 font-medium">觀念解析：</span> {w.confusionNotes}
                  </p>
                )}

                {/* Footer SRS metrics */}
                <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                  <span>重複次數: {w.repetition}</span>
                  <span>複習間隔: {w.intervalDays} 天</span>
                  <span>正確連續: {w.consecutiveCorrect}</span>
                </div>
              </div>
            );
          })
        )}
      </div>

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
    </div>
  );
};

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Word, Pet, Item, DailyQuest, Achievement, UserProfile } from './types';
import { loadAppState, saveAppState, AppState } from './utils/storage';
import { loadAllWordBanks } from './utils/wordBank';
import { addCategoryPatch, getWordCategories, isInCategory } from './utils/wordCategory';
import { INITIAL_PET, INITIAL_ITEMS } from './data/bestiary';
import { applyExpGain, ExpGainResult } from './utils/evolution';
import { EvolutionCelebrationModal } from './components/EvolutionCelebrationModal';
import { soundFx } from './utils/sound';
import confetti from 'canvas-confetti';
import { Navbar } from './components/Navbar';
import { PetCard } from './components/PetCard';
import { QuizSection } from './components/QuizSection';
import { WeakWordsDrill } from './components/WeakWordsDrill';
import { WordLibrary } from './components/WordLibrary';
import { StatsView } from './components/StatsView';
import { LeaderboardView } from './components/LeaderboardView';
import { MutationModal } from './components/MutationModal';
import { PetCustomizerModal } from './components/PetCustomizerModal';
import { PetShareModal } from './components/PetShareModal';
import { BestiaryModal } from './components/BestiaryModal';
import { InventoryModal } from './components/InventoryModal';
import { AchievementsModal } from './components/AchievementsModal';
import { SyncModal } from './components/SyncModal';

import {
  Play,
  RotateCcw,
  Zap,
  Sparkles,
  Flame,
  Award,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

export default function App() {
  const [appState, setAppState] = useState<AppState>(() => loadAppState());
  const [currentTab, setCurrentTab] = useState<'home' | 'library' | 'stats' | 'leaderboard'>('home');

  // Active Modes
  const [isQuizActive, setIsQuizActive] = useState(false);
  const [isWeakDrillActive, setIsWeakDrillActive] = useState(false);
  const [customQuizList, setCustomQuizList] = useState<Word[] | null>(null);

  // Modals
  const [showMutation, setShowMutation] = useState(false);
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showBestiary, setShowBestiary] = useState(false);
  const [showInventory, setShowInventory] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showSync, setShowSync] = useState(false);

  const { words, pet, items, quests, achievements, profile, unlockedSpecies } = appState;

  // Sync state to local storage whenever critical parts change
  useEffect(() => {
    saveAppState(appState);
  }, [appState]);

  // Selected category filter for Home Adventure Quiz
  const [homeQuizCategory, setHomeQuizCategory] = useState<string>('all');

  // Audio settings sync
  useEffect(() => {
    soundFx.setEnabled(profile.soundEnabled);
  }, [profile.soundEnabled]);

  // Dynamic Font Size Scaling Sync to HTML root element
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('font-size-large', 'font-size-huge');
    const mode = profile.fontSizeMode || 'large'; // Default to 'large' as user requested larger fonts!
    if (mode === 'large') {
      root.classList.add('font-size-large');
    } else if (mode === 'huge') {
      root.classList.add('font-size-huge');
    }
  }, [profile.fontSizeMode]);

  // Built-in word banks (國中 2000 / 高中 6000 / 托福 / 生活) are loaded lazily and only
  // enter `words` (and localStorage) once the learner actually studies or edits them.
  const [bankWords, setBankWords] = useState<Word[]>([]);
  useEffect(() => {
    let cancelled = false;
    loadAllWordBanks().then(list => {
      if (!cancelled) setBankWords(list);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const progressIds = useMemo(() => new Set(words.map(w => w.id)), [words]);

  const allWords = useMemo(() => {
    const learnedKeys = new Set(words.map(w => `${w.category}|${w.word.toLowerCase()}`));
    const fresh = bankWords.filter(
      b => !progressIds.has(b.id) && !learnedKeys.has(`${b.category}|${b.word.toLowerCase()}`)
    );
    return [...words, ...fresh];
  }, [words, bankWords, progressIds]);

  const allWordsRef = useRef(allWords);
  allWordsRef.current = allWords;

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    allWords.forEach(w => {
      getWordCategories(w).forEach(c => {
        counts[c] = (counts[c] || 0) + 1;
      });
    });
    return counts;
  }, [allWords]);

  // Calculate due words & weak words (only words already in the learner's progress)
  const now = new Date().getTime();
  const dueWords = words.filter(w => new Date(w.nextReviewAt).getTime() <= now);
  const weakWords = words.filter(w => w.isWeak);
  const masteredWords = words.filter(w => w.status === 'mastered');

  // Current category words on Home page
  const homeCategoryWords = useMemo(
    () => (homeQuizCategory === 'all' ? allWords : allWords.filter(w => isInCategory(w, homeQuizCategory))),
    [allWords, homeQuizCategory]
  );

  const homeCategoryDueWords = homeCategoryWords.filter(
    w => progressIds.has(w.id) && new Date(w.nextReviewAt).getTime() <= now
  );
  const homeCategoryNewCount = homeCategoryWords.length - homeCategoryWords.filter(w => progressIds.has(w.id)).length;

  // User selected batch size: 10, 20, 25, 30, or 0 (all), defaults to 20
  const currentBatchSize = profile.quizBatchSize ?? 20;

  // Build a smart, focused session list capped at the requested batch size (20~30 questions)
  const buildSmartQuizBatch = (
    pool: Word[],
    duePool: Word[],
    limit: number
  ): Word[] => {
    if (limit <= 0) {
      return duePool.length > 0 ? duePool : pool.slice(0, 50);
    }

    // 1. Sort due words by most overdue first
    const sortedDue = [...duePool].sort(
      (a, b) => new Date(a.nextReviewAt).getTime() - new Date(b.nextReviewAt).getTime()
    );

    if (sortedDue.length >= limit) {
      return sortedDue.slice(0, limit);
    }

    // 2. If due words are fewer than the batch size (e.g. 5 due words, limit 20),
    // fill the remaining slots with non-due words from this category (prioritize weak or least reviewed)
    const dueIds = new Set(sortedDue.map(w => w.id));
    const extraCandidates = pool
      .filter(w => !dueIds.has(w.id))
      .sort((a, b) => {
        if (a.isWeak !== b.isWeak) return a.isWeak ? -1 : 1;
        return a.repetition - b.repetition;
      });

    const needed = limit - sortedDue.length;
    return [...sortedDue, ...extraCandidates.slice(0, needed)];
  };

  const homeDueKey = homeCategoryDueWords.map(w => w.id).join(',');
  const currentQuizList = useMemo(
    () => buildSmartQuizBatch(homeCategoryWords, homeCategoryDueWords, currentBatchSize),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [homeCategoryWords, homeDueKey, currentBatchSize]
  );

  const BATCH_SIZE_OPTIONS = [
    { value: 10, label: '10' },
    { value: 20, label: '20' },
    { value: 25, label: '25' },
    { value: 30, label: '30' },
    { value: 0, label: '全部' },
  ];

  const HOME_QUIZ_CATEGORIES = [
    { id: 'all', label: '全部', shortLabel: '全部單字' },
    { id: 'junior', label: '國中', shortLabel: '國中必背' },
    { id: 'highschool', label: '高中', shortLabel: '高中 7000' },
    { id: 'toeic', label: '多益', shortLabel: '多益' },
    { id: 'toefl', label: '托福', shortLabel: '托福' },
    { id: 'business', label: '商務', shortLabel: '商務' },
    { id: 'daily', label: '生活', shortLabel: '生活' },
    { id: 'custom', label: '自訂', shortLabel: '自訂' },
  ];

  const selectedCategoryObj = HOME_QUIZ_CATEGORIES.find(c => c.id === homeQuizCategory) || HOME_QUIZ_CATEGORIES[0];

  // --- GROWTH HELPERS ---
  const [celebration, setCelebration] = useState<{ pet: Pet; hatched: boolean } | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(current => (current === msg ? null : current)), 4500);
  };

  const announceGrowth = (growth: ExpGainResult) => {
    if (growth.levelsGained > 0) soundFx.playLevelUp();
    if (growth.hatched || growth.evolvedStages.length > 0) {
      if (growth.hatched) soundFx.playHatch();
      else soundFx.playMutation();
      confetti({ particleCount: 160, spread: 100, origin: { y: 0.5 } });
      setCelebration({ pet: growth.pet, hatched: growth.hatched && growth.evolvedStages.length === 0 });
    }
  };

  const mergeSpecies = (list: string[], add: string[]) => Array.from(new Set([...list, ...add]));

  const addItem = (list: Item[], itemId: string, amount: number, template?: Item): Item[] => {
    if (list.some(i => i.id === itemId)) {
      return list.map(i => (i.id === itemId ? { ...i, count: i.count + amount } : i));
    }
    const base = template || INITIAL_ITEMS.find(i => i.id === itemId);
    return base ? [...list, { ...base, count: amount }] : list;
  };

  const withEvolutionAchievements = (list: Achievement[], p: Pet): Achievement[] =>
    list.map(a => {
      if (a.id === 'ach_egg_hatch' && p.stage !== 'egg' && !a.unlocked) {
        return { ...a, unlocked: true, progress: 1 };
      }
      if (a.id === 'ach_evolution_adult' && (p.stage === 'adult' || p.stage === 'ultimate') && !a.unlocked) {
        return { ...a, unlocked: true, progress: 1 };
      }
      if (a.id === 'ach_mutation_ultimate' && p.stage === 'ultimate' && !a.unlocked) {
        return { ...a, unlocked: true, progress: 1 };
      }
      return a;
    });

  // --- ACTIONS ---

  // Handle quiz completion
  const handleFinishQuiz = (
    updatedWords: Word[],
    gainedExp: number,
    gainedCoins: number,
    rewardItem?: Item
  ) => {
    // 1. Update words map
    const wordsMap = new Map(words.map(w => [w.id, w]));
    updatedWords.forEach(w => wordsMap.set(w.id, w));
    const newWordsList = Array.from(wordsMap.values());

    // 2. EXP, level-ups, hatching and level-gated evolution
    const growth = applyExpGain(pet, gainedExp);
    announceGrowth(growth);
    const nextStage = growth.pet.stage;
    const newlyUnlockedSpecies = mergeSpecies(unlockedSpecies, growth.unlockedSpecies);

    const updatedPet: Pet = {
      ...growth.pet,
      hunger: Math.min(100, pet.hunger + 35),
      health: 100,
      mood: growth.evolvedStages.length > 0 ? 'ecstatic' : 'happy',
      daysUnreviewed: 0,
      lastActiveAt: new Date().toISOString(),
      wordsLearnedCount: pet.wordsLearnedCount + updatedWords.length,
    };

    // 3. Update profile
    const updatedProfile: UserProfile = {
      ...profile,
      coins: profile.coins + gainedCoins,
      totalReviewsDone: profile.totalReviewsDone + updatedWords.length,
      lastActiveDate: new Date().toISOString().split('T')[0],
    };

    // 4. Update quests
    const updatedQuests = quests.map(q => {
      if (q.id === 'quest_1') {
        const cur = q.current + updatedWords.length;
        return {
          ...q,
          current: cur,
          isCompleted: cur >= q.target,
        };
      }
      return q;
    });

    // 5. Update achievements
    const newlyMastered = newWordsList.filter(w => w.status === 'mastered').length;
    const updatedAch = achievements.map(a => {
      if (a.id === 'ach_words_10') {
        return {
          ...a,
          progress: newlyMastered,
          unlocked: newlyMastered >= 10,
        };
      }
      if (a.id === 'ach_egg_hatch' && nextStage !== 'egg') {
        return {
          ...a,
          progress: 1,
          unlocked: true,
        };
      }
      return a;
    });

    // 6. If reward items given
    let updatedItems = items.map(i => ({ ...i }));
    if (rewardItem) {
      updatedItems = addItem(updatedItems, rewardItem.id, 1, rewardItem);
    }

    // 7. Random evolution stone drops for finishing a solid review session
    const drops: string[] = [];
    if (updatedWords.length >= 5) {
      if (Math.random() < 0.3) drops.push('item_stone_fire');
      if (Math.random() < 0.06) drops.push('item_mutation_core');
    }
    drops.forEach(id => {
      updatedItems = addItem(updatedItems, id, 1);
    });
    if (drops.length > 0) {
      const names = drops.map(id => INITIAL_ITEMS.find(i => i.id === id)?.name || id).join('、');
      showToast(`🎁 複習獎勵掉落：${names}！可到「進化與異色」提前進化`);
    }

    setAppState({
      words: newWordsList,
      pet: updatedPet,
      items: updatedItems,
      quests: updatedQuests,
      achievements: withEvolutionAchievements(updatedAch, updatedPet),
      profile: updatedProfile,
      unlockedSpecies: newlyUnlockedSpecies,
    });

    setIsQuizActive(false);
    setCustomQuizList(null);
  };

  // Handle weak words drill completion
  const handleFinishWeakDrill = (
    clearedWords: Word[],
    gainedExp: number,
    gainedCoins: number
  ) => {
    const wordsMap = new Map(words.map(w => [w.id, w]));
    clearedWords.forEach(w => wordsMap.set(w.id, w));
    const newWordsList = Array.from(wordsMap.values());

    const growth = applyExpGain(pet, gainedExp);
    announceGrowth(growth);
    const updatedPet: Pet = {
      ...growth.pet,
      hunger: Math.min(100, pet.hunger + 25),
      health: 100,
      mood: growth.evolvedStages.length > 0 ? 'ecstatic' : 'happy',
      daysUnreviewed: 0,
    };

    // Update quest 3 (易錯單字狙擊)
    const updatedQuests = quests.map(q => {
      if (q.id === 'quest_3') {
        return { ...q, current: 1, isCompleted: true };
      }
      return q;
    });

    setAppState(prev => ({
      ...prev,
      words: newWordsList,
      pet: updatedPet,
      quests: updatedQuests,
      unlockedSpecies: mergeSpecies(prev.unlockedSpecies, growth.unlockedSpecies),
      achievements: withEvolutionAchievements(prev.achievements, updatedPet),
      profile: {
        ...prev.profile,
        coins: prev.profile.coins + gainedCoins,
      },
    }));

    setIsWeakDrillActive(false);
  };

  // Feed Pet
  const handleFeedItem = (item: Item) => {
    if (item.count <= 0) return;

    soundFx.playFeed();

    const updatedItems = items.map(i =>
      i.id === item.id ? { ...i, count: i.count - 1 } : i
    );

    const hungerBoost = item.effect.hunger || 0;
    const healthBoost = item.effect.health || 0;
    const expBoost = item.effect.exp || 0;

    const growth = applyExpGain(pet, expBoost);
    announceGrowth(growth);
    const updatedPet: Pet = {
      ...growth.pet,
      hunger: Math.min(100, pet.hunger + hungerBoost),
      health: Math.min(100, pet.health + healthBoost),
      mood: 'ecstatic',
    };

    // Update quest 2 (寵物愛心餵養)
    const updatedQuests = quests.map(q => {
      if (q.id === 'quest_2') {
        return { ...q, current: 1, isCompleted: true };
      }
      return q;
    });

    setAppState(prev => ({
      ...prev,
      items: updatedItems,
      pet: updatedPet,
      quests: updatedQuests,
      unlockedSpecies: mergeSpecies(prev.unlockedSpecies, growth.unlockedSpecies),
      achievements: withEvolutionAchievements(prev.achievements, updatedPet),
    }));
  };

  // Handle mutation success
  const handleMutateSuccess = (mutatedPet: Pet, consumedItemId: string) => {
    const updatedItems = items.map(i =>
      i.id === consumedItemId ? { ...i, count: Math.max(0, i.count - 1) } : i
    );

    setAppState(prev => ({
      ...prev,
      pet: mutatedPet,
      items: updatedItems,
      unlockedSpecies: mergeSpecies(prev.unlockedSpecies, [mutatedPet.speciesId]),
      achievements: withEvolutionAchievements(prev.achievements, mutatedPet),
    }));
  };

  // Add Custom Word
  const handleAddWord = (newWord: Word) => {
    setAppState(prev => ({
      ...prev,
      words: [newWord, ...prev.words],
    }));
  };

  // Batch Import Words (批量匯入單字)
  const handleImportWords = (importedWords: Word[]) => {
    setAppState(prev => {
      const existingMap = new Map(allWordsRef.current.map(w => [w.word.toLowerCase(), w]));
      prev.words.forEach(w => existingMap.set(w.word.toLowerCase(), w));
      const newItems: Word[] = [];
      let words = prev.words;
      importedWords.forEach(w => {
        const key = w.word.toLowerCase();
        const existing = existingMap.get(key);
        if (!existing) {
          existingMap.set(key, w);
          newItems.push(w);
        } else if (!isInCategory(existing, w.category)) {
          const linked = { ...existing, ...addCategoryPatch(existing, w.category) };
          existingMap.set(key, linked);
          words = upsertWord(words, existing.id, () => linked);
        }
      });
      return {
        ...prev,
        words: [...newItems, ...words],
      };
    });
  };

  // Update Existing Word (修改單字內容)
  const upsertWord = (list: Word[], wordId: string, update: (w: Word) => Word): Word[] => {
    if (list.some(w => w.id === wordId)) {
      return list.map(w => (w.id === wordId ? update(w) : w));
    }
    const fromBank = allWordsRef.current.find(w => w.id === wordId);
    return fromBank ? [...list, update(fromBank)] : list;
  };

  const handleUpdateWord = (updatedWord: Word) => {
    setAppState(prev => ({
      ...prev,
      words: upsertWord(prev.words, updatedWord.id, () => updatedWord),
    }));
  };

  const handlePatchWord = (wordId: string, patch: Partial<Word>) => {
    setAppState(prev => ({
      ...prev,
      words: upsertWord(prev.words, wordId, w => ({ ...w, ...patch })),
    }));
  };

  // Delete Word (刪除單字)
  const handleDeleteWord = (wordId: string) => {
    setAppState(prev => ({
      ...prev,
      words: prev.words.filter(w => w.id !== wordId),
    }));
  };

  // Toggle Weak status for word
  const handleToggleWeak = (wordId: string) => {
    setAppState(prev => ({
      ...prev,
      words: upsertWord(prev.words, wordId, w => ({ ...w, isWeak: !w.isWeak })),
    }));
  };

  // Start specific quiz from library
  const handleStartSpecificQuiz = (selectedList: Word[]) => {
    setCustomQuizList(selectedList.slice(0, currentBatchSize > 0 ? currentBatchSize : 50));
    setIsQuizActive(true);
  };

  // Claim quest reward
  const handleClaimQuest = (questId: string) => {
    const targetQuest = quests.find(q => q.id === questId);
    if (!targetQuest || targetQuest.isClaimed || !targetQuest.isCompleted) return;

    let nextCoins = profile.coins;
    let nextPet = pet;
    let newSpecies: string[] = [];
    let updatedItems = [...items];

    if (targetQuest.rewardType === 'coins') {
      nextCoins += targetQuest.rewardAmount;
    } else if (targetQuest.rewardType === 'exp') {
      const growth = applyExpGain(pet, targetQuest.rewardAmount);
      announceGrowth(growth);
      nextPet = growth.pet;
      newSpecies = growth.unlockedSpecies;
    } else if (targetQuest.rewardType === 'item' && targetQuest.rewardItemId) {
      updatedItems = addItem(updatedItems, targetQuest.rewardItemId, targetQuest.rewardAmount);
    }

    setAppState(prev => ({
      ...prev,
      quests: prev.quests.map(q =>
        q.id === questId ? { ...q, isClaimed: true } : q
      ),
      profile: { ...prev.profile, coins: nextCoins },
      pet: nextPet,
      items: updatedItems,
      unlockedSpecies: mergeSpecies(prev.unlockedSpecies, newSpecies),
      achievements: withEvolutionAchievements(prev.achievements, nextPet),
    }));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white pb-24 md:pb-10 overflow-x-hidden">
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        profile={profile}
        onUpdateProfile={p => setAppState(prev => ({ ...prev, profile: p }))}
        onOpenBestiary={() => setShowBestiary(true)}
        onOpenInventory={() => setShowInventory(true)}
        onOpenAchievements={() => setShowAchievements(true)}
        onOpenSync={() => setShowSync(true)}
        dueWordsCount={dueWords.length}
      />

      {/* Main App Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-2.5 sm:px-6 py-2.5 sm:py-6">
        {/* TAB 1: HOME & ADVENTURE DASHBOARD */}
        {currentTab === 'home' && (
          <div className="space-y-4 sm:space-y-6">
            {/* Active Quiz Overlay if started */}
            {isQuizActive ? (
              <QuizSection
                dueWords={customQuizList || dueWords}
                allWords={allWords}
                pet={pet}
                onFinishQuiz={handleFinishQuiz}
                onClose={() => {
                  setIsQuizActive(false);
                  setCustomQuizList(null);
                }}
                voiceGender={profile.voiceGender}
                voiceSpeed={profile.voiceSpeed}
              />
            ) : isWeakDrillActive ? (
              <WeakWordsDrill
                weakWords={weakWords}
                allWords={words}
                pet={pet}
                onFinishDrill={handleFinishWeakDrill}
                onClose={() => setIsWeakDrillActive(false)}
                voiceGender={profile.voiceGender}
                voiceSpeed={profile.voiceSpeed}
              />
            ) : (
              /* Regular Home View */
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left Column: Pet Showcase Card (5 cols) */}
                <div className="lg:col-span-5">
                  <PetCard
                    pet={pet}
                    items={items}
                    onFeedItem={handleFeedItem}
                    onUpdatePet={p => setAppState(prev => ({ ...prev, pet: p }))}
                    onOpenMutation={() => setShowMutation(true)}
                    onOpenShare={() => setShowShare(true)}
                    onOpenCustomizer={() => setShowCustomizer(true)}
                    onStartReview={() => setIsQuizActive(true)}
                    onOpenBestiary={() => setShowBestiary(true)}
                  />
                </div>

                {/* Right Column: Spaced Repetition Review Mission Center (7 cols) */}
                <div className="lg:col-span-7 space-y-5">
                  {/* Hero Review Start Card */}
                  <div className="rounded-2xl sm:rounded-3xl border border-slate-800 bg-slate-900/80 p-4 sm:p-6 shadow-xl">
                    <div>
                      <p className="text-xs font-semibold text-indigo-300">今日複習</p>

                      <h2 className="mt-1 text-xl sm:text-2xl font-bold font-fun text-white tracking-wide">
                        {homeQuizCategory === 'all'
                          ? (dueWords.length > 0
                              ? `有 ${dueWords.length} 個單字該複習了`
                              : '今日複習已完成')
                          : `${selectedCategoryObj.shortLabel}・${homeCategoryWords.length} 字`}
                      </h2>

                      <p className="mt-1.5 text-sm text-slate-400">
                        {pet.stage === 'egg'
                          ? '完成測驗累積經驗，升到 Lv.2 就能孵化寵物。'
                          : '複習能讓寵物獲得經驗與飽食度。'}
                      </p>

                      <div className="mt-3 flex items-center gap-3 text-xs text-slate-400">
                        <span>
                          待複習 <b className="text-white">{homeQuizCategory === 'all' ? dueWords.length : homeCategoryDueWords.length}</b>
                        </span>
                        <span className="h-3 w-px bg-slate-700" />
                        <span>
                          新字 <b className="text-white">{homeCategoryNewCount}</b>
                        </span>
                        <span className="h-3 w-px bg-slate-700" />
                        <span>
                          題庫 <b className="text-white">{homeCategoryWords.length}</b>
                        </span>
                      </div>

                      {/* Quiz settings: category + batch size */}
                      <div className="mt-4 rounded-2xl bg-slate-950/50 border border-slate-800/80 p-3 space-y-2.5">
                      <div className="flex items-center gap-3">
                        <span className="w-8 shrink-0 text-xs font-semibold text-slate-500">題庫</span>
                        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                          {HOME_QUIZ_CATEGORIES.map(cat => {
                            const isSelected = homeQuizCategory === cat.id;
                            const count = cat.id === 'all' ? allWords.length : categoryCounts[cat.id] || 0;
                            return (
                              <button
                                key={cat.id}
                                type="button"
                                onClick={() => setHomeQuizCategory(cat.id)}
                                title={`${cat.shortLabel}（${count} 字）`}
                                className={`shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                                  isSelected
                                    ? 'bg-indigo-600 text-white'
                                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                                }`}
                              >
                                <span>{cat.label}</span>
                                <span className={`text-[10px] font-normal ${isSelected ? 'text-indigo-200' : 'text-slate-600'}`}>
                                  {count}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="w-8 shrink-0 text-xs font-semibold text-slate-500">題量</span>
                        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                          {BATCH_SIZE_OPTIONS.map(opt => {
                            const isSelected = (profile.quizBatchSize ?? 20) === opt.value;
                            return (
                              <button
                                key={opt.value}
                                type="button"
                                onClick={() => {
                                  soundFx.playTap();
                                  setAppState(prev => ({
                                    ...prev,
                                    profile: { ...prev.profile, quizBatchSize: opt.value }
                                  }));
                                }}
                                className={`shrink-0 min-w-[2.5rem] px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                                  isSelected
                                    ? 'bg-indigo-600 text-white'
                                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                                }`}
                              >
                                {opt.label}
                              </button>
                            );
                          })}
                          <span className="shrink-0 pl-1 text-xs text-slate-600">題 / 次</span>
                        </div>
                      </div>
                      </div>

                      {/* Main Action Buttons */}
                      <div className="mt-5 flex flex-col sm:flex-row sm:items-center gap-2.5">
                        <button
                          disabled={currentQuizList.length === 0}
                          onClick={() => {
                            setCustomQuizList(currentQuizList);
                            setIsQuizActive(true);
                          }}
                          className={`flex items-center justify-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-bold text-white transition-all active:scale-95 cursor-pointer ${
                            currentQuizList.length === 0
                              ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                              : 'bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/25'
                          }`}
                        >
                          <Play className="h-4 w-4 fill-white" />
                          {pet.stage === 'egg'
                            ? `開始測驗・孵化寵物（${currentQuizList.length} 題）`
                            : `開始測驗（${currentQuizList.length} 題）`}
                        </button>

                        {weakWords.length > 0 && (
                          <button
                            onClick={() => setIsWeakDrillActive(true)}
                            className="flex items-center justify-center gap-2 rounded-2xl border border-slate-700 hover:border-slate-600 hover:bg-slate-800/60 px-5 py-3.5 text-sm font-semibold text-slate-300 transition-all active:scale-95 cursor-pointer"
                          >
                            <Flame className="h-4 w-4 text-rose-400" />
                            弱點特訓（{weakWords.length} 字）
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Daily Quests Quick Dashboard */}
                  <div className="rounded-2xl sm:rounded-3xl border border-slate-800 bg-slate-900/80 p-4 sm:p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Award className="h-4 w-4 text-slate-400" />
                        <h3 className="text-sm font-bold text-white">今日任務</h3>
                      </div>
                      <button
                        onClick={() => setShowAchievements(true)}
                        className="text-xs text-slate-400 hover:text-white font-semibold cursor-pointer"
                      >
                        全部任務 →
                      </button>
                    </div>

                    <div className="space-y-2">
                      {quests.slice(0, 2).map(q => (
                        <div
                          key={q.id}
                          className="rounded-xl bg-slate-950/50 px-3 py-2.5 flex items-center gap-3"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-xs font-semibold text-white truncate" title={q.desc}>{q.title}</p>
                              <span className="text-[11px] text-slate-500 shrink-0">
                                {Math.min(q.current, q.target)}/{q.target}
                              </span>
                            </div>
                            <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                              <div
                                className={`h-full rounded-full ${q.isCompleted ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                                style={{ width: `${Math.min(100, (q.current / Math.max(1, q.target)) * 100)}%` }}
                              />
                            </div>
                          </div>
                          <div className="shrink-0 w-12 text-right">
                            {q.isClaimed ? (
                              <span className="text-[11px] text-slate-500">已領取</span>
                            ) : q.isCompleted ? (
                              <button
                                onClick={() => handleClaimQuest(q.id)}
                                className="rounded-lg bg-amber-500 hover:bg-amber-400 px-2.5 py-1 text-[11px] font-bold text-slate-950 cursor-pointer"
                              >
                                領取
                              </button>
                            ) : (
                              <span className="text-[11px] text-slate-500">進行中</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Vocabulary Status Quick Summary */}
                  <div className="grid grid-cols-3 rounded-2xl border border-slate-800 bg-slate-900/60 divide-x divide-slate-800">
                    <div className="p-3 text-center">
                      <p className="text-xl font-bold font-fun text-white">{words.length}</p>
                      <p className="text-[11px] text-slate-400">學習中</p>
                    </div>
                    <div className="p-3 text-center">
                      <p className="text-xl font-bold font-fun text-white">{masteredWords.length}</p>
                      <p className="text-[11px] text-slate-400">已精通</p>
                    </div>
                    <div className="p-3 text-center">
                      <p className="text-xl font-bold font-fun text-white">{weakWords.length}</p>
                      <p className="text-[11px] text-slate-400">易錯字</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: VOCABULARY LIBRARY & CUSTOM WORDS */}
        {currentTab === 'library' && (
          <WordLibrary
            words={allWords}
            progressIds={progressIds}
            onAddWord={handleAddWord}
            onImportWords={handleImportWords}
            onUpdateWord={handleUpdateWord}
            onPatchWord={handlePatchWord}
            onDeleteWord={handleDeleteWord}
            onToggleWeak={handleToggleWeak}
            onStartSpecificQuiz={handleStartSpecificQuiz}
            voiceGender={profile.voiceGender}
            voiceSpeed={profile.voiceSpeed}
          />
        )}

        {/* TAB 3: EBBINGHAUS RETENTION STATS */}
        {currentTab === 'stats' && (
          <StatsView words={words} profile={profile} />
        )}

        {/* TAB 4: LEADERBOARD & SOCIAL COMPETITION */}
        {currentTab === 'leaderboard' && (
          <LeaderboardView
            pet={pet}
            profile={profile}
            masteredWordsCount={masteredWords.length}
          />
        )}
      </main>

      {/* POPUP MODALS */}
      {celebration && (
        <EvolutionCelebrationModal
          pet={celebration.pet}
          hatched={celebration.hatched}
          onClose={() => setCelebration(null)}
        />
      )}

      {toast && (
        <div className="fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 z-[60] max-w-[92vw] rounded-2xl bg-slate-900/95 border border-amber-500/40 px-4 py-3 text-sm font-bold text-amber-200 shadow-2xl animate-in fade-in duration-200">
          {toast}
        </div>
      )}

      <MutationModal
        pet={pet}
        items={items}
        isOpen={showMutation}
        onClose={() => setShowMutation(false)}
        onMutateSuccess={handleMutateSuccess}
      />

      <PetCustomizerModal
        pet={pet}
        isOpen={showCustomizer}
        onClose={() => setShowCustomizer(false)}
        onSave={updated => setAppState(prev => ({ ...prev, pet: updated }))}
      />

      <PetShareModal
        pet={pet}
        profile={profile}
        isOpen={showShare}
        onClose={() => setShowShare(false)}
      />

      <BestiaryModal
        unlockedSpecies={unlockedSpecies}
        isOpen={showBestiary}
        onClose={() => setShowBestiary(false)}
        currentPetId={pet.speciesId}
        onResetToEgg={() => {
          setAppState(prev => ({
            ...prev,
            pet: {
              ...INITIAL_PET,
              id: `pet_${Date.now()}`,
              daysUnreviewed: 0,
              lastFedAt: new Date().toISOString(),
              lastActiveAt: new Date().toISOString(),
            },
          }));
          setShowBestiary(false);
        }}
        onSelectPet={selectedPet => {
          setAppState(prev => ({
            ...prev,
            pet: {
              ...selectedPet,
              id: `pet_${Date.now()}`,
              daysUnreviewed: 0,
              lastFedAt: new Date().toISOString(),
              lastActiveAt: new Date().toISOString(),
            },
            unlockedSpecies: Array.from(new Set([...prev.unlockedSpecies, selectedPet.speciesId])),
          }));
          setShowBestiary(false);
        }}
      />

      <InventoryModal
        items={items}
        pet={pet}
        profile={profile}
        isOpen={showInventory}
        onClose={() => setShowInventory(false)}
        onUseItem={handleFeedItem}
      />

      <AchievementsModal
        quests={quests}
        achievements={achievements}
        isOpen={showAchievements}
        onClose={() => setShowAchievements(false)}
        onClaimQuest={handleClaimQuest}
        onClaimAchievement={() => {}}
      />

      <SyncModal
        appState={appState}
        isOpen={showSync}
        onClose={() => setShowSync(false)}
        onRestoreState={restored => setAppState(restored)}
        onUpdateProfile={p => setAppState(prev => ({ ...prev, profile: p }))}
      />
    </div>
  );
}

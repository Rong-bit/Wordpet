import React, { useState, useEffect } from 'react';
import { Word, Pet, Item, DailyQuest, Achievement, UserProfile } from './types';
import { loadAppState, saveAppState, AppState } from './utils/storage';
import { INITIAL_PET } from './data/bestiary';
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

  // Audio settings sync
  useEffect(() => {
    soundFx.setEnabled(profile.soundEnabled);
  }, [profile.soundEnabled]);

  // Calculate due words & weak words
  const now = new Date().getTime();
  const dueWords = words.filter(w => new Date(w.nextReviewAt).getTime() <= now);
  const weakWords = words.filter(w => w.isWeak);
  const masteredWords = words.filter(w => w.status === 'mastered');

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

    // 2. Pet Level & EXP calculation + Hatching logic!
    let nextExp = pet.exp + gainedExp;
    let nextLevel = pet.level;
    let nextMaxExp = pet.maxExp;
    let nextStage = pet.stage;
    let nextSpeciesId = pet.speciesId;
    let nextName = pet.name;
    let nextTitle = pet.title;

    while (nextExp >= nextMaxExp) {
      nextExp -= nextMaxExp;
      nextLevel += 1;
      nextMaxExp = Math.round(nextMaxExp * 1.3);
      soundFx.playLevelUp();
    }

    // Auto egg hatching check when pet reaches Lv.2+
    let newlyUnlockedSpecies = [...unlockedSpecies];
    if (pet.stage === 'egg' && nextLevel >= 2) {
      nextStage = 'baby';
      nextSpeciesId = 'p_fire_dragon_1';
      nextName = '熾焰火蜥幼體';
      nextTitle = '破殼晨光幼龍';
      soundFx.playHatch();
      confetti({ particleCount: 150, spread: 90, origin: { y: 0.5 } });
      if (!newlyUnlockedSpecies.includes('p_fire_dragon_1')) {
        newlyUnlockedSpecies.push('p_fire_dragon_1');
      }
    }

    // Restore pet health and hunger on completing review
    const updatedPet: Pet = {
      ...pet,
      level: nextLevel,
      exp: nextExp,
      maxExp: nextMaxExp,
      stage: nextStage,
      speciesId: nextSpeciesId,
      name: nextName,
      title: nextTitle,
      hunger: Math.min(100, pet.hunger + 35),
      health: 100,
      mood: 'happy',
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
    let updatedItems = [...items];
    if (rewardItem) {
      const match = updatedItems.find(i => i.id === rewardItem.id);
      if (match) {
        match.count += 1;
      } else {
        updatedItems.push(rewardItem);
      }
    }

    setAppState({
      words: newWordsList,
      pet: updatedPet,
      items: updatedItems,
      quests: updatedQuests,
      achievements: updatedAch,
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

    const updatedPet: Pet = {
      ...pet,
      exp: pet.exp + gainedExp,
      hunger: Math.min(100, pet.hunger + 25),
      health: 100,
      mood: 'happy',
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

    let nextExp = pet.exp + expBoost;
    let nextLevel = pet.level;
    let nextMaxExp = pet.maxExp;
    while (nextExp >= nextMaxExp) {
      nextExp -= nextMaxExp;
      nextLevel += 1;
      nextMaxExp = Math.round(nextMaxExp * 1.3);
      soundFx.playLevelUp();
    }

    const updatedPet: Pet = {
      ...pet,
      hunger: Math.min(100, pet.hunger + hungerBoost),
      health: Math.min(100, pet.health + healthBoost),
      exp: nextExp,
      level: nextLevel,
      maxExp: nextMaxExp,
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
    }));
  };

  // Handle mutation success
  const handleMutateSuccess = (mutatedPet: Pet, consumedItemId: string) => {
    const updatedItems = items.map(i =>
      i.id === consumedItemId ? { ...i, count: Math.max(0, i.count - 1) } : i
    );

    const newUnlocked = [...unlockedSpecies];
    if (!newUnlocked.includes(mutatedPet.speciesId)) {
      newUnlocked.push(mutatedPet.speciesId);
    }

    // Check achievement for mutation
    const updatedAch = achievements.map(a => {
      if (a.id === 'ach_mutation_ultimate' && mutatedPet.stage === 'ultimate') {
        return { ...a, unlocked: true, progress: 1 };
      }
      if (a.id === 'ach_evolution_adult' && (mutatedPet.stage === 'adult' || mutatedPet.stage === 'ultimate')) {
        return { ...a, unlocked: true, progress: 1 };
      }
      return a;
    });

    setAppState(prev => ({
      ...prev,
      pet: mutatedPet,
      items: updatedItems,
      unlockedSpecies: newUnlocked,
      achievements: updatedAch,
    }));
  };

  // Add Custom Word
  const handleAddWord = (newWord: Word) => {
    setAppState(prev => ({
      ...prev,
      words: [newWord, ...prev.words],
    }));
  };

  // Toggle Weak status for word
  const handleToggleWeak = (wordId: string) => {
    setAppState(prev => ({
      ...prev,
      words: prev.words.map(w =>
        w.id === wordId ? { ...w, isWeak: !w.isWeak } : w
      ),
    }));
  };

  // Start specific quiz from library
  const handleStartSpecificQuiz = (selectedList: Word[]) => {
    setCustomQuizList(selectedList);
    setIsQuizActive(true);
  };

  // Claim quest reward
  const handleClaimQuest = (questId: string) => {
    const targetQuest = quests.find(q => q.id === questId);
    if (!targetQuest || targetQuest.isClaimed || !targetQuest.isCompleted) return;

    let nextCoins = profile.coins;
    let nextPetExp = pet.exp;
    let updatedItems = [...items];

    if (targetQuest.rewardType === 'coins') {
      nextCoins += targetQuest.rewardAmount;
    } else if (targetQuest.rewardType === 'exp') {
      nextPetExp += targetQuest.rewardAmount;
    } else if (targetQuest.rewardType === 'item' && targetQuest.rewardItemId) {
      updatedItems = updatedItems.map(i =>
        i.id === targetQuest.rewardItemId ? { ...i, count: i.count + targetQuest.rewardAmount } : i
      );
    }

    setAppState(prev => ({
      ...prev,
      quests: prev.quests.map(q =>
        q.id === questId ? { ...q, isClaimed: true } : q
      ),
      profile: { ...prev.profile, coins: nextCoins },
      pet: { ...prev.pet, exp: nextPetExp },
      items: updatedItems,
    }));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white pb-20 md:pb-10">
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
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {/* TAB 1: HOME & ADVENTURE DASHBOARD */}
        {currentTab === 'home' && (
          <div className="space-y-6">
            {/* Active Quiz Overlay if started */}
            {isQuizActive ? (
              <QuizSection
                dueWords={customQuizList || dueWords}
                allWords={words}
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
                  <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-indigo-950/60 via-slate-900/90 to-purple-950/60 p-6 sm:p-7 shadow-2xl backdrop-blur-xl">
                    <div className="relative z-10">
                      <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-bold text-indigo-300 border border-indigo-500/30 mb-3">
                        <Zap className="h-3.5 w-3.5 text-amber-400" />
                        艾賓豪斯智慧間隔複習 (SRS)
                      </div>

                      <h2 className="text-2xl sm:text-3xl font-bold font-fun text-white tracking-wide">
                        {dueWords.length > 0
                          ? `今日有 ${dueWords.length} 個單字已達最佳複習時機！`
                          : '太棒了！今日待複習單字已全部清空！'}
                      </h2>

                      <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
                        {pet.stage === 'egg'
                          ? '你的【星紋起源蛋】正在汲取知識養分！每次完成測驗裂痕都會加深，達到 Lv.2 即可破殼孵化專屬神獸！'
                          : '及時複習能強化神經突觸記憶，並為神獸提供豐厚飽食與經驗！若放任一天不複習，寵物會逐漸虛弱喔！'}
                      </p>

                      {/* Main Action Buttons */}
                      <div className="mt-6 flex flex-wrap items-center gap-3">
                        <button
                          onClick={() => {
                            setCustomQuizList(null);
                            setIsQuizActive(true);
                          }}
                          className="flex items-center gap-2 rounded-2xl bg-indigo-600 hover:bg-indigo-500 px-6 py-3.5 text-sm font-bold text-white transition-all shadow-lg shadow-indigo-600/30 active:scale-95 cursor-pointer"
                        >
                          <Play className="h-4 w-4 fill-white" />
                          {pet.stage === 'egg'
                            ? `🥚 開始測驗・破殼孵化 (${dueWords.length > 0 ? `${dueWords.length} 題` : '5 題'})`
                            : `開始智慧測驗 (${dueWords.length > 0 ? `${dueWords.length} 題` : '自由複習'})`}
                        </button>

                        {weakWords.length > 0 && (
                          <button
                            onClick={() => setIsWeakDrillActive(true)}
                            className="flex items-center gap-2 rounded-2xl bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/40 px-5 py-3.5 text-sm font-bold text-rose-300 transition-all active:scale-95"
                          >
                            <Flame className="h-4 w-4 text-rose-400 animate-pulse" />
                            弱點加強特訓 ({weakWords.length} 字)
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Daily Quests Quick Dashboard */}
                  <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl backdrop-blur-xl">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Award className="h-4 w-4 text-amber-400" />
                        <h3 className="text-sm font-bold text-white font-fun">
                          今日學習目標與成就進度
                        </h3>
                      </div>
                      <button
                        onClick={() => setShowAchievements(true)}
                        className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
                      >
                        查看全部 →
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {quests.slice(0, 2).map(q => (
                        <div
                          key={q.id}
                          className="rounded-2xl border border-slate-800/80 bg-slate-950/60 p-3 flex items-center justify-between"
                        >
                          <div>
                            <p className="text-xs font-bold text-white">{q.title}</p>
                            <p className="text-[11px] text-slate-400">{q.desc}</p>
                            <span className="text-[10px] text-indigo-400 font-mono mt-1 block">
                              進度: {q.current}/{q.target}
                            </span>
                          </div>
                          <div>
                            {q.isClaimed ? (
                              <span className="text-[10px] text-slate-500 font-bold">已領取</span>
                            ) : q.isCompleted ? (
                              <button
                                onClick={() => handleClaimQuest(q.id)}
                                className="rounded-xl bg-amber-500 hover:bg-amber-400 px-2.5 py-1 text-[11px] font-bold text-slate-950"
                              >
                                領取
                              </button>
                            ) : (
                              <span className="text-[10px] text-slate-500">進行中</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Vocabulary Status Quick Summary */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-3.5 text-center">
                      <p className="text-[11px] text-slate-400">總單字量</p>
                      <p className="text-xl font-bold font-fun text-white">{words.length}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-3.5 text-center">
                      <p className="text-[11px] text-emerald-400">已精通長期記憶</p>
                      <p className="text-xl font-bold font-fun text-emerald-400">{masteredWords.length}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-3.5 text-center">
                      <p className="text-[11px] text-rose-400">不熟易錯字</p>
                      <p className="text-xl font-bold font-fun text-rose-400">{weakWords.length}</p>
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
            words={words}
            onAddWord={handleAddWord}
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
        onUnlockAllSpecies={() => {
          setAppState(prev => ({
            ...prev,
            unlockedSpecies: [
              'p_egg_genesis',
              'p_fire_dragon_1',
              'p_fire_dragon_2',
              'p_fire_ultimate',
              'p_frost_fox_1',
              'p_frost_ultimate',
              'p_nature_deer_1',
              'p_nature_ultimate',
              'p_thunder_falcon_1',
              'p_void_shadow_1',
              'p_radiant_angel_1',
              'p_cyber_mecha_ultimate',
            ],
          }));
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

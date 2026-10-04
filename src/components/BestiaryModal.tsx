import React, { useState } from 'react';
import { BestiaryEntry, PetRarity, Pet } from '../types';
import { BESTIARY_DATA } from '../data/bestiary';
import { PetCanvas } from './PetCanvas';
import { soundFx } from '../utils/sound';
import confetti from 'canvas-confetti';
import {
  X,
  BookOpen,
  Lock,
  Sparkles,
  Trophy,
  Crown,
  Flame,
  Snowflake,
  Trees,
  Zap,
  Sun,
  Moon,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

interface BestiaryModalProps {
  unlockedSpecies: string[];
  isOpen: boolean;
  onClose: () => void;
}

interface UltimatePetGalleryItem extends Pet {
  talent: string;
  talentDesc: string;
  elementIcon: React.ReactNode;
  lore: string;
}

const ULTIMATE_PETS_GALLERY: UltimatePetGalleryItem[] = [
  {
    id: 'ultimate_flame_dragon',
    name: '恆星日珥神龍 (終極變異)',
    title: '日珥天體霸主',
    element: 'flame',
    stage: 'ultimate',
    rarity: 'legendary',
    level: 50,
    exp: 9999,
    maxExp: 10000,
    mood: 'ecstatic',
    hunger: 100,
    health: 100,
    cleanliness: 100,
    personality: '狂熱霸氣',
    stats: { intelligence: 98, endurance: 95, speed: 99 },
    genes: {
      element: 'flame',
      pattern: 'runic',
      horns: 'dragon',
      wings: 'dragon',
      particle: 'fire',
      primaryColor: '#EF4444',
      secondaryColor: '#B45309',
      glowColor: '#FBBF24',
    },
    customization: {
      hat: 'crown',
      accessory: 'cape',
      backgroundTheme: 'volcano',
    },
    speciesId: 'p_fire_ultimate',
    daysUnreviewed: 0,
    lastFedAt: new Date().toISOString(),
    lastActiveAt: new Date().toISOString(),
    hatchedAt: new Date().toISOString(),
    wordsLearnedCount: 1500,
    evolutionPower: 999,
    specialTrait: '過目不忘：經驗與金幣永久提升 +25%',
    talent: '【過目不忘】',
    talentDesc: '背誦單字獲得的經驗值與金幣永久提升 +25%！',
    lore: '歷經極限連勝考驗所誕生的終極烈焰神龍，羽翼如天體日珥般熾熱，周圍環繞著燃燒星軌。',
    elementIcon: <Flame className="h-4 w-4 text-orange-400" />,
  },
  {
    id: 'ultimate_frost_fox',
    name: '極光永凍九尾天狐 (終極變異)',
    title: '極光守護仙靈',
    element: 'frost',
    stage: 'ultimate',
    rarity: 'legendary',
    level: 50,
    exp: 9999,
    maxExp: 10000,
    mood: 'ecstatic',
    hunger: 100,
    health: 100,
    cleanliness: 100,
    personality: '冰雪冷靜',
    stats: { intelligence: 100, endurance: 96, speed: 94 },
    genes: {
      element: 'frost',
      pattern: 'aurora',
      horns: 'crystal',
      wings: 'fairy',
      particle: 'snowflakes',
      primaryColor: '#38BDF8',
      secondaryColor: '#0284C7',
      glowColor: '#BAE6FD',
    },
    customization: {
      hat: 'none',
      accessory: 'none',
      backgroundTheme: 'cosmic',
    },
    speciesId: 'p_frost_ultimate',
    daysUnreviewed: 0,
    lastFedAt: new Date().toISOString(),
    lastActiveAt: new Date().toISOString(),
    hatchedAt: new Date().toISOString(),
    wordsLearnedCount: 1500,
    evolutionPower: 999,
    specialTrait: '記憶凝凍：每日自動提供連續打卡保護盾',
    talent: '【記憶凝凍】',
    talentDesc: '每日自動提供記憶保護盾，忘記複習也不會中斷打卡連勝！',
    lore: '吸收北極光靈氣昇華的至高神狐，九道冰晶尾羽能凍結遺忘時間，守護學習者的連續記憶。',
    elementIcon: <Snowflake className="h-4 w-4 text-cyan-400" />,
  },
  {
    id: 'ultimate_nature_stag',
    name: '世界之樹守護神鹿 (傳說終極)',
    title: '知識泉源守護聖獸',
    element: 'nature',
    stage: 'ultimate',
    rarity: 'mythic',
    level: 50,
    exp: 9999,
    maxExp: 10000,
    mood: 'ecstatic',
    hunger: 100,
    health: 100,
    cleanliness: 100,
    personality: '溫和博學',
    stats: { intelligence: 97, endurance: 100, speed: 92 },
    genes: {
      element: 'nature',
      pattern: 'striped',
      horns: 'crystal',
      wings: 'fairy',
      particle: 'sparkles',
      primaryColor: '#10B981',
      secondaryColor: '#047857',
      glowColor: '#6EE7B7',
    },
    customization: {
      hat: 'none',
      accessory: 'none',
      backgroundTheme: 'forest',
    },
    speciesId: 'p_nature_ultimate',
    daysUnreviewed: 0,
    lastFedAt: new Date().toISOString(),
    lastActiveAt: new Date().toISOString(),
    hatchedAt: new Date().toISOString(),
    wordsLearnedCount: 1500,
    evolutionPower: 999,
    specialTrait: '生生不息：30% 機率爆擊獲得雙倍結晶與飼料',
    talent: '【生生不息】',
    talentDesc: '複習單字時有 30% 機率爆擊獲得雙倍靈魂結晶與飼料！',
    lore: '頭頂翡翠世界之樹神角，蘊含著龐大生機與知識之泉，能散發治癒心靈的溫暖綠芒。',
    elementIcon: <Trees className="h-4 w-4 text-emerald-400" />,
  },
  {
    id: 'ultimate_thunder_falcon',
    name: '宙斯雷霆天鷹 (傳奇完全體)',
    title: '風暴神域統御者',
    element: 'thunder',
    stage: 'ultimate',
    rarity: 'legendary',
    level: 50,
    exp: 9999,
    maxExp: 10000,
    mood: 'ecstatic',
    hunger: 100,
    health: 100,
    cleanliness: 100,
    personality: '迅捷敏銳',
    stats: { intelligence: 95, endurance: 93, speed: 100 },
    genes: {
      element: 'thunder',
      pattern: 'neon',
      horns: 'cyber_antennae',
      wings: 'mecha',
      particle: 'lightning',
      primaryColor: '#F59E0B',
      secondaryColor: '#D97706',
      glowColor: '#FEF08A',
    },
    customization: {
      hat: 'sunglasses',
      accessory: 'star_badge',
      backgroundTheme: 'cyberpunk',
    },
    speciesId: 'p_thunder_falcon_1',
    daysUnreviewed: 0,
    lastFedAt: new Date().toISOString(),
    lastActiveAt: new Date().toISOString(),
    hatchedAt: new Date().toISOString(),
    wordsLearnedCount: 1500,
    evolutionPower: 999,
    specialTrait: '雷霆直覺：急速測驗倒數時間額外延長 5 秒',
    talent: '【雷霆直覺】',
    talentDesc: '急速測驗與盲聽測驗時答題倒數時間額外增加 5 秒！',
    lore: '金黃色機甲雷霆羽翼劃破天際，思維如閃電直擊目標，專門克服難解的生僻字詞。',
    elementIcon: <Zap className="h-4 w-4 text-amber-400" />,
  },
  {
    id: 'ultimate_radiant_unicorn',
    name: '輝光聖翼獨角獸 (神話終極)',
    title: '晨曦破曉救贖者',
    element: 'radiant',
    stage: 'ultimate',
    rarity: 'mythic',
    level: 50,
    exp: 9999,
    maxExp: 10000,
    mood: 'ecstatic',
    hunger: 100,
    health: 100,
    cleanliness: 100,
    personality: '純潔聖善',
    stats: { intelligence: 100, endurance: 98, speed: 98 },
    genes: {
      element: 'radiant',
      pattern: 'aurora',
      horns: 'angel_halo',
      wings: 'fairy',
      particle: 'stardust',
      primaryColor: '#F472B6',
      secondaryColor: '#DB2777',
      glowColor: '#FBCFE8',
    },
    customization: {
      hat: 'none',
      accessory: 'none',
      backgroundTheme: 'heaven',
    },
    speciesId: 'p_radiant_angel_1',
    daysUnreviewed: 0,
    lastFedAt: new Date().toISOString(),
    lastActiveAt: new Date().toISOString(),
    hatchedAt: new Date().toISOString(),
    wordsLearnedCount: 1500,
    evolutionPower: 999,
    specialTrait: '晨曦淨化：每日免費消除 5 個生疏詞錯誤紀錄',
    talent: '【晨曦淨化】',
    talentDesc: '每日可免費淨化並消除 5 個生疏頑固單字的錯誤紀錄！',
    lore: '只會在堅持連續學習的勇者身邊顯現，額前聖角與純白羽翼散發破曉晨光，驅散一切遺忘迷霧。',
    elementIcon: <Sun className="h-4 w-4 text-rose-400" />,
  },
  {
    id: 'ultimate_void_cat',
    name: '虛空暗夜噬魂貓 (史詩終極)',
    title: '深淵星夜領主',
    element: 'void',
    stage: 'ultimate',
    rarity: 'epic',
    level: 50,
    exp: 9999,
    maxExp: 10000,
    mood: 'ecstatic',
    hunger: 100,
    health: 100,
    cleanliness: 100,
    personality: '傲嬌幽秘',
    stats: { intelligence: 99, endurance: 96, speed: 99 },
    genes: {
      element: 'void',
      pattern: 'galaxy',
      horns: 'dragon',
      wings: 'dragon',
      particle: 'sparkles',
      primaryColor: '#A855F7',
      secondaryColor: '#581C87',
      glowColor: '#E9D5FF',
    },
    customization: {
      hat: 'crown',
      accessory: 'cape',
      backgroundTheme: 'cosmic',
    },
    speciesId: 'p_void_shadow_1',
    daysUnreviewed: 0,
    lastFedAt: new Date().toISOString(),
    lastActiveAt: new Date().toISOString(),
    hatchedAt: new Date().toISOString(),
    wordsLearnedCount: 1500,
    evolutionPower: 999,
    specialTrait: '暗夜吞噬：夜間複習金幣雙倍，自動標記盲點',
    talent: '【暗夜吞噬】',
    talentDesc: '夜晚複習時所有金幣獎勵翻倍，並自動標記高頻易混淆字！',
    lore: '誕生於夜深人靜專注時刻的幽冥神獸，最喜歡一口吞噬使用者的背誦盲點與錯題。',
    elementIcon: <Moon className="h-4 w-4 text-purple-400" />,
  },
];

export const BestiaryModal: React.FC<BestiaryModalProps> = ({
  unlockedSpecies,
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'showcase' | 'bestiary'>('showcase');
  const [selectedGalleryPetIndex, setSelectedGalleryPetIndex] = useState(0);

  if (!isOpen) return null;

  const currentShowcasePet = ULTIMATE_PETS_GALLERY[selectedGalleryPetIndex] || ULTIMATE_PETS_GALLERY[0];

  const rarityBadge = (rarity: PetRarity) => {
    const map = {
      common: 'bg-slate-800 text-slate-300 border-slate-700',
      rare: 'bg-blue-900/60 text-blue-300 border-blue-500/40',
      epic: 'bg-purple-900/60 text-purple-300 border-purple-500/40',
      legendary: 'bg-amber-900/60 text-amber-300 border-amber-500/40',
      mythic: 'bg-rose-900/60 text-rose-300 border-rose-500/40',
    };
    return (
      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase ${map[rarity]}`}>
        {rarity}
      </span>
    );
  };

  const unlockedCount = BESTIARY_DATA.filter(entry =>
    unlockedSpecies.includes(entry.speciesId)
  ).length;

  const handleSelectPet = (idx: number) => {
    soundFx.playTap();
    setSelectedGalleryPetIndex(idx);
    confetti({ particleCount: 30, spread: 60, origin: { y: 0.6 } });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[92vh] overflow-hidden rounded-3xl border border-slate-700 bg-slate-900 p-4 sm:p-6 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Crown className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold font-fun text-white flex items-center gap-2">
                神獸終極形態與圖鑑全覽
              </h3>
              <p className="text-xs text-slate-400">
                預覽最終成長神獸的華麗姿態、動態星軌光環與專屬天賦
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="mt-3 flex items-center gap-2 p-1 bg-slate-950/70 border border-slate-800 rounded-2xl">
          <button
            onClick={() => {
              soundFx.playTap();
              setActiveTab('showcase');
            }}
            className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'showcase'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-lg'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            <Crown className="h-4 w-4" />
            👑 終極形態立體展示 (全 6 大終極體)
          </button>
          <button
            onClick={() => {
              soundFx.playTap();
              setActiveTab('bestiary');
            }}
            className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'bestiary'
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            <BookOpen className="h-4 w-4" />
            📜 全圖鑑物種清單 ({unlockedCount}/{BESTIARY_DATA.length})
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto mt-4 pr-1">
          {activeTab === 'showcase' ? (
            <div className="space-y-4">
              {/* Pet Selector Chips */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                {ULTIMATE_PETS_GALLERY.map((item, idx) => (
                  <button
                    key={item.id}
                    onClick={() => handleSelectPet(idx)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all border ${
                      selectedGalleryPetIndex === idx
                        ? 'bg-slate-800 border-amber-400 text-amber-300 shadow-md scale-105'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    {item.elementIcon}
                    <span>{item.name.split(' ')[0]}</span>
                    {selectedGalleryPetIndex === idx && (
                      <CheckCircle2 className="h-3.5 w-3.5 text-amber-400" />
                    )}
                  </button>
                ))}
              </div>

              {/* Main Stage Display Card */}
              <div className="relative overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-b from-slate-900 to-slate-950 p-5 sm:p-6 shadow-2xl flex flex-col md:flex-row items-center gap-6">
                {/* Radial Glow Effect */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(245,158,11,0.15),transparent_60%)] pointer-events-none" />

                {/* Animated Pet Canvas Box with Expanded Breathable Space */}
                <div className="relative w-64 h-64 sm:w-72 sm:h-72 md:w-80 md:h-80 flex-shrink-0 flex items-center justify-center p-2 rounded-3xl bg-slate-950/70 border border-slate-800/80 shadow-inner overflow-visible group">
                  <PetCanvas pet={currentShowcasePet} size="hero" />
                  
                  {/* Stage badge */}
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[11px] font-black flex items-center gap-1">
                    <Sparkles className="h-3 w-3 animate-spin" style={{ animationDuration: '4s' }} />
                    終極神話體 (Lv.50 MAX)
                  </div>

                  {/* Elemental Tag */}
                  <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-slate-900/90 border border-slate-700 text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    {currentShowcasePet.elementIcon}
                    <span className="uppercase text-[10px] tracking-wider">
                      {currentShowcasePet.element}
                    </span>
                  </div>
                </div>

                {/* Pet Information & Lore */}
                <div className="flex-1 space-y-3 w-full">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-950 border border-rose-500/50 text-rose-300">
                        MYTHIC ULTIMATE
                      </span>
                      <span className="text-xs text-amber-400 font-bold">
                        ★ ★ ★ ★ ★
                      </span>
                    </div>
                    <h4 className="text-2xl font-black font-fun text-white mt-1">
                      {currentShowcasePet.name}
                    </h4>
                    <p className="text-xs text-amber-300/80 font-medium">
                      称号：{currentShowcasePet.title}
                    </p>
                  </div>

                  {/* Lore Description */}
                  <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 leading-relaxed">
                    {currentShowcasePet.lore}
                  </div>

                  {/* Talent Banner */}
                  <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-950/40 to-slate-900 border border-amber-500/40 flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-xs font-black text-amber-300">
                        專屬終極天賦：{currentShowcasePet.talent}
                      </div>
                      <div className="text-[11px] text-slate-300 mt-0.5">
                        {currentShowcasePet.talentDesc}
                      </div>
                    </div>
                  </div>

                  {/* Gene Traits Overview */}
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-2 rounded-xl bg-slate-950/50 border border-slate-800/80">
                      <span className="text-[10px] text-slate-400 block">翅膀型態</span>
                      <span className="font-bold text-slate-200">
                        {currentShowcasePet.genes.wings === 'dragon' ? '日蝕龍翼' : currentShowcasePet.genes.wings === 'mecha' ? '機甲雷翼' : '純白羽翼'}
                      </span>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-950/50 border border-slate-800/80">
                      <span className="text-[10px] text-slate-400 block">星軌光環</span>
                      <span className="font-bold text-slate-200">四星天體天軌</span>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-950/50 border border-slate-800/80">
                      <span className="text-[10px] text-slate-400 block">基因紋路</span>
                      <span className="font-bold text-slate-200">遠古語彙符文</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tips on Evolution */}
              <div className="p-3.5 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 flex items-center justify-between text-xs text-indigo-300">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-indigo-400" />
                  <span>
                    如何培育出終極形態？每日持續完成 SRS 間隔複習累積親密度與經驗值，升級至完全體後使用「基因突變實驗室」即可進化為神話變異體！
                  </span>
                </div>
              </div>
            </div>
          ) : (
            /* Standard Bestiary Grid */
            <div className="space-y-3">
              {/* Progress Bar Header */}
              <div className="rounded-2xl bg-slate-950/60 p-4 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                    <Trophy className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">目前圖鑑收集進度</p>
                    <p className="text-lg font-bold font-fun text-white">
                      {unlockedCount} / {BESTIARY_DATA.length} 種物種已解鎖
                    </p>
                  </div>
                </div>
                <div className="w-32">
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-800">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-amber-400"
                      style={{ width: `${(unlockedCount / BESTIARY_DATA.length) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {BESTIARY_DATA.map(item => {
                  const isUnlocked = unlockedSpecies.includes(item.speciesId);

                  return (
                    <div
                      key={item.speciesId}
                      className={`rounded-2xl border p-4 transition-all ${
                        isUnlocked
                          ? 'border-slate-700/80 bg-slate-800/40 hover:border-indigo-500/50'
                          : 'border-slate-800/60 bg-slate-950/40 opacity-70'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={`h-12 w-12 rounded-2xl flex items-center justify-center text-2xl border ${
                              isUnlocked
                                ? 'bg-slate-800 border-indigo-500/30'
                                : 'bg-slate-900 border-slate-800 text-slate-600'
                            }`}
                          >
                            {isUnlocked ? item.iconSymbol : <Lock className="h-5 w-5 text-slate-500" />}
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-white">
                              {isUnlocked ? item.name : '??? 未知封印神獸'}
                            </h4>
                            <div className="mt-1 flex items-center gap-1.5">
                              {rarityBadge(item.rarity)}
                              <span className="text-[10px] text-slate-400 font-medium">
                                {item.element.toUpperCase()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <p className="mt-3 text-xs text-slate-300 leading-relaxed">
                        {isUnlocked ? item.description : '透過持續背誦單字並進行基因變異可解鎖此物種。'}
                      </p>

                      <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                        <span>進化途徑：</span>
                        <span className="text-indigo-300 font-medium truncate max-w-[160px]">
                          {isUnlocked ? item.evolutionPath : '條件未達成'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

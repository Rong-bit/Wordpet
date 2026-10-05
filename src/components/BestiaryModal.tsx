import React, { useState } from 'react';
import { BestiaryEntry, PetRarity, Pet, PetElement, PetStage } from '../types';
import { BESTIARY_DATA, INITIAL_PET } from '../data/bestiary';
import { HATCH_POOL } from '../data/petSpecies';
import { evolveOneStage, hatchPet } from '../utils/evolution';
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
  ChevronLeft,
  ChevronRight,
  Eye,
  HeartHandshake,
  Bot,
  Unlock,
} from 'lucide-react';

interface BestiaryModalProps {
  unlockedSpecies: string[];
  isOpen: boolean;
  onClose: () => void;
  onSelectPet?: (pet: Pet) => void;
  onResetToEgg?: () => void;
  currentPetId?: string;
}

interface ShowcasePetItem extends Pet {
  talent: string;
  talentDesc: string;
  elementIcon: React.ReactNode;
  lore: string;
  cleanliness?: number;
  personality?: string;
  stats?: { intelligence: number; endurance: number; speed: number };
}

// Complete showcase catalog covering all 12 species
const BASE_SHOWCASE: ShowcasePetItem[] = [
  // --- 6 ULTIMATE MYTHIC FORMS ---
  {
    id: 'preview_ultimate_flame',
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
    specialTrait: '過目不忘：背單字經驗與金幣永久提升 +25%',
    talent: '【過目不忘】',
    talentDesc: '背誦單字獲得的經驗值與金幣永久提升 +25%！',
    lore: '歷經極限連勝考驗所誕生的終極烈焰神龍，羽翼如天體日珥般熾熱，周圍環繞著燃燒星軌。',
    elementIcon: <Flame className="h-4 w-4 text-orange-400" />,
  },
  {
    id: 'preview_ultimate_frost',
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
    id: 'preview_ultimate_nature',
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
    id: 'preview_ultimate_thunder',
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
    id: 'preview_ultimate_radiant',
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
    id: 'preview_ultimate_void',
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

  // --- 6 EARLY & JUVENILE PET FORMS ---
  {
    id: 'preview_egg_genesis',
    name: '起源神秘星蛋',
    title: '初醒之卵',
    element: 'nature',
    stage: 'egg',
    rarity: 'common',
    level: 1,
    exp: 0,
    maxExp: 100,
    mood: 'happy',
    hunger: 90,
    health: 100,
    cleanliness: 100,
    personality: '溫和好奇',
    stats: { intelligence: 20, endurance: 20, speed: 20 },
    genes: {
      element: 'nature',
      pattern: 'aurora',
      horns: 'none',
      wings: 'none',
      particle: 'sparkles',
      primaryColor: '#10B981',
      secondaryColor: '#059669',
      glowColor: '#6EE7B7',
    },
    customization: {
      hat: 'none',
      accessory: 'none',
      backgroundTheme: 'forest',
    },
    speciesId: 'p_egg_genesis',
    daysUnreviewed: 0,
    lastFedAt: new Date().toISOString(),
    lastActiveAt: new Date().toISOString(),
    hatchedAt: '',
    wordsLearnedCount: 0,
    evolutionPower: 100,
    specialTrait: '孵化衝刺：每完成 5 個單字複習，裂痕加深！',
    talent: '【語彙破殼】',
    talentDesc: `完成初始學習任務即可隨機破殼，誕生 ${HATCH_POOL.length} 種神獸幼體之一！`,
    lore: '沈睡在語意矩陣中心的起源星蛋，表面烙印著古老單字符文。',
    elementIcon: <Sparkles className="h-4 w-4 text-emerald-400" />,
  },
  {
    id: 'preview_fire_dragon_1',
    name: '熾焰火蜥幼體',
    title: '火系幼年初階',
    element: 'flame',
    stage: 'baby',
    rarity: 'common',
    level: 8,
    exp: 450,
    maxExp: 600,
    mood: 'happy',
    hunger: 85,
    health: 100,
    cleanliness: 100,
    personality: '熱情活潑',
    stats: { intelligence: 45, endurance: 40, speed: 50 },
    genes: {
      element: 'flame',
      pattern: 'plain',
      horns: 'none',
      wings: 'none',
      particle: 'fire',
      primaryColor: '#F97316',
      secondaryColor: '#EF4444',
      glowColor: '#FBBF24',
    },
    customization: {
      hat: 'none',
      accessory: 'none',
      backgroundTheme: 'volcano',
    },
    speciesId: 'p_fire_dragon_1',
    daysUnreviewed: 0,
    lastFedAt: new Date().toISOString(),
    lastActiveAt: new Date().toISOString(),
    hatchedAt: new Date().toISOString(),
    wordsLearnedCount: 40,
    evolutionPower: 200,
    specialTrait: '初學者熱火：背誦單字時尾巴冒出火花',
    talent: '【火花共鳴】',
    talentDesc: '連續答對 3 題獲得小額額外經驗值！',
    lore: '誕生於初學者熱忱之火的靈獸幼雛，喜歡溫暖的餅乾與飼料。',
    elementIcon: <Flame className="h-4 w-4 text-orange-400" />,
  },
  {
    id: 'preview_frost_fox_1',
    name: '霜晶小狐',
    title: '冰系幼年初階',
    element: 'frost',
    stage: 'baby',
    rarity: 'common',
    level: 8,
    exp: 420,
    maxExp: 600,
    mood: 'happy',
    hunger: 80,
    health: 100,
    cleanliness: 100,
    personality: '冰雪冷靜',
    stats: { intelligence: 52, endurance: 40, speed: 45 },
    genes: {
      element: 'frost',
      pattern: 'plain',
      horns: 'crystal',
      wings: 'none',
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
    speciesId: 'p_frost_fox_1',
    daysUnreviewed: 0,
    lastFedAt: new Date().toISOString(),
    lastActiveAt: new Date().toISOString(),
    hatchedAt: new Date().toISOString(),
    wordsLearnedCount: 38,
    evolutionPower: 200,
    specialTrait: '凝神專注：錯誤率較低時獲得親密度提升',
    talent: '【凝霜思維】',
    talentDesc: '單字辨析測驗有微弱提示輔助。',
    lore: '擁有雪白絨毛與冰晶耳朵的小狐狸，眼神清澈冷靜。',
    elementIcon: <Snowflake className="h-4 w-4 text-cyan-400" />,
  },
  {
    id: 'preview_nature_deer_1',
    name: '翡翠森幼鹿',
    title: '森系幼年初階',
    element: 'nature',
    stage: 'baby',
    rarity: 'common',
    level: 8,
    exp: 480,
    maxExp: 600,
    mood: 'happy',
    hunger: 90,
    health: 100,
    cleanliness: 100,
    personality: '溫和親近',
    stats: { intelligence: 48, endurance: 48, speed: 42 },
    genes: {
      element: 'nature',
      pattern: 'plain',
      horns: 'crystal',
      wings: 'none',
      particle: 'sparkles',
      primaryColor: '#10B981',
      secondaryColor: '#059669',
      glowColor: '#6EE7B7',
    },
    customization: {
      hat: 'none',
      accessory: 'none',
      backgroundTheme: 'forest',
    },
    speciesId: 'p_nature_deer_1',
    daysUnreviewed: 0,
    lastFedAt: new Date().toISOString(),
    lastActiveAt: new Date().toISOString(),
    hatchedAt: new Date().toISOString(),
    wordsLearnedCount: 45,
    evolutionPower: 200,
    specialTrait: '翠玉生長：生命力自然回覆速度加快',
    talent: '【森林庇佑】',
    talentDesc: '飢餓度衰減速度降低 20%。',
    lore: '頭頂長出嫩綠水晶小角的小鹿，親和大自然生機。',
    elementIcon: <Trees className="h-4 w-4 text-emerald-400" />,
  },
  {
    id: 'preview_fire_dragon_2',
    name: '烈焰翼龍 (完全體)',
    title: '烈火展翼者',
    element: 'flame',
    stage: 'adult',
    rarity: 'rare',
    level: 25,
    exp: 2800,
    maxExp: 3500,
    mood: 'happy',
    hunger: 90,
    health: 100,
    cleanliness: 100,
    personality: '勇猛狂烈',
    stats: { intelligence: 78, endurance: 75, speed: 82 },
    genes: {
      element: 'flame',
      pattern: 'striped',
      horns: 'dragon',
      wings: 'dragon',
      particle: 'fire',
      primaryColor: '#EA580C',
      secondaryColor: '#C2410C',
      glowColor: '#FBBF24',
    },
    customization: {
      hat: 'none',
      accessory: 'none',
      backgroundTheme: 'volcano',
    },
    speciesId: 'p_fire_dragon_2',
    daysUnreviewed: 0,
    lastFedAt: new Date().toISOString(),
    lastActiveAt: new Date().toISOString(),
    hatchedAt: new Date().toISOString(),
    wordsLearnedCount: 350,
    evolutionPower: 550,
    specialTrait: '烈焰雙翼：單字複習速度加成',
    talent: '【烈火連擊】',
    talentDesc: '連勝次數增加時可額外獲得 15% 金幣。',
    lore: '體型成長為幼體的兩倍，背部長出燃燒的火紅雙翼。',
    elementIcon: <Flame className="h-4 w-4 text-orange-400" />,
  },
  {
    id: 'preview_cyber_mecha',
    name: '量子神經機械龍 (神話變異)',
    title: '超維度矩陣支配者',
    element: 'cyber',
    stage: 'ultimate',
    rarity: 'mythic',
    level: 50,
    exp: 9999,
    maxExp: 10000,
    mood: 'ecstatic',
    hunger: 100,
    health: 100,
    cleanliness: 100,
    personality: '精密計算',
    stats: { intelligence: 100, endurance: 97, speed: 99 },
    genes: {
      element: 'cyber',
      pattern: 'neon',
      horns: 'cyber_antennae',
      wings: 'mecha',
      particle: 'neon_grid',
      primaryColor: '#06B6D4',
      secondaryColor: '#0891B2',
      glowColor: '#67E8F9',
    },
    customization: {
      hat: 'headphones',
      accessory: 'star_badge',
      backgroundTheme: 'cyberpunk',
    },
    speciesId: 'p_cyber_mecha_ultimate',
    daysUnreviewed: 0,
    lastFedAt: new Date().toISOString(),
    lastActiveAt: new Date().toISOString(),
    hatchedAt: new Date().toISOString(),
    wordsLearnedCount: 1600,
    evolutionPower: 999,
    specialTrait: '量子記憶矩陣：測驗全對時觸發全螢幕光效！',
    talent: '【量子運算】',
    talentDesc: '間隔重複演算法最優化，複習效率提高 30%！',
    lore: '透過跨屬性禁忌變異合成的超維度機械神獸，藍色霓虹羽翼與量子光軌令人驚嘆。',
    elementIcon: <Bot className="h-4 w-4 text-cyan-400" />,
  },
  ...HATCH_POOL.filter(
    s => !['p_fire_dragon_1', 'p_frost_fox_1', 'p_nature_deer_1'].includes(s.speciesId)
  ).map(
    (s): ShowcasePetItem => ({
      id: `preview_${s.speciesId}`,
      name: s.name,
      title: s.title,
      element: s.element,
      stage: 'baby',
      rarity: s.rarity,
      level: 8,
      exp: 400,
      maxExp: 600,
      mood: 'happy',
      hunger: 85,
      health: 100,
      genes: { ...s.genes },
      customization: { hat: 'none', accessory: 'none', backgroundTheme: 'forest' },
      speciesId: s.speciesId,
      daysUnreviewed: 0,
      lastFedAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
      hatchedAt: new Date().toISOString(),
      wordsLearnedCount: 40,
      evolutionPower: 200,
      specialTrait: s.trait,
      talent: `【${s.trait.split('：')[0]}】`,
      talentDesc: s.trait.split('：')[1] || s.trait,
      lore: BESTIARY_DATA.find(b => b.speciesId === s.speciesId)?.description || s.title,
      elementIcon: <Sparkles className="h-4 w-4 text-pink-300" />,
    })
  ),
];

const evolvedShowcase: ShowcasePetItem[] = HATCH_POOL.flatMap(species => {
  const forms: ShowcasePetItem[] = [];
  let current: Pet | null = hatchPet(INITIAL_PET, species);
  while ((current = evolveOneStage(current))) {
    const p: Pet = current;
    if (!BASE_SHOWCASE.some(s => s.speciesId === p.speciesId)) {
      forms.push({
        ...p,
        id: `preview_${p.speciesId}`,
        mood: 'happy',
        hunger: 100,
        health: 100,
        customization: { hat: 'none', accessory: 'none', backgroundTheme: 'forest' },
        talent: `【${p.specialTrait.split('：')[0]}】`,
        talentDesc: p.specialTrait.split('：')[1] || p.specialTrait,
        lore: BESTIARY_DATA.find(b => b.speciesId === p.speciesId)?.description || p.title,
        elementIcon: <Sparkles className="h-4 w-4 text-amber-300" />,
      });
    }
  }
  return forms;
});

const ALL_SHOWCASE_PETS: ShowcasePetItem[] = [...BASE_SHOWCASE, ...evolvedShowcase];

export const BestiaryModal: React.FC<BestiaryModalProps> = ({
  unlockedSpecies,
  isOpen,
  onClose,
  onSelectPet,
  onResetToEgg,
  currentPetId,
}) => {
  const [activeTab, setActiveTab] = useState<'showcase' | 'bestiary'>('showcase');
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (!isOpen) return null;

  const currentPet = ALL_SHOWCASE_PETS[selectedIndex] || ALL_SHOWCASE_PETS[0];

  const safeTap = () => {
    try {
      soundFx?.playTap?.();
    } catch {
      // ignore
    }
  };

  const handleSelectPetIndex = (idx: number) => {
    safeTap();
    setSelectedIndex(idx);
    try {
      confetti({ particleCount: 25, spread: 50, origin: { y: 0.6 } });
    } catch {}
  };

  const handlePrevPet = () => {
    safeTap();
    setSelectedIndex(prev => (prev > 0 ? prev - 1 : ALL_SHOWCASE_PETS.length - 1));
  };

  const handleNextPet = () => {
    safeTap();
    setSelectedIndex(prev => (prev < ALL_SHOWCASE_PETS.length - 1 ? prev + 1 : 0));
  };

  // Switch to showcase and preview a specific species from bestiary list
  const handlePreviewSpeciesFromBestiary = (speciesId: string) => {
    safeTap();
    const foundIdx = ALL_SHOWCASE_PETS.findIndex(p => p.speciesId === speciesId);
    if (foundIdx !== -1) {
      setSelectedIndex(foundIdx);
    } else {
      setSelectedIndex(0);
    }
    setActiveTab('showcase');
    try {
      confetti({ particleCount: 30, spread: 60, origin: { y: 0.6 } });
    } catch {}
  };

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[94vh] overflow-hidden rounded-3xl border border-slate-700 bg-slate-900 p-4 sm:p-6 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Crown className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold font-fun text-white flex items-center gap-2">
                神獸圖鑑與全形態展示館
              </h3>
              <p className="text-xs text-slate-400">
                點選任意神獸可即時切換立體預覽、查看專屬天賦並設為冒險夥伴
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="mt-3 flex items-center gap-2 p-1 bg-slate-950/70 border border-slate-800 rounded-2xl">
          <button
            type="button"
            onClick={() => {
              safeTap();
              setActiveTab('showcase');
            }}
            className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'showcase'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-lg'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            <Crown className="h-4 w-4" />
            👑 立體模型全覽（{HATCH_POOL.length} 種神獸・{ALL_SHOWCASE_PETS.length} 個型態）
          </button>
          <button
            type="button"
            onClick={() => {
              safeTap();
              setActiveTab('bestiary');
            }}
            className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'bestiary'
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            <BookOpen className="h-4 w-4" />
            📜 全圖鑑解鎖清單 ({unlockedCount}/{BESTIARY_DATA.length})
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto mt-4 pr-1">
          {activeTab === 'showcase' ? (
            <div className="space-y-4">
              {/* Pet Selection Grid / Chips (Fully visible without horizontal cutoff) */}
              <div>
                <div className="text-xs font-bold text-slate-300 mb-2 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-amber-300 font-bold">
                    <span>👉</span> 點選下方任一隻神獸立即切換：
                  </span>
                  <span className="text-amber-400 font-bold text-[11px] bg-slate-950 px-2 py-0.5 rounded-full border border-slate-800">
                    目前預覽：第 {selectedIndex + 1} / {ALL_SHOWCASE_PETS.length} 隻
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                  {ALL_SHOWCASE_PETS.map((item, idx) => {
                    const isSelected = selectedIndex === idx;
                    return (
                      <button
                        type="button"
                        key={item.id}
                        onClick={() => handleSelectPetIndex(idx)}
                        className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left border cursor-pointer ${
                          isSelected
                            ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-amber-400 text-amber-200 shadow-md ring-2 ring-amber-400/50 scale-[1.03]'
                            : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-amber-500/40 hover:bg-slate-800 hover:text-white'
                        }`}
                      >
                        <span className="shrink-0">{item.elementIcon}</span>
                        <span className="truncate">{item.name.split(' ')[0]}</span>
                        {isSelected && (
                          <CheckCircle2 className="h-3.5 w-3.5 text-amber-400 shrink-0 ml-auto" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Main Stage Display Card */}
              <div className="relative overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-b from-slate-900 to-slate-950 p-4 sm:p-6 shadow-2xl flex flex-col md:flex-row items-center gap-6">
                {/* Radial Glow Effect */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(245,158,11,0.15),transparent_60%)] pointer-events-none" />

                {/* Animated Pet Canvas Box with Expanded Breathable Space & Prev/Next Arrows */}
                <div className="relative w-64 h-64 sm:w-72 sm:h-72 md:w-80 md:h-80 flex-shrink-0 flex items-center justify-center p-2 rounded-3xl bg-slate-950/70 border border-slate-800/80 shadow-inner overflow-visible group">
                  {/* Left Prev Arrow Button */}
                  <button
                    type="button"
                    onClick={handlePrevPet}
                    className="absolute -left-3 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-full bg-slate-900 hover:bg-amber-500 hover:text-slate-950 text-slate-200 border border-slate-700 shadow-xl cursor-pointer transition-all active:scale-90"
                    title="上一隻神獸"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>

                  {/* Right Next Arrow Button */}
                  <button
                    type="button"
                    onClick={handleNextPet}
                    className="absolute -right-3 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-full bg-slate-900 hover:bg-amber-500 hover:text-slate-950 text-slate-200 border border-slate-700 shadow-xl cursor-pointer transition-all active:scale-90"
                    title="下一隻神獸"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>

                  {/* 3D/Canvas Pet */}
                  <PetCanvas pet={currentPet} size="hero" />

                  {/* Stage badge */}
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[11px] font-black flex items-center gap-1 z-20">
                    <Sparkles className="h-3 w-3 animate-spin" style={{ animationDuration: '4s' }} />
                    {currentPet.stage === 'ultimate'
                      ? '終極神話體'
                      : currentPet.stage === 'adult'
                      ? '完全體'
                      : currentPet.stage === 'baby'
                      ? '幼年體'
                      : '起源蛋'}
                  </div>

                  {/* Elemental Tag */}
                  <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-slate-900/90 border border-slate-700 text-xs font-bold text-slate-300 flex items-center gap-1.5 z-20">
                    {currentPet.elementIcon}
                    <span className="uppercase text-[10px] tracking-wider">
                      {currentPet.element}
                    </span>
                  </div>
                </div>

                {/* Pet Information & Lore */}
                <div className="flex-1 space-y-3 w-full">
                  <div>
                    <div className="flex items-center gap-2">
                      {rarityBadge(currentPet.rarity)}
                      <span className="text-xs text-amber-400 font-bold">
                        ★ ★ ★ ★ ★
                      </span>
                    </div>
                    <h4 className="text-2xl font-black font-fun text-white mt-1">
                      {currentPet.name}
                    </h4>
                    <p className="text-xs text-amber-300/80 font-medium">
                      稱號：{currentPet.title}
                    </p>
                  </div>

                  {/* Lore Description */}
                  <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 leading-relaxed">
                    {currentPet.lore}
                  </div>

                  {/* Talent Banner */}
                  <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-950/40 to-slate-900 border border-amber-500/40 flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-xs font-black text-amber-300">
                        專屬天賦：{currentPet.talent}
                      </div>
                      <div className="text-[11px] text-slate-300 mt-0.5">
                        {currentPet.talentDesc}
                      </div>
                    </div>
                  </div>

                  {/* Action: Adopt / Set as active companion */}
                  {onSelectPet && (
                    <div className="space-y-2 pt-1">
                      {unlockedSpecies.includes(currentPet.speciesId) || currentPet.stage === 'egg' ? (
                        <button
                          type="button"
                          onClick={() => {
                            try {
                              soundFx?.playHatch?.();
                            } catch {}
                            onSelectPet(currentPet);
                            try {
                              confetti({ particleCount: 80, spread: 80, origin: { y: 0.5 } });
                            } catch {}
                          }}
                          className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 py-3 px-4 text-sm font-black text-slate-950 shadow-xl shadow-emerald-500/20 transition-all cursor-pointer active:scale-95"
                        >
                          <HeartHandshake className="h-5 w-5" />
                          💫 選定這隻已解鎖神獸出戰
                        </button>
                      ) : (
                        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 text-xs text-slate-400">
                          <span className="flex items-center gap-2 text-amber-400 font-bold">
                            <Lock className="h-4 w-4 shrink-0" /> 正統冒險模式鎖定中
                          </span>
                          <span className="text-[11px] text-slate-400">
                            需從起源星蛋每日背單字培育進化解鎖
                          </span>
                        </div>
                      )}

                      {/* Reset back to Genesis Egg */}
                      {onResetToEgg && (
                        <button
                          type="button"
                          onClick={() => {
                            try {
                              soundFx?.playHatch?.();
                            } catch {}
                            onResetToEgg();
                            try {
                              confetti({ particleCount: 100, spread: 70, origin: { y: 0.5 } });
                            } catch {}
                          }}
                          className="w-full flex items-center justify-center gap-2 rounded-2xl bg-slate-950/70 hover:bg-amber-500/10 border border-amber-500/30 py-2.5 px-4 text-xs font-bold text-amber-300 transition-all cursor-pointer"
                        >
                          <span>🥚 重新領取起源星蛋（重啟從蛋孵化培育的正統冒險之旅）</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* Standard Bestiary Grid (with Instant 3D Preview Buttons) */
            <div className="space-y-3">
              {/* Progress Bar Header & Unlock All Button */}
              <div className="rounded-2xl bg-slate-950/60 p-4 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
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

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="w-28 hidden sm:block">
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-800">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-amber-400"
                        style={{ width: `${(unlockedCount / BESTIARY_DATA.length) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Pet Cards with Click to Preview */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {BESTIARY_DATA.map(item => {
                  const isUnlocked = unlockedSpecies.includes(item.speciesId);

                  return (
                    <div
                      key={item.speciesId}
                      onClick={() => handlePreviewSpeciesFromBestiary(item.speciesId)}
                      className={`group rounded-2xl border p-4 transition-all cursor-pointer relative overflow-hidden ${
                        isUnlocked
                          ? 'border-slate-700/80 bg-slate-800/40 hover:border-amber-500/60 hover:bg-slate-800/80 hover:shadow-lg'
                          : 'border-slate-800/60 bg-slate-950/40 hover:border-slate-700 hover:bg-slate-900/60'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={`h-12 w-12 rounded-2xl flex items-center justify-center text-2xl border transition-transform group-hover:scale-110 ${
                              isUnlocked
                                ? 'bg-slate-800 border-indigo-500/30'
                                : 'bg-slate-900 border-slate-800 text-slate-600'
                            }`}
                          >
                            {isUnlocked ? item.iconSymbol : <Lock className="h-5 w-5 text-slate-500" />}
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                              {isUnlocked ? item.name : '??? 待解鎖神獸'}
                            </h4>
                            <div className="mt-1 flex items-center gap-1.5">
                              {rarityBadge(item.rarity)}
                              <span className="text-[10px] text-slate-400 font-medium">
                                {item.element.toUpperCase()}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Preview Chip */}
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/10 group-hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition-all">
                          <Eye className="h-3 w-3" />
                          點擊立體預覽
                        </span>
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

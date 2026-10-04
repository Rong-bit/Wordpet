export type WordCategory = 'daily' | 'junior' | 'toeic' | 'toefl' | 'highschool' | 'business' | 'custom';

export type WordStatus = 'new' | 'learning' | 'reviewing' | 'mastered';

export interface Word {
  id: string;
  word: string;
  phonetic: string;
  partOfSpeech: string;
  meaning: string;
  exampleEn: string;
  exampleZh: string;
  confusionNotes: string; // 辨析與常考陷阱 / 記憶秘訣
  category: WordCategory;
  level: number; // 1 to 5
  // SRS properties
  repetition: number;
  easeFactor: number; // SM-2 default 2.5
  intervalDays: number;
  lastReviewedAt: string | null;
  nextReviewAt: string; // ISO date string
  consecutiveCorrect: number;
  totalAttempts: number;
  mistakeCount: number;
  isWeak: boolean;
  status: WordStatus;
}

export type PetElement = 'flame' | 'frost' | 'nature' | 'thunder' | 'void' | 'radiant' | 'cyber';

export type PetStage = 'egg' | 'baby' | 'juvenile' | 'adult' | 'ultimate';

export type PetRarity = 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';

export interface PetGenes {
  element: PetElement;
  pattern: 'plain' | 'striped' | 'galaxy' | 'runic' | 'aurora' | 'neon';
  horns: 'none' | 'crystal' | 'dragon' | 'cyber_antennae' | 'angel_halo';
  wings: 'none' | 'fairy' | 'phoenix' | 'mecha' | 'dragon';
  particle: 'sparkles' | 'fire' | 'snowflakes' | 'lightning' | 'stardust' | 'neon_grid';
  primaryColor: string;
  secondaryColor: string;
  glowColor: string;
}

export interface PetCustomization {
  hat: 'none' | 'wizard_hat' | 'crown' | 'headphones' | 'graduation_cap' | 'sunglasses';
  accessory: 'none' | 'medal' | 'cape' | 'magic_orb' | 'star_badge';
  backgroundTheme: 'forest' | 'cosmic' | 'volcano' | 'cyberpunk' | 'heaven';
}

export interface Pet {
  id: string;
  name: string;
  speciesId: string;
  title: string;
  element: PetElement;
  stage: PetStage;
  rarity: PetRarity;
  level: number;
  exp: number;
  maxExp: number;
  hunger: number; // 0 - 100
  health: number; // 0 - 100
  mood: 'ecstatic' | 'happy' | 'normal' | 'hungry' | 'weak' | 'danger_escape';
  daysUnreviewed: number;
  lastFedAt: string;
  lastActiveAt: string;
  hatchedAt: string;
  genes: PetGenes;
  customization: PetCustomization;
  wordsLearnedCount: number;
  evolutionPower: number;
  specialTrait: string;
}

export interface BestiaryEntry {
  speciesId: string;
  name: string;
  element: PetElement;
  rarity: PetRarity;
  description: string;
  evolutionPath: string;
  requiredStage: PetStage;
  isUnlocked: boolean;
  unlockedAt?: string;
  iconSymbol: string;
}

export interface Item {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: 'food' | 'potion' | 'evolution_stone' | 'egg' | 'accessory';
  count: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  effect: {
    exp?: number;
    hunger?: number;
    health?: number;
    mutationBonus?: number;
  };
}

export interface DailyQuest {
  id: string;
  title: string;
  desc: string;
  target: number;
  current: number;
  rewardType: 'coins' | 'item' | 'exp';
  rewardAmount: number;
  rewardItemId?: string;
  isCompleted: boolean;
  isClaimed: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  desc: string;
  category: 'learning' | 'pet' | 'streak' | 'mutation';
  icon: string;
  progress: number;
  maxProgress: number;
  unlocked: boolean;
  unlockedAt?: string;
  rewardCoins: number;
}

export interface LeaderboardUser {
  id: string;
  name: string;
  avatar: string;
  streakDays: number;
  wordsMastered: number;
  petLevel: number;
  petName: string;
  petElement: PetElement;
  petStage: PetStage;
  petRarity: PetRarity;
  totalScore: number;
  isCurrentUser?: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  coins: number;
  diamonds: number;
  streakDays: number;
  lastActiveDate: string; // YYYY-MM-DD
  totalReviewsDone: number;
  perfectReviewSessions: number;
  soundEnabled: boolean;
  voiceGender: 'en-US' | 'en-GB';
  voiceSpeed: number;
  isOfflineMode: boolean;
  lastCloudSync: string | null;
  quizBatchSize?: number; // 每次測驗建議題數 (例如 20~30 題，預設 20 題)
  fontSizeMode?: 'normal' | 'large' | 'huge'; // 字體大小模式 (normal: 標準, large: 大, huge: 特大)
}

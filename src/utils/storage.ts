import { Word, Pet, Item, DailyQuest, Achievement, UserProfile } from '../types';
import { INITIAL_WORDS } from '../data/initialWords';
import { INITIAL_PET, INITIAL_ITEMS } from '../data/bestiary';
import { INITIAL_DAILY_QUESTS, INITIAL_ACHIEVEMENTS } from '../data/socialAndQuests';
import { expForLevel } from './evolution';

const STORAGE_KEYS = {
  WORDS: 'wordpet_words_v1',
  PET: 'wordpet_current_pet_v1',
  ITEMS: 'wordpet_items_v1',
  QUESTS: 'wordpet_daily_quests_v1',
  ACHIEVEMENTS: 'wordpet_achievements_v1',
  PROFILE: 'wordpet_user_profile_v1',
  UNLOCKED_SPECIES: 'wordpet_unlocked_species_v1',
  QUEST_DAY: 'wordpet_daily_quests_day_v1',
};

export interface AppState {
  words: Word[];
  pet: Pet;
  items: Item[];
  quests: DailyQuest[];
  achievements: Achievement[];
  profile: UserProfile;
  unlockedSpecies: string[];
}

export const DEFAULT_PROFILE: UserProfile = {
  id: 'user_default',
  name: '單字探險家',
  coins: 280,
  diamonds: 10,
  streakDays: 1,
  lastActiveDate: new Date().toISOString().split('T')[0],
  totalReviewsDone: 0,
  perfectReviewSessions: 0,
  soundEnabled: true,
  voiceGender: 'en-US',
  voiceSpeed: 0.95,
  isOfflineMode: false,
  lastCloudSync: null,
  quizBatchSize: 20,
};

export function loadAppState(): AppState {
  if (typeof window === 'undefined') {
    return {
      words: INITIAL_WORDS,
      pet: INITIAL_PET,
      items: INITIAL_ITEMS,
      quests: INITIAL_DAILY_QUESTS,
      achievements: INITIAL_ACHIEVEMENTS,
      profile: DEFAULT_PROFILE,
      unlockedSpecies: ['p_egg_genesis'],
    };
  }

  let words: Word[] = INITIAL_WORDS;
  let pet: Pet = INITIAL_PET;
  let items: Item[] = INITIAL_ITEMS;
  let quests: DailyQuest[] = INITIAL_DAILY_QUESTS;
  let achievements: Achievement[] = INITIAL_ACHIEVEMENTS;
  let profile: UserProfile = DEFAULT_PROFILE;
  let unlockedSpecies: string[] = ['p_egg_genesis'];

  try {
    const sWords = localStorage.getItem(STORAGE_KEYS.WORDS);
    if (sWords) {
      const parsedWords: Word[] = JSON.parse(sWords);
      const existingIds = new Set(parsedWords.map(w => w.id));
      const missingInitialWords = INITIAL_WORDS.filter(w => !existingIds.has(w.id));
      words = [...parsedWords, ...missingInitialWords];
    }

    const sPet = localStorage.getItem(STORAGE_KEYS.PET);
    if (sPet) {
      const parsedPet: Pet = JSON.parse(sPet);
      const maxExp = expForLevel(parsedPet.level || 1);
      pet = { ...parsedPet, maxExp, exp: Math.min(parsedPet.exp || 0, maxExp - 1) };
    }

    const sItems = localStorage.getItem(STORAGE_KEYS.ITEMS);
    if (sItems) {
      const parsedItems: Item[] = JSON.parse(sItems);
      items = parsedItems.map(i => {
        const def = INITIAL_ITEMS.find(d => d.id === i.id);
        return def ? { ...def, count: i.count } : i;
      });
    }

    const today = new Date().toISOString().split('T')[0];
    const sQuests = localStorage.getItem(STORAGE_KEYS.QUESTS);
    const lastQuestDay = localStorage.getItem(STORAGE_KEYS.QUEST_DAY);
    if (sQuests && lastQuestDay === today) {
      quests = JSON.parse(sQuests);
    } else {
      quests = INITIAL_DAILY_QUESTS.map(q => ({ ...q }));
      localStorage.setItem(STORAGE_KEYS.QUEST_DAY, today);
    }

    const sAchievements = localStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS);
    if (sAchievements) achievements = JSON.parse(sAchievements);

    const sProfile = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (sProfile) profile = JSON.parse(sProfile);

    const sUnlocked = localStorage.getItem(STORAGE_KEYS.UNLOCKED_SPECIES);
    if (sUnlocked) unlockedSpecies = JSON.parse(sUnlocked);
  } catch (err) {
    console.error('Failed to parse saved state from local storage:', err);
  }

  // Calculate pet inactivity decay; may reset to egg when escaped
  const decay = checkAndApplyPetDecay(pet);
  pet = decay.pet;
  if (decay.escaped) {
    stashPendingEscape(decay.escaped);
    try {
      localStorage.setItem(STORAGE_KEYS.PET, JSON.stringify(pet));
    } catch {
      // ignore
    }
  }

  return { words, pet, items, quests, achievements, profile, unlockedSpecies };
}

export function saveAppState(state: Partial<AppState>) {
  if (typeof window === 'undefined') return;

  try {
    if (state.words) localStorage.setItem(STORAGE_KEYS.WORDS, JSON.stringify(state.words));
    if (state.pet) localStorage.setItem(STORAGE_KEYS.PET, JSON.stringify(state.pet));
    if (state.items) localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(state.items));
    if (state.quests) localStorage.setItem(STORAGE_KEYS.QUESTS, JSON.stringify(state.quests));
    if (state.achievements) localStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(state.achievements));
    if (state.profile) localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(state.profile));
    if (state.unlockedSpecies) localStorage.setItem(STORAGE_KEYS.UNLOCKED_SPECIES, JSON.stringify(state.unlockedSpecies));
  } catch (err) {
    console.error('Failed to save state to local storage:', err);
  }
}

/** UI warning + danger_escape mood threshold (days without review). */
export const PET_WARN_DAYS = 3;
/** Actual escape: reset to a new egg (stage !== egg only). */
export const PET_ESCAPE_DAYS = 5;

export interface EscapedPetSummary {
  name: string;
  speciesId: string;
  title: string;
  level: number;
  stage: Pet['stage'];
  daysAway: number;
  escapedAt: string;
}

export interface PetDecayResult {
  pet: Pet;
  escaped: EscapedPetSummary | null;
}

const ESCAPE_PENDING_KEY = 'wordpet_pending_escape_v1';

/** Fresh egg after escape; keeps cosmetic prefs if present. */
export function createFreshEgg(from?: Pet): Pet {
  const now = new Date().toISOString();
  return {
    ...INITIAL_PET,
    id: `pet_egg_${Date.now()}`,
    hunger: 90,
    health: 100,
    mood: 'happy',
    daysUnreviewed: 0,
    lastFedAt: now,
    lastActiveAt: now,
    hatchedAt: '',
    wordsLearnedCount: 0,
    customization: from?.customization ? { ...from.customization } : { ...INITIAL_PET.customization },
  };
}

export function stashPendingEscape(summary: EscapedPetSummary) {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(ESCAPE_PENDING_KEY, JSON.stringify(summary));
  } catch {
    // ignore
  }
}

export function takePendingEscape(): EscapedPetSummary | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(ESCAPE_PENDING_KEY);
    if (!raw) return null;
    sessionStorage.removeItem(ESCAPE_PENDING_KEY);
    return JSON.parse(raw) as EscapedPetSummary;
  } catch {
    return null;
  }
}

/**
 * Pet decay:
 * 1+ days → hungry, 2+ → weak, 3+ → danger_escape warning,
 * 5+ (and not egg) → escaped: replace with a fresh egg.
 */
export function checkAndApplyPetDecay(pet: Pet): PetDecayResult {
  const now = Date.now();
  const lastActive = pet.lastActiveAt ? new Date(pet.lastActiveAt).getTime() : now;
  const elapsedDays = Math.floor((now - lastActive) / (1000 * 60 * 60 * 24));

  if (elapsedDays <= 0) return { pet, escaped: null };

  if (elapsedDays >= PET_ESCAPE_DAYS && pet.stage !== 'egg') {
    const escaped: EscapedPetSummary = {
      name: pet.name,
      speciesId: pet.speciesId,
      title: pet.title,
      level: pet.level,
      stage: pet.stage,
      daysAway: elapsedDays,
      escapedAt: new Date().toISOString(),
    };
    return { pet: createFreshEgg(pet), escaped };
  }

  const hungerDrop = elapsedDays * 25;
  const newHunger = Math.max(0, pet.hunger - hungerDrop);

  let newHealth = pet.health;
  if (newHunger <= 0) {
    newHealth = Math.max(10, pet.health - elapsedDays * 20);
  }

  let newMood = pet.mood;
  if (elapsedDays >= PET_WARN_DAYS) {
    newMood = 'danger_escape';
  } else if (newHealth < 40 || elapsedDays >= 2) {
    newMood = 'weak';
  } else if (newHunger < 30 || elapsedDays >= 1) {
    newMood = 'hungry';
  }

  return {
    pet: {
      ...pet,
      hunger: newHunger,
      health: newHealth,
      mood: newMood,
      daysUnreviewed: elapsedDays,
    },
    escaped: null,
  };
}

export function exportBackupData(state: AppState): string {
  const payload = {
    exportedAt: new Date().toISOString(),
    version: '1.0',
    app: 'WordPet',
    data: state,
  };
  return JSON.stringify(payload, null, 2);
}

export function downloadBackupFile(state: AppState) {
  const jsonStr = exportBackupData(state);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `wordpet_backup_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

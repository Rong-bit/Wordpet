import { Pet, PetRarity, PetStage } from '../types';
import {
  EVOLUTION_LEVELS,
  EvolutionForm,
  EvolvedStage,
  getEvolutionLine,
  HatchSpecies,
  rollHatchSpecies,
  STAGE_MIN_RARITY,
} from '../data/petSpecies';

const NEXT_STAGE: Partial<Record<PetStage, EvolvedStage>> = {
  baby: 'juvenile',
  juvenile: 'adult',
  adult: 'ultimate',
};

const RARITY_ORDER: PetRarity[] = ['common', 'rare', 'epic', 'legendary', 'mythic'];

const maxRarity = (a: PetRarity, b: PetRarity): PetRarity =>
  RARITY_ORDER.indexOf(a) >= RARITY_ORDER.indexOf(b) ? a : b;

const bumpRarity = (r: PetRarity): PetRarity =>
  RARITY_ORDER[Math.min(RARITY_ORDER.length - 1, RARITY_ORDER.indexOf(r) + 1)];

export const HATCH_LEVEL = 2;

export const expForLevel = (level: number) => 100 + (Math.max(1, level) - 1) * 40;

export interface NextEvolution {
  stage: EvolvedStage;
  level: number;
  form: EvolutionForm;
}

export function getNextEvolution(pet: Pet): NextEvolution | null {
  const stage = NEXT_STAGE[pet.stage];
  if (!stage) return null;
  const line = getEvolutionLine(pet.speciesId);
  if (!line) return null;
  return { stage, level: EVOLUTION_LEVELS[stage], form: line.forms[stage] };
}

const rotateHue = (hex: string, degrees: number): string => {
  if (!/^#[0-9a-f]{6}$/i.test(hex)) return hex;
  const n = parseInt(hex.slice(1), 16);
  let r = ((n >> 16) & 255) / 255;
  let g = ((n >> 8) & 255) / 255;
  let b = (n & 255) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
    h /= 6;
  }
  h = (h + degrees / 360) % 1;
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  if (s === 0) {
    r = g = b = l;
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  const to = (x: number) => Math.round(x * 255).toString(16).padStart(2, '0');
  return `#${to(r)}${to(g)}${to(b)}`;
};

export function applyShinyPalette(pet: Pet): Pet {
  const shift = 120 + Math.floor(Math.random() * 120);
  return {
    ...pet,
    rarity: bumpRarity(pet.rarity),
    title: pet.title.startsWith('異色・') ? pet.title : `異色・${pet.title}`,
    genes: {
      ...pet.genes,
      primaryColor: rotateHue(pet.genes.primaryColor, shift),
      secondaryColor: rotateHue(pet.genes.secondaryColor, shift),
      glowColor: rotateHue(pet.genes.glowColor, shift),
      pattern: 'galaxy',
    },
  };
}

export function hatchPet(pet: Pet, species: HatchSpecies = rollHatchSpecies()): Pet {
  return {
    ...pet,
    stage: 'baby',
    speciesId: species.speciesId,
    name: species.name,
    title: species.title,
    element: species.element,
    rarity: species.rarity,
    genes: { ...species.genes },
    specialTrait: species.trait,
    hatchedAt: new Date().toISOString(),
    ...withLevelAtLeast(pet, HATCH_LEVEL),
  };
}

const withLevelAtLeast = (pet: Pet, level: number): Pick<Pet, 'level' | 'exp' | 'maxExp'> =>
  pet.level >= level
    ? { level: pet.level, exp: pet.exp, maxExp: pet.maxExp }
    : { level, exp: 0, maxExp: expForLevel(level) };

/** Advance the pet exactly one stage along its own evolution line. */
export function evolveOneStage(pet: Pet): Pet | null {
  if (pet.stage === 'egg') return hatchPet(pet);
  const next = getNextEvolution(pet);
  if (!next) return null;
  const line = getEvolutionLine(pet.speciesId)!;
  const isShiny = pet.title.startsWith('異色・');
  return {
    ...pet,
    stage: next.stage,
    speciesId: next.form.speciesId,
    name: next.form.name,
    title: isShiny ? `異色・${next.form.title}` : next.form.title,
    specialTrait: next.form.trait,
    rarity: maxRarity(isShiny ? bumpRarity(STAGE_MIN_RARITY[next.stage]) : STAGE_MIN_RARITY[next.stage], pet.rarity),
    ...withLevelAtLeast(pet, next.level),
    mood: 'ecstatic',
    genes: {
      ...pet.genes,
      wings: next.stage === 'juvenile' ? 'none' : line.adultWings,
      pattern: next.stage === 'ultimate' ? 'galaxy' : pet.genes.pattern,
    },
  };
}

export interface ExpGainResult {
  pet: Pet;
  levelsGained: number;
  hatched: boolean;
  evolvedStages: PetStage[];
  unlockedSpecies: string[];
}

/** Add EXP, handle level-ups, auto-hatch at Lv.2 and auto-evolve at each stage's level gate. */
export function applyExpGain(pet: Pet, gainedExp: number): ExpGainResult {
  let level = Math.max(1, pet.level || 1);
  let maxExp = expForLevel(level);
  let exp = Math.max(0, pet.exp || 0) + Math.max(0, gainedExp);
  let levelsGained = 0;
  while (exp >= maxExp) {
    exp -= maxExp;
    level += 1;
    maxExp = expForLevel(level);
    levelsGained += 1;
  }

  let current: Pet = { ...pet, exp, level, maxExp };
  let hatched = false;
  const evolvedStages: PetStage[] = [];
  const unlockedSpecies: string[] = [];

  if (current.stage === 'egg' && level >= HATCH_LEVEL) {
    current = hatchPet(current);
    hatched = true;
    unlockedSpecies.push(current.speciesId);
  }

  let next = getNextEvolution(current);
  while (next && current.level >= next.level) {
    const evolved = evolveOneStage(current);
    if (!evolved) break;
    current = evolved;
    evolvedStages.push(current.stage);
    unlockedSpecies.push(current.speciesId);
    next = getNextEvolution(current);
  }

  return { pet: current, levelsGained, hatched, evolvedStages, unlockedSpecies };
}

import { Pet, PetElement, PetGenes, PetRarity } from '../types';

export type PetArchetype =
  | 'dragon'
  | 'fox'
  | 'deer'
  | 'bird'
  | 'cat'
  | 'unicorn'
  | 'robot'
  | 'bunny'
  | 'penguin'
  | 'slime'
  | 'panda';

const SPECIES_ARCHETYPE: Record<string, PetArchetype> = {
  p_fire_dragon_1: 'dragon',
  p_fire_dragon_2: 'dragon',
  p_fire_ultimate: 'dragon',
  p_frost_fox_1: 'fox',
  p_frost_ultimate: 'fox',
  p_nature_deer_1: 'deer',
  p_nature_ultimate: 'deer',
  p_thunder_chick_1: 'bird',
  p_thunder_falcon_1: 'bird',
  p_void_kitten_1: 'cat',
  p_void_shadow_1: 'cat',
  p_radiant_angel_1: 'unicorn',
  p_cyber_mecha_ultimate: 'robot',
  p_radiant_bunny_1: 'bunny',
  p_frost_penguin_1: 'penguin',
  p_void_slime_1: 'slime',
  p_nature_panda_1: 'panda',
};

const ELEMENT_ARCHETYPE: Record<PetElement, PetArchetype> = {
  flame: 'dragon',
  frost: 'fox',
  nature: 'deer',
  thunder: 'bird',
  void: 'cat',
  radiant: 'unicorn',
  cyber: 'robot',
};

export const getPetArchetype = (pet: Pick<Pet, 'speciesId' | 'element'> | undefined): PetArchetype =>
  SPECIES_ARCHETYPE[pet?.speciesId || ''] ||
  getEvolutionLine(pet?.speciesId || '')?.archetype ||
  ELEMENT_ARCHETYPE[pet?.element || 'flame'] ||
  'dragon';

export interface HatchSpecies {
  speciesId: string;
  name: string;
  title: string;
  element: PetElement;
  rarity: PetRarity;
  weight: number;
  trait: string;
  genes: PetGenes;
}

export const HATCH_POOL: HatchSpecies[] = [
  {
    speciesId: 'p_fire_dragon_1',
    name: '熾焰火蜥幼體',
    title: '破殼晨光幼龍',
    element: 'flame',
    rarity: 'common',
    weight: 3,
    trait: '火花共鳴：連續答對 3 題獲得額外經驗值！',
    genes: {
      element: 'flame', pattern: 'plain', horns: 'none', wings: 'none', particle: 'fire',
      primaryColor: '#FB923C', secondaryColor: '#EA580C', glowColor: '#FDE68A',
    },
  },
  {
    speciesId: 'p_frost_fox_1',
    name: '霜晶小狐',
    title: '雪原絨毛幼狐',
    element: 'frost',
    rarity: 'common',
    weight: 3,
    trait: '冰晶洞察：易混淆字辨識更敏銳！',
    genes: {
      element: 'frost', pattern: 'plain', horns: 'none', wings: 'none', particle: 'snowflakes',
      primaryColor: '#7DD3FC', secondaryColor: '#0EA5E9', glowColor: '#E0F2FE',
    },
  },
  {
    speciesId: 'p_nature_deer_1',
    name: '翡翠森幼鹿',
    title: '嫩芽森林幼鹿',
    element: 'nature',
    rarity: 'common',
    weight: 3,
    trait: '生機盎然：每日學習恢復額外生命力！',
    genes: {
      element: 'nature', pattern: 'plain', horns: 'none', wings: 'none', particle: 'sparkles',
      primaryColor: '#D6A77A', secondaryColor: '#A16207', glowColor: '#BBF7D0',
    },
  },
  {
    speciesId: 'p_radiant_bunny_1',
    name: '棉花糖月兔',
    title: '軟綿綿月光兔',
    element: 'radiant',
    rarity: 'common',
    weight: 3,
    trait: '蹦蹦跳跳：複習時有機率獲得雙倍金幣！',
    genes: {
      element: 'radiant', pattern: 'plain', horns: 'none', wings: 'none', particle: 'sparkles',
      primaryColor: '#FBCFE8', secondaryColor: '#F472B6', glowColor: '#FFF1F2',
    },
  },
  {
    speciesId: 'p_frost_penguin_1',
    name: '冰河小企鵝',
    title: '搖搖擺擺小紳士',
    element: 'frost',
    rarity: 'common',
    weight: 3,
    trait: '冰上滑行：連勝中斷時保留一半連勝紀錄！',
    genes: {
      element: 'frost', pattern: 'plain', horns: 'none', wings: 'none', particle: 'snowflakes',
      primaryColor: '#64748B', secondaryColor: '#3B82F6', glowColor: '#BAE6FD',
    },
  },
  {
    speciesId: 'p_nature_panda_1',
    name: '竹林糰子熊貓',
    title: '圓滾滾竹林寶寶',
    element: 'nature',
    rarity: 'rare',
    weight: 2,
    trait: '竹葉能量：餵食效果提升 20%！',
    genes: {
      element: 'nature', pattern: 'plain', horns: 'none', wings: 'none', particle: 'sparkles',
      primaryColor: '#F8FAFC', secondaryColor: '#CBD5E1', glowColor: '#BBF7D0',
    },
  },
  {
    speciesId: 'p_thunder_chick_1',
    name: '奔雷雛鳥',
    title: '毛茸茸電光雛',
    element: 'thunder',
    rarity: 'rare',
    weight: 2,
    trait: '電光石火：限時測驗額外加時 3 秒！',
    genes: {
      element: 'thunder', pattern: 'plain', horns: 'none', wings: 'none', particle: 'lightning',
      primaryColor: '#FDE047', secondaryColor: '#EAB308', glowColor: '#FEF9C3',
    },
  },
  {
    speciesId: 'p_void_kitten_1',
    name: '暗夜小咪',
    title: '月牙夜行貓咪',
    element: 'void',
    rarity: 'rare',
    weight: 2,
    trait: '夜貓專注：晚上複習經驗值 +15%！',
    genes: {
      element: 'void', pattern: 'plain', horns: 'none', wings: 'none', particle: 'stardust',
      primaryColor: '#A78BFA', secondaryColor: '#6D28D9', glowColor: '#EDE9FE',
    },
  },
  {
    speciesId: 'p_void_slime_1',
    name: '星夜果凍史萊姆',
    title: 'Q 彈星空果凍',
    element: 'void',
    rarity: 'epic',
    weight: 1,
    trait: '彈性記憶：答錯時有機率不扣連勝！',
    genes: {
      element: 'void', pattern: 'galaxy', horns: 'none', wings: 'none', particle: 'stardust',
      primaryColor: '#C4B5FD', secondaryColor: '#818CF8', glowColor: '#F5F3FF',
    },
  },
  {
    speciesId: 'p_cyber_bot_1',
    name: '迷你機器寶寶',
    title: '嗶嗶運算小助手',
    element: 'cyber',
    rarity: 'rare',
    weight: 2,
    trait: '精準運算：拼字題答對額外獲得 5 金幣！',
    genes: {
      element: 'cyber', pattern: 'neon', horns: 'none', wings: 'none', particle: 'neon_grid',
      primaryColor: '#67E8F9', secondaryColor: '#0891B2', glowColor: '#CFFAFE',
    },
  },
  {
    speciesId: 'p_radiant_pony_1',
    name: '彩虹小獨角獸',
    title: '夢幻彩虹小馬',
    element: 'radiant',
    rarity: 'epic',
    weight: 1,
    trait: '彩虹祝福：每日首次測驗經驗值 +20%！',
    genes: {
      element: 'radiant', pattern: 'aurora', horns: 'none', wings: 'none', particle: 'sparkles',
      primaryColor: '#F5F3FF', secondaryColor: '#C4B5FD', glowColor: '#FEF9C3',
    },
  },
];

export type EvolvedStage = 'juvenile' | 'adult' | 'ultimate';

export interface EvolutionForm {
  speciesId: string;
  name: string;
  title: string;
  trait: string;
  description: string;
  iconSymbol: string;
}

export interface EvolutionLine {
  baby: string;
  archetype: PetArchetype;
  element: PetElement;
  adultWings: PetGenes['wings'];
  forms: Record<EvolvedStage, EvolutionForm>;
}

export const EVOLUTION_LEVELS: Record<EvolvedStage, number> = {
  juvenile: 10,
  adult: 20,
  ultimate: 35,
};

export const STAGE_MIN_RARITY: Record<EvolvedStage, PetRarity> = {
  juvenile: 'rare',
  adult: 'epic',
  ultimate: 'legendary',
};

export const EVOLUTION_LINES: EvolutionLine[] = [
  {
    baby: 'p_fire_dragon_1', archetype: 'dragon', element: 'flame', adultWings: 'dragon',
    forms: {
      juvenile: { speciesId: 'p_fire_dragon_j', name: '熔火幼龍', title: '火苗少年龍', iconSymbol: '🦖',
        trait: '熔火專注：連續答對 5 題經驗值 +10%', description: '尾巴的火焰越燒越旺，頭頂長出小小龍角，開始學會噴出火球。' },
      adult: { speciesId: 'p_fire_dragon_2', name: '烈焰翼龍', title: '赤焰天空霸主', iconSymbol: '🔥',
        trait: '烈火連擊：連勝時額外獲得 15% 金幣', description: '背部長出燃燒的火紅雙翼，記憶力宛如烈焰般熾盛。' },
      ultimate: { speciesId: 'p_fire_ultimate', name: '恆星日珥神龍', title: '日珥天體霸主', iconSymbol: '🐲',
        trait: '過目不忘：背單字經驗與金幣永久 +25%', description: '周身纏繞日珥烈焰的終極神龍，羽翼如天體般熾熱。' },
    },
  },
  {
    baby: 'p_frost_fox_1', archetype: 'fox', element: 'frost', adultWings: 'none',
    forms: {
      juvenile: { speciesId: 'p_frost_fox_j', name: '寒霜幻月狐', title: '月下雪原狐', iconSymbol: '🌙',
        trait: '冰晶洞察：易混淆字題目顯示提示', description: '絨毛變得更加蓬鬆，在月光下會閃爍霜晶光芒。' },
      adult: { speciesId: 'p_frost_fox_a', name: '霜月雙尾狐', title: '極地雙尾靈狐', iconSymbol: '🦊',
        trait: '雙尾守護：連勝中斷時保留 50% 連勝', description: '長出第二條尾巴，能凍結時間片刻讓主人思考。' },
      ultimate: { speciesId: 'p_frost_ultimate', name: '極光永凍九尾', title: '極光守護仙靈', iconSymbol: '❄️',
        trait: '極光護盾：每日複習護盾防止連勝中斷', description: '吸收極光符文昇華的至高神獸，能釋放凍結時間的極光領域。' },
    },
  },
  {
    baby: 'p_nature_deer_1', archetype: 'deer', element: 'nature', adultWings: 'none',
    forms: {
      juvenile: { speciesId: 'p_nature_deer_j', name: '翡翠森鹿', title: '嫩芽林間鹿', iconSymbol: '🌿',
        trait: '生機盎然：每日學習恢復額外生命力', description: '鹿角開始分岔並冒出新芽，走過的地方會長出小花。' },
      adult: { speciesId: 'p_nature_deer_a', name: '靈木先知', title: '森林智慧守護者', iconSymbol: '🦌',
        trait: '先知之眼：每日推薦最該複習的單字', description: '鹿角化為靈木枝枒，能感知主人即將遺忘的單字。' },
      ultimate: { speciesId: 'p_nature_ultimate', name: '世界之樹守護靈', title: '萬木之源', iconSymbol: '🌳',
        trait: '生命光環：寵物永不陷入虛弱狀態', description: '紮根於知識之泉的遠古靈獸，全身綻放翠玉光芒。' },
    },
  },
  {
    baby: 'p_radiant_bunny_1', archetype: 'bunny', element: 'radiant', adultWings: 'fairy',
    forms: {
      juvenile: { speciesId: 'p_radiant_bunny_j', name: '月宮兔', title: '月光蹦跳兔', iconSymbol: '🐇',
        trait: '蹦蹦跳跳：複習時有機率雙倍金幣', description: '耳朵變得更長，會在月光下搗製記憶麻糬。' },
      adult: { speciesId: 'p_radiant_bunny_a', name: '星輝月宮兔', title: '月光仙子', iconSymbol: '🌕',
        trait: '月光祝福：夜間複習經驗值 +20%', description: '背後長出輕盈的仙子翅膀，能在夜空中留下星光足跡。' },
      ultimate: { speciesId: 'p_radiant_bunny_u', name: '星輝月神兔', title: '廣寒月神', iconSymbol: '🎑',
        trait: '月神庇佑：每週一次自動補簽連勝', description: '成為月宮之主的神兔，周身環繞著滿月光環。' },
    },
  },
  {
    baby: 'p_frost_penguin_1', archetype: 'penguin', element: 'frost', adultWings: 'none',
    forms: {
      juvenile: { speciesId: 'p_frost_penguin_j', name: '冰原少年企鵝', title: '滑冰小紳士', iconSymbol: '⛸️',
        trait: '冰上滑行：連勝中斷時保留一半紀錄', description: '學會在冰面上高速滑行，頭頂的呆毛更翹了。' },
      adult: { speciesId: 'p_frost_penguin_a', name: '極地帝王企鵝', title: '冰原統領', iconSymbol: '🐧',
        trait: '帝王威嚴：每日任務獎勵 +20%', description: '體型變得威風凜凜，能帶領整群企鵝背單字。' },
      ultimate: { speciesId: 'p_frost_penguin_u', name: '冰晶帝皇企鵝', title: '永凍冰晶皇帝', iconSymbol: '👑',
        trait: '冰晶皇權：測驗全對時獲得額外進化結晶', description: '身披冰晶戰甲的企鵝皇帝，一聲令下冰河為之凍結。' },
    },
  },
  {
    baby: 'p_nature_panda_1', archetype: 'panda', element: 'nature', adultWings: 'none',
    forms: {
      juvenile: { speciesId: 'p_nature_panda_j', name: '翠竹熊貓', title: '竹林修行者', iconSymbol: '🎋',
        trait: '竹葉能量：餵食效果提升 20%', description: '開始在竹林裡練功，吃竹子的速度快了一倍。' },
      adult: { speciesId: 'p_nature_panda_a', name: '翠竹武僧熊貓', title: '竹林武道家', iconSymbol: '🐼',
        trait: '武僧定力：答錯不扣寵物心情', description: '修練有成的熊貓武僧，一掌就能劈開所有記憶盲點。' },
      ultimate: { speciesId: 'p_nature_panda_u', name: '竹林仙尊熊貓', title: '竹海仙尊', iconSymbol: '🏯',
        trait: '仙尊心法：複習間隔最佳化 +15%', description: '得道成仙的熊貓，坐在竹海之巔守護所有學習者。' },
    },
  },
  {
    baby: 'p_thunder_chick_1', archetype: 'bird', element: 'thunder', adultWings: 'none',
    forms: {
      juvenile: { speciesId: 'p_thunder_chick_j', name: '雷羽少鳥', title: '閃電飛羽', iconSymbol: '🐦',
        trait: '電光石火：限時題額外加時 3 秒', description: '羽毛開始帶電，拍動翅膀時會劈啪作響。' },
      adult: { speciesId: 'p_thunder_falcon_1', name: '奔雷電隼', title: '雷霆獵手', iconSymbol: '⚡',
        trait: '疾風思維：快速作答獎勵 +15%', description: '閃爍金黃雷光的高速猛禽，思維如閃電般迅捷。' },
      ultimate: { speciesId: 'p_thunder_ultimate', name: '宙斯雷霆天鷹', title: '萬雷之王', iconSymbol: '🦅',
        trait: '雷神之怒：全對時觸發雷霆特效並雙倍金幣', description: '掌控天空雷霆的神鷹，每次振翅都伴隨萬道雷光。' },
    },
  },
  {
    baby: 'p_void_kitten_1', archetype: 'cat', element: 'void', adultWings: 'dragon',
    forms: {
      juvenile: { speciesId: 'p_void_kitten_j', name: '幽影貓', title: '月牙夜行者', iconSymbol: '🌑',
        trait: '夜貓專注：晚上複習經驗值 +15%', description: '能融入影子之中，夜深時眼睛會發出紫色微光。' },
      adult: { speciesId: 'p_void_shadow_1', name: '虛空暗夜噬魂貓', title: '暗夜貓妖', iconSymbol: '🐱',
        trait: '吞噬盲點：易錯單字複習經驗 +30%', description: '全身散發幽紫暗影的神秘貓妖，喜愛吞噬背誦盲點。' },
      ultimate: { speciesId: 'p_void_ultimate', name: '虛空幽影貓神', title: '深淵夜之女王', iconSymbol: '🔮',
        trait: '虛空吞噬：每日自動清除 1 個易錯標記', description: '統御虛空的貓神，雙翼展開時整片夜空都為之黯淡。' },
    },
  },
  {
    baby: 'p_void_slime_1', archetype: 'slime', element: 'void', adultWings: 'none',
    forms: {
      juvenile: { speciesId: 'p_void_slime_j', name: '星雲果凍', title: '彈跳星雲', iconSymbol: '🌌',
        trait: '彈性記憶：答錯時有機率不扣連勝', description: '體內的星光越來越多，彈跳時會灑下星塵。' },
      adult: { speciesId: 'p_void_slime_a', name: '銀河王冠史萊姆', title: '果凍國王', iconSymbol: '🫧',
        trait: '果凍分裂：每日測驗額外 +3 題獎勵', description: '頭頂凝結出星光王冠，成為所有史萊姆的國王。' },
      ultimate: { speciesId: 'p_void_slime_u', name: '宇宙史萊姆王', title: '吞噬星河之主', iconSymbol: '🪐',
        trait: '星河吞噬：所有經驗值獲得 +20%', description: '體內蘊含一整個銀河系的終極史萊姆。' },
    },
  },
  {
    baby: 'p_cyber_bot_1', archetype: 'robot', element: 'cyber', adultWings: 'mecha',
    forms: {
      juvenile: { speciesId: 'p_cyber_bot_j', name: '齒輪機器少年', title: '升級運算核心', iconSymbol: '⚙️',
        trait: '精準運算：拼字題答對額外 +5 金幣', description: '升級了運算核心，天線能接收單字資料庫訊號。' },
      adult: { speciesId: 'p_cyber_bot_a', name: '量子守衛機甲', title: '矩陣守衛者', iconSymbol: '🛡️',
        trait: '量子備份：遺忘的單字自動加入複習', description: '裝上推進機翼的守衛機甲，能掃描並修復記憶漏洞。' },
      ultimate: { speciesId: 'p_cyber_mecha_ultimate', name: '量子神經機械龍', title: '超維度矩陣支配者', iconSymbol: '🤖',
        trait: '量子運算：複習效率提高 30%', description: '超維度機械神獸，全身環繞量子矩陣粒子。' },
    },
  },
  {
    baby: 'p_radiant_pony_1', archetype: 'unicorn', element: 'radiant', adultWings: 'fairy',
    forms: {
      juvenile: { speciesId: 'p_radiant_pony_j', name: '晨曦小天馬', title: '破曉彩虹馬', iconSymbol: '🌈',
        trait: '彩虹祝福：每日首次測驗經驗值 +20%', description: '鬃毛染上晨曦的七彩光芒，獨角開始閃閃發亮。' },
      adult: { speciesId: 'p_radiant_angel_1', name: '輝光聖翼獨角獸', title: '聖光守護者', iconSymbol: '🦄',
        trait: '聖光淨化：每日淨化 1 個錯誤單字', description: '角尖能綻放破曉晨光，展開聖翼淨化所有錯誤單字。' },
      ultimate: { speciesId: 'p_radiant_ultimate', name: '破曉聖光天角獸', title: '黎明女神', iconSymbol: '✨',
        trait: '黎明降臨：連續登入獎勵翻倍', description: '化身黎明本身的神聖天角獸，所到之處皆為白晝。' },
    },
  },
];

export function getEvolutionLine(speciesId: string): EvolutionLine | undefined {
  return EVOLUTION_LINES.find(
    l => l.baby === speciesId || Object.values(l.forms).some(f => f.speciesId === speciesId)
  );
}

export const rollHatchSpecies = (): HatchSpecies => {
  const total = HATCH_POOL.reduce((sum, s) => sum + s.weight, 0);
  let roll = Math.random() * total;
  for (const species of HATCH_POOL) {
    roll -= species.weight;
    if (roll <= 0) return species;
  }
  return HATCH_POOL[0];
};

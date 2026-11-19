import { Item, PetCustomization, ShopCategory, ShopCurrency } from '../types';
import { INITIAL_ITEMS } from './bestiary';

export type ShopGrantKind = 'item' | 'cosmetic';

export interface ShopOffer {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: ShopCategory;
  currency: ShopCurrency;
  price: number;
  /** Max purchases per calendar day; omit = unlimited */
  dailyLimit?: number;
  /** Max purchases per ISO week; omit = unlimited */
  weeklyLimit?: number;
  grant: {
    kind: ShopGrantKind;
    /** Inventory item id when kind === 'item' */
    itemId?: string;
    amount?: number;
    /** Cosmetic unlock key when kind === 'cosmetic' */
    cosmeticKey?: string;
  };
}

export const FREE_COSMETICS = ['hat_none', 'acc_none', 'theme_forest'] as const;

export const hatCosmeticKey = (hat: PetCustomization['hat']) => `hat_${hat}`;
export const accCosmeticKey = (acc: PetCustomization['accessory']) => `acc_${acc}`;
export const themeCosmeticKey = (theme: PetCustomization['backgroundTheme']) => `theme_${theme}`;

export const SHOP_CATALOG: ShopOffer[] = [
  {
    id: 'shop_apple',
    name: '智慧金蘋果',
    description: '飽食 +30、生命 +20、經驗 +15。不重置出走計時。',
    icon: '🍎',
    category: 'consumable',
    currency: 'coins',
    price: 40,
    dailyLimit: 5,
    grant: { kind: 'item', itemId: 'item_apple', amount: 1 },
  },
  {
    id: 'shop_cookie',
    name: '艾賓豪斯記憶餅乾',
    description: '飽食 +25、經驗 +50。不重置出走計時。',
    icon: '🍪',
    category: 'consumable',
    currency: 'coins',
    price: 80,
    dailyLimit: 3,
    grant: { kind: 'item', itemId: 'item_cookie', amount: 1 },
  },
  {
    id: 'shop_elixir',
    name: '生命復元藥水',
    description: '生命回滿、飽食 +50。不會清除出走計時，仍需複習。',
    icon: '🧪',
    category: 'consumable',
    currency: 'coins',
    price: 120,
    dailyLimit: 2,
    grant: { kind: 'item', itemId: 'item_elixir', amount: 1 },
  },
  {
    id: 'shop_stone',
    name: '進化結晶',
    description: '立即進化一階，並獲得 +100 經驗。',
    icon: '🔮',
    category: 'evolution',
    currency: 'coins',
    price: 500,
    dailyLimit: 1,
    grant: { kind: 'item', itemId: 'item_stone_fire', amount: 1 },
  },
  {
    id: 'shop_mutation_core',
    name: '異色變異核心',
    description: '進化＋異色（+300 EXP）；最終型態可只改色。',
    icon: '💠',
    category: 'evolution',
    currency: 'diamonds',
    price: 8,
    weeklyLimit: 1,
    grant: { kind: 'item', itemId: 'item_mutation_core', amount: 1 },
  },
  {
    id: 'shop_escape_amulet',
    name: '羈絆護符',
    description: '立刻歸零未複習天數並刷新陪伴，避免出走。',
    icon: '🛡️',
    category: 'consumable',
    currency: 'diamonds',
    price: 3,
    weeklyLimit: 1,
    grant: { kind: 'item', itemId: 'item_escape_amulet', amount: 1 },
  },
  {
    id: 'shop_hat_wizard',
    name: '賢者魔術帽',
    description: '永久解鎖頭部飾品。',
    icon: '🧙',
    category: 'cosmetic',
    currency: 'coins',
    price: 120,
    grant: { kind: 'cosmetic', cosmeticKey: 'hat_wizard_hat' },
  },
  {
    id: 'shop_hat_headphones',
    name: '電競潮流耳機',
    description: '永久解鎖頭部飾品。',
    icon: '🎧',
    category: 'cosmetic',
    currency: 'coins',
    price: 120,
    grant: { kind: 'cosmetic', cosmeticKey: 'hat_headphones' },
  },
  {
    id: 'shop_hat_sunglasses',
    name: '復古酷炫墨鏡',
    description: '永久解鎖頭部飾品。',
    icon: '🕶️',
    category: 'cosmetic',
    currency: 'coins',
    price: 120,
    grant: { kind: 'cosmetic', cosmeticKey: 'hat_sunglasses' },
  },
  {
    id: 'shop_hat_grad',
    name: '學霸學士帽',
    description: '永久解鎖頭部飾品。',
    icon: '🎓',
    category: 'cosmetic',
    currency: 'coins',
    price: 180,
    grant: { kind: 'cosmetic', cosmeticKey: 'hat_graduation_cap' },
  },
  {
    id: 'shop_hat_crown',
    name: '神聖王者王冠',
    description: '永久解鎖稀有頭部飾品。',
    icon: '👑',
    category: 'cosmetic',
    currency: 'coins',
    price: 300,
    grant: { kind: 'cosmetic', cosmeticKey: 'hat_crown' },
  },
  {
    id: 'shop_acc_medal',
    name: '榮譽英豪勳章',
    description: '永久解鎖配件。',
    icon: '🎖️',
    category: 'cosmetic',
    currency: 'coins',
    price: 150,
    grant: { kind: 'cosmetic', cosmeticKey: 'acc_medal' },
  },
  {
    id: 'shop_acc_cape',
    name: '夜幕王者披風',
    description: '永久解鎖配件。',
    icon: '🦸',
    category: 'cosmetic',
    currency: 'coins',
    price: 150,
    grant: { kind: 'cosmetic', cosmeticKey: 'acc_cape' },
  },
  {
    id: 'shop_acc_orb',
    name: '魔力環繞寶珠',
    description: '永久解鎖配件。',
    icon: '🟣',
    category: 'cosmetic',
    currency: 'coins',
    price: 150,
    grant: { kind: 'cosmetic', cosmeticKey: 'acc_magic_orb' },
  },
  {
    id: 'shop_acc_star',
    name: '星光徽章',
    description: '永久解鎖稀有配件。',
    icon: '⭐',
    category: 'cosmetic',
    currency: 'coins',
    price: 250,
    grant: { kind: 'cosmetic', cosmeticKey: 'acc_star_badge' },
  },
  {
    id: 'shop_theme_volcano',
    name: '火山聖域背景',
    description: '永久解鎖寵物展示背景。',
    icon: '🌋',
    category: 'theme',
    currency: 'coins',
    price: 200,
    grant: { kind: 'cosmetic', cosmeticKey: 'theme_volcano' },
  },
  {
    id: 'shop_theme_heaven',
    name: '天際聖光背景',
    description: '永久解鎖寵物展示背景。',
    icon: '☁️',
    category: 'theme',
    currency: 'coins',
    price: 200,
    grant: { kind: 'cosmetic', cosmeticKey: 'theme_heaven' },
  },
  {
    id: 'shop_theme_cosmic',
    name: '宇宙星雲背景',
    description: '永久解鎖高級展示背景。',
    icon: '🌌',
    category: 'theme',
    currency: 'diamonds',
    price: 4,
    grant: { kind: 'cosmetic', cosmeticKey: 'theme_cosmic' },
  },
  {
    id: 'shop_theme_cyber',
    name: '賽博都市背景',
    description: '永久解鎖高級展示背景。',
    icon: '🌃',
    category: 'theme',
    currency: 'diamonds',
    price: 4,
    grant: { kind: 'cosmetic', cosmeticKey: 'theme_cyberpunk' },
  },
];

export const getShopOffer = (id: string) => SHOP_CATALOG.find(o => o.id === id);

export const itemTemplate = (itemId: string): Item | undefined =>
  INITIAL_ITEMS.find(i => i.id === itemId);

/** Monday-based ISO-ish week key for weekly limits / leaderboard rewards */
export function isoWeekKey(d = new Date()): string {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${date.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}

export function todayKey(d = new Date()): string {
  return d.toISOString().split('T')[0];
}

export const WEEKLY_LEADERBOARD_DIAMONDS: Record<number, number> = {
  1: 5,
  2: 3,
  3: 1,
};

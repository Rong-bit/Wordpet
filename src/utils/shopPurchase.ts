import { Item, UserProfile } from '../types';
import {
  FREE_COSMETICS,
  ShopOffer,
  getShopOffer,
  isoWeekKey,
  itemTemplate,
  todayKey,
} from '../data/shop';

export interface PurchaseResult {
  ok: boolean;
  error?: string;
  profile: UserProfile;
  items: Item[];
  message?: string;
}

const ensureShopDaily = (profile: UserProfile): UserProfile => {
  const today = todayKey();
  if (profile.shopDaily?.date === today) return profile;
  return { ...profile, shopDaily: { date: today, bought: {} } };
};

export const getUnlockedCosmetics = (profile: UserProfile): string[] => {
  const base = profile.unlockedCosmetics || [];
  return Array.from(new Set([...FREE_COSMETICS, ...base]));
};

export const isCosmeticUnlocked = (profile: UserProfile, key: string): boolean =>
  getUnlockedCosmetics(profile).includes(key);

export const boughtToday = (profile: UserProfile, offerId: string): number => {
  const p = ensureShopDaily(profile);
  if (p.shopDaily?.date !== todayKey()) return 0;
  return p.shopDaily?.bought[offerId] || 0;
};

/** Weekly purchases stored as `weekKey::offerId` inside shopDaily.bought for simplicity */
export const boughtThisWeek = (profile: UserProfile, offerId: string): number => {
  const key = `${isoWeekKey()}::${offerId}`;
  return profile.shopDaily?.bought[key] || 0;
};

export function purchaseShopOffer(
  offerId: string,
  profile: UserProfile,
  items: Item[]
): PurchaseResult {
  const offer = getShopOffer(offerId);
  if (!offer) return { ok: false, error: '找不到商品', profile, items };

  let nextProfile = ensureShopDaily(profile);
  const unlocked = getUnlockedCosmetics(nextProfile);

  if (offer.grant.kind === 'cosmetic' && offer.grant.cosmeticKey) {
    if (unlocked.includes(offer.grant.cosmeticKey)) {
      return { ok: false, error: '已擁有此外觀', profile: nextProfile, items };
    }
  }

  if (offer.dailyLimit != null) {
    const used = boughtToday(nextProfile, offer.id);
    if (used >= offer.dailyLimit) {
      return { ok: false, error: '今日已達購買上限', profile: nextProfile, items };
    }
  }

  if (offer.weeklyLimit != null) {
    const used = boughtThisWeek(nextProfile, offer.id);
    if (used >= offer.weeklyLimit) {
      return { ok: false, error: '本週已達購買上限', profile: nextProfile, items };
    }
  }

  if (offer.currency === 'coins') {
    if (nextProfile.coins < offer.price) {
      return { ok: false, error: '金幣不足', profile: nextProfile, items };
    }
    nextProfile = { ...nextProfile, coins: nextProfile.coins - offer.price };
  } else {
    if (nextProfile.diamonds < offer.price) {
      return { ok: false, error: '鑽石不足', profile: nextProfile, items };
    }
    nextProfile = { ...nextProfile, diamonds: nextProfile.diamonds - offer.price };
  }

  const bought = { ...(nextProfile.shopDaily?.bought || {}) };
  bought[offer.id] = (bought[offer.id] || 0) + 1;
  if (offer.weeklyLimit != null) {
    const wk = `${isoWeekKey()}::${offer.id}`;
    bought[wk] = (bought[wk] || 0) + 1;
  }
  nextProfile = {
    ...nextProfile,
    shopDaily: { date: todayKey(), bought },
  };

  let nextItems = items.map(i => ({ ...i }));

  if (offer.grant.kind === 'item' && offer.grant.itemId) {
    const amount = offer.grant.amount || 1;
    const tmpl = itemTemplate(offer.grant.itemId);
    const idx = nextItems.findIndex(i => i.id === offer.grant.itemId);
    if (idx >= 0) {
      nextItems[idx] = { ...nextItems[idx], count: nextItems[idx].count + amount };
    } else if (tmpl) {
      nextItems = [...nextItems, { ...tmpl, count: amount }];
    } else {
      return { ok: false, error: '道具資料缺失', profile, items };
    }
  }

  if (offer.grant.kind === 'cosmetic' && offer.grant.cosmeticKey) {
    nextProfile = {
      ...nextProfile,
      unlockedCosmetics: Array.from(new Set([...unlocked, offer.grant.cosmeticKey])),
    };
  }

  return {
    ok: true,
    profile: nextProfile,
    items: nextItems,
    message: `已購買「${offer.name}」`,
  };
}

export function offerRemainingLabel(offer: ShopOffer, profile: UserProfile): string | null {
  if (offer.dailyLimit != null) {
    const left = offer.dailyLimit - boughtToday(profile, offer.id);
    return `今日剩餘 ${Math.max(0, left)}/${offer.dailyLimit}`;
  }
  if (offer.weeklyLimit != null) {
    const left = offer.weeklyLimit - boughtThisWeek(profile, offer.id);
    return `本週剩餘 ${Math.max(0, left)}/${offer.weeklyLimit}`;
  }
  return null;
}

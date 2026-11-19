import React, { useMemo, useState } from 'react';
import { Item, UserProfile } from '../types';
import { SHOP_CATALOG, ShopOffer } from '../data/shop';
import {
  boughtThisWeek,
  boughtToday,
  getUnlockedCosmetics,
  offerRemainingLabel,
  purchaseShopOffer,
} from '../utils/shopPurchase';
import { soundFx } from '../utils/sound';
import { ShoppingBag, X } from 'lucide-react';

type Tab = 'consumable' | 'evolution' | 'cosmetic' | 'theme';

interface ShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  items: Item[];
  onPurchase: (profile: UserProfile, items: Item[], message: string) => void;
  onToast: (msg: string) => void;
}

const TABS: { id: Tab; label: string }[] = [
  { id: 'consumable', label: '消耗品' },
  { id: 'evolution', label: '進化' },
  { id: 'cosmetic', label: '裝扮' },
  { id: 'theme', label: '背景' },
];

export const ShopModal: React.FC<ShopModalProps> = ({
  isOpen,
  onClose,
  profile,
  items,
  onPurchase,
  onToast,
}) => {
  const [tab, setTab] = useState<Tab>('consumable');
  const unlocked = useMemo(() => getUnlockedCosmetics(profile), [profile]);
  const list = useMemo(() => SHOP_CATALOG.filter(o => o.category === tab), [tab]);

  if (!isOpen) return null;

  const handleBuy = (offer: ShopOffer) => {
    const result = purchaseShopOffer(offer.id, profile, items);
    if (!result.ok) {
      onToast(result.error || '無法購買');
      return;
    }
    soundFx.playFeed();
    onPurchase(result.profile, result.items, result.message || '購買成功');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg max-h-[90dvh] overflow-hidden rounded-3xl border border-slate-700 bg-slate-900 shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-amber-400" />
            <h3 className="text-lg font-bold font-fun text-white">冒險商店</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-5 py-2.5 flex items-center gap-3 border-b border-slate-800 bg-slate-950/40">
          <span className="text-sm font-bold text-amber-300">🪙 {profile.coins}</span>
          <span className="text-sm font-bold text-sky-300">💎 {profile.diamonds}</span>
        </div>

        <div className="flex gap-1 px-4 pt-3">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 rounded-xl px-2 py-1.5 text-xs font-bold transition-colors ${
                tab === t.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-800/60 text-slate-400 hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {list.map(offer => {
            const owned =
              offer.grant.kind === 'cosmetic' &&
              !!offer.grant.cosmeticKey &&
              unlocked.includes(offer.grant.cosmeticKey);
            const remain = offerRemainingLabel(offer, profile);
            const limitedOut =
              (offer.dailyLimit != null && boughtToday(profile, offer.id) >= offer.dailyLimit) ||
              (offer.weeklyLimit != null && boughtThisWeek(profile, offer.id) >= offer.weeklyLimit);

            return (
              <div
                key={offer.id}
                className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-950/50 p-3"
              >
                <span className="text-2xl shrink-0">{offer.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">{offer.name}</p>
                  <p className="text-[11px] text-slate-400 leading-snug">{offer.description}</p>
                  {remain && <p className="text-[10px] text-slate-500 mt-0.5">{remain}</p>}
                </div>
                {owned ? (
                  <span className="shrink-0 rounded-xl bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-1.5 text-[11px] font-bold text-emerald-300">
                    已擁有
                  </span>
                ) : (
                  <button
                    disabled={limitedOut}
                    onClick={() => handleBuy(offer)}
                    className="shrink-0 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:bg-slate-700 disabled:text-slate-500 px-3 py-1.5 text-xs font-bold text-slate-950 transition-colors"
                  >
                    {offer.currency === 'coins' ? `🪙 ${offer.price}` : `💎 ${offer.price}`}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

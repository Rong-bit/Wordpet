import React from 'react';
import { Item, Pet, UserProfile } from '../types';
import { soundFx } from '../utils/sound';
import { X, Backpack, Utensils, Zap, Sparkles } from 'lucide-react';

interface InventoryModalProps {
  items: Item[];
  pet: Pet;
  profile: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onUseItem: (item: Item) => void;
}

export const InventoryModal: React.FC<InventoryModalProps> = ({
  items,
  pet,
  profile,
  isOpen,
  onClose,
  onUseItem,
}) => {
  if (!isOpen) return null;

  const rarityBorders = {
    common: 'border-slate-700 bg-slate-800/40',
    rare: 'border-blue-500/40 bg-blue-950/20',
    epic: 'border-purple-500/40 bg-purple-950/20',
    legendary: 'border-amber-500/40 bg-amber-950/20',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl max-h-[85vh] overflow-hidden rounded-3xl border border-slate-700 bg-slate-900 p-6 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Backpack className="h-5 w-5 text-indigo-400" />
            <h3 className="text-xl font-bold font-fun text-white">探險家背包與道具庫</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Currency header */}
        <div className="my-4 flex items-center justify-between rounded-2xl bg-slate-950/70 p-3.5 border border-slate-800">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="text-base">🪙</span>
              <span className="text-sm font-bold text-amber-300">{profile.coins}</span>
              <span className="text-[11px] text-slate-400">金幣</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-base">💎</span>
              <span className="text-sm font-bold text-sky-300">{profile.diamonds}</span>
              <span className="text-[11px] text-slate-400">鑽石</span>
            </div>
          </div>
          <span className="text-xs text-slate-400">複習單字與解每日任務可獲取道具</span>
        </div>

        {/* Item List */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {items.map(item => (
              <div
                key={item.id}
                className={`rounded-2xl border p-4 flex flex-col justify-between transition-all ${rarityBorders[item.rarity]}`}
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{item.icon}</span>
                      <div>
                        <h4 className="text-sm font-bold text-white">{item.name}</h4>
                        <span className="text-[10px] text-indigo-300 font-semibold uppercase">
                          {item.rarity}
                        </span>
                      </div>
                    </div>
                    <span className="rounded-xl bg-slate-950/80 px-2.5 py-1 text-xs font-bold text-white border border-slate-800">
                      x{item.count}
                    </span>
                  </div>

                  <p className="mt-2.5 text-xs text-slate-300 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between">
                  <div className="text-[11px] text-emerald-400 font-medium">
                    {item.effect.hunger && `飽食 +${item.effect.hunger} `}
                    {item.effect.exp && `EXP +${item.effect.exp} `}
                    {item.effect.health && `生命 +${item.effect.health}`}
                  </div>

                  {item.count > 0 && (item.type === 'food' || item.type === 'potion') ? (
                    <button
                      onClick={() => onUseItem(item)}
                      className="rounded-xl bg-emerald-600 hover:bg-emerald-500 px-3 py-1 text-xs font-bold text-white transition-colors"
                    >
                      立即使用
                    </button>
                  ) : item.type === 'evolution_stone' ? (
                    <span className="text-[11px] text-purple-300 font-semibold">
                      用於提前進化
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-500">已耗盡</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

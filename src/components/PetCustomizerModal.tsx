import React, { useState } from 'react';
import { Pet, PetCustomization, UserProfile } from '../types';
import { PetCanvas } from './PetCanvas';
import {
  accCosmeticKey,
  hatCosmeticKey,
  themeCosmeticKey,
} from '../data/shop';
import { isCosmeticUnlocked } from '../utils/shopPurchase';
import { X, Palette, Lock } from 'lucide-react';

interface PetCustomizerModalProps {
  pet: Pet;
  profile: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedPet: Pet) => void;
  onOpenShop?: () => void;
}

export const PetCustomizerModal: React.FC<PetCustomizerModalProps> = ({
  pet,
  profile,
  isOpen,
  onClose,
  onSave,
  onOpenShop,
}) => {
  const [tempName, setTempName] = useState(pet.name);
  const [custom, setCustom] = useState<PetCustomization>({ ...pet.customization });

  if (!isOpen) return null;

  const hats: { id: PetCustomization['hat']; name: string; icon: string }[] = [
    { id: 'none', name: '無飾品', icon: '🚫' },
    { id: 'wizard_hat', name: '賢者魔術帽', icon: '🧙' },
    { id: 'crown', name: '神聖王者王冠', icon: '👑' },
    { id: 'graduation_cap', name: '學霸學士帽', icon: '🎓' },
    { id: 'headphones', name: '電競潮流耳機', icon: '🎧' },
    { id: 'sunglasses', name: '復古酷炫墨鏡', icon: '🕶️' },
  ];

  const accessories: { id: PetCustomization['accessory']; name: string; icon: string }[] = [
    { id: 'none', name: '無配件', icon: '🚫' },
    { id: 'medal', name: '榮譽英豪勳章', icon: '🎖️' },
    { id: 'cape', name: '夜幕王者披風', icon: '🦸' },
    { id: 'magic_orb', name: '魔力環繞寶珠', icon: '🔮' },
    { id: 'star_badge', name: '星光徽章', icon: '⭐' },
  ];

  const themes: { id: PetCustomization['backgroundTheme']; name: string; icon: string }[] = [
    { id: 'forest', name: '森林', icon: '🌲' },
    { id: 'volcano', name: '火山', icon: '🌋' },
    { id: 'heaven', name: '天際', icon: '☁️' },
    { id: 'cosmic', name: '宇宙', icon: '🌌' },
    { id: 'cyberpunk', name: '賽博', icon: '🌃' },
  ];

  const previewPet: Pet = {
    ...pet,
    name: tempName || pet.name,
    customization: custom,
  };

  const handleSave = () => {
    onSave(previewPet);
    onClose();
  };

  const pickHat = (id: PetCustomization['hat']) => {
    const key = hatCosmeticKey(id);
    if (!isCosmeticUnlocked(profile, key)) {
      onOpenShop?.();
      return;
    }
    setCustom(prev => ({ ...prev, hat: id }));
  };

  const pickAcc = (id: PetCustomization['accessory']) => {
    const key = accCosmeticKey(id);
    if (!isCosmeticUnlocked(profile, key)) {
      onOpenShop?.();
      return;
    }
    setCustom(prev => ({ ...prev, accessory: id }));
  };

  const pickTheme = (id: PetCustomization['backgroundTheme']) => {
    const key = themeCosmeticKey(id);
    if (!isCosmeticUnlocked(profile, key)) {
      onOpenShop?.();
      return;
    }
    setCustom(prev => ({ ...prev, backgroundTheme: id }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl max-h-[90dvh] overflow-y-auto overflow-x-hidden rounded-3xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-indigo-400" />
            <h3 className="text-xl font-bold font-fun text-white">寵物外觀客製化工坊</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="my-4 flex flex-col items-center justify-center rounded-2xl bg-slate-950/70 p-4 border border-slate-800">
          <PetCanvas pet={previewPet} size="md" interactive={false} />
          <p className="mt-2 text-xs font-semibold text-indigo-300">
            {previewPet.name} ({previewPet.rarity.toUpperCase()})
          </p>
        </div>

        <div className="mb-4">
          <label className="block text-xs font-bold text-slate-300 mb-1">寵物暱稱自訂</label>
          <input
            type="text"
            value={tempName}
            maxLength={12}
            onChange={e => setTempName(e.target.value)}
            className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            placeholder="為寵物取個響亮的名字..."
          />
        </div>

        <div className="mb-4">
          <label className="block text-xs font-bold text-slate-300 mb-2">頭部飾品</label>
          <div className="grid grid-cols-3 gap-2">
            {hats.map(h => {
              const locked = !isCosmeticUnlocked(profile, hatCosmeticKey(h.id));
              return (
                <button
                  key={h.id}
                  onClick={() => pickHat(h.id)}
                  className={`relative flex items-center gap-2 rounded-xl border p-2.5 text-left text-xs transition-all ${
                    custom.hat === h.id
                      ? 'border-indigo-500 bg-indigo-500/20 text-white font-bold'
                      : locked
                        ? 'border-slate-800 bg-slate-900/40 text-slate-500'
                        : 'border-slate-800 bg-slate-800/60 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <span className="text-lg">{h.icon}</span>
                  <span className="truncate">{h.name}</span>
                  {locked && <Lock className="absolute top-1.5 right-1.5 h-3 w-3 text-slate-500" />}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-xs font-bold text-slate-300 mb-2">專屬配飾</label>
          <div className="grid grid-cols-2 gap-2">
            {accessories.map(acc => {
              const locked = !isCosmeticUnlocked(profile, accCosmeticKey(acc.id));
              return (
                <button
                  key={acc.id}
                  onClick={() => pickAcc(acc.id)}
                  className={`relative flex items-center gap-2 rounded-xl border p-2.5 text-left text-xs transition-all ${
                    custom.accessory === acc.id
                      ? 'border-indigo-500 bg-indigo-500/20 text-white font-bold'
                      : locked
                        ? 'border-slate-800 bg-slate-900/40 text-slate-500'
                        : 'border-slate-800 bg-slate-800/60 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <span className="text-lg">{acc.icon}</span>
                  <span className="truncate">{acc.name}</span>
                  {locked && <Lock className="absolute top-1.5 right-1.5 h-3 w-3 text-slate-500" />}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-xs font-bold text-slate-300 mb-2">展示背景</label>
          <div className="grid grid-cols-3 gap-2">
            {themes.map(th => {
              const locked = !isCosmeticUnlocked(profile, themeCosmeticKey(th.id));
              return (
                <button
                  key={th.id}
                  onClick={() => pickTheme(th.id)}
                  className={`relative flex items-center gap-2 rounded-xl border p-2.5 text-left text-xs transition-all ${
                    custom.backgroundTheme === th.id
                      ? 'border-indigo-500 bg-indigo-500/20 text-white font-bold'
                      : locked
                        ? 'border-slate-800 bg-slate-900/40 text-slate-500'
                        : 'border-slate-800 bg-slate-800/60 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <span className="text-lg">{th.icon}</span>
                  <span className="truncate">{th.name}</span>
                  {locked && <Lock className="absolute top-1.5 right-1.5 h-3 w-3 text-slate-500" />}
                </button>
              );
            })}
          </div>
          {onOpenShop && (
            <button
              onClick={onOpenShop}
              className="mt-2 text-[11px] font-semibold text-amber-400 hover:text-amber-300"
            >
              未解鎖？前往商店購買 →
            </button>
          )}
        </div>

        <button
          onClick={handleSave}
          className="w-full rounded-2xl bg-indigo-600 hover:bg-indigo-500 py-3 text-sm font-bold text-white transition-colors"
        >
          儲存外觀
        </button>
      </div>
    </div>
  );
};

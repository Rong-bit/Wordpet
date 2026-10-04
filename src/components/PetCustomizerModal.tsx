import React, { useState } from 'react';
import { Pet, PetCustomization } from '../types';
import { PetCanvas } from './PetCanvas';
import { X, Sparkles, Check, Palette } from 'lucide-react';

interface PetCustomizerModalProps {
  pet: Pet;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedPet: Pet) => void;
}

export const PetCustomizerModal: React.FC<PetCustomizerModalProps> = ({
  pet,
  isOpen,
  onClose,
  onSave,
}) => {
  if (!isOpen) return null;

  const [tempName, setTempName] = useState(pet.name);
  const [custom, setCustom] = useState<PetCustomization>({ ...pet.customization });

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
        {/* Header */}
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

        {/* Live Preview */}
        <div className="my-4 flex flex-col items-center justify-center rounded-2xl bg-slate-950/70 p-4 border border-slate-800">
          <PetCanvas pet={previewPet} size="md" interactive={false} />
          <p className="mt-2 text-xs font-semibold text-indigo-300">
            {previewPet.name} ({previewPet.rarity.toUpperCase()})
          </p>
        </div>

        {/* Name input */}
        <div className="mb-4">
          <label className="block text-xs font-bold text-slate-300 mb-1">
            寵物暱稱自訂
          </label>
          <input
            type="text"
            value={tempName}
            maxLength={12}
            onChange={e => setTempName(e.target.value)}
            className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            placeholder="為寵物取個響亮的名字..."
          />
        </div>

        {/* Hats selector */}
        <div className="mb-4">
          <label className="block text-xs font-bold text-slate-300 mb-2">
            頭部飾品 (帽子 / 墨鏡 / 王冠)
          </label>
          <div className="grid grid-cols-3 gap-2">
            {hats.map(h => (
              <button
                key={h.id}
                onClick={() => setCustom(prev => ({ ...prev, hat: h.id }))}
                className={`flex items-center gap-2 rounded-xl border p-2.5 text-left text-xs transition-all ${
                  custom.hat === h.id
                    ? 'border-indigo-500 bg-indigo-500/20 text-white font-bold'
                    : 'border-slate-800 bg-slate-800/60 text-slate-300 hover:border-slate-700'
                }`}
              >
                <span className="text-lg">{h.icon}</span>
                <span className="truncate">{h.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Accessory selector */}
        <div className="mb-6">
          <label className="block text-xs font-bold text-slate-300 mb-2">
            專屬配飾 (勳章 / 披風 / 法球)
          </label>
          <div className="grid grid-cols-2 gap-2">
            {accessories.map(acc => (
              <button
                key={acc.id}
                onClick={() => setCustom(prev => ({ ...prev, accessory: acc.id }))}
                className={`flex items-center gap-2 rounded-xl border p-2.5 text-left text-xs transition-all ${
                  custom.accessory === acc.id
                    ? 'border-indigo-500 bg-indigo-500/20 text-white font-bold'
                    : 'border-slate-800 bg-slate-800/60 text-slate-300 hover:border-slate-700'
                }`}
              >
                <span className="text-lg">{acc.icon}</span>
                <span className="truncate">{acc.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-400 hover:bg-slate-800 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-5 py-2 text-xs font-bold text-white transition-colors shadow-lg shadow-indigo-600/30"
          >
            <Check className="h-4 w-4" />
            保存造型裝扮
          </button>
        </div>
      </div>
    </div>
  );
};

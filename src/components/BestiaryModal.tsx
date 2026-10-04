import React from 'react';
import { BestiaryEntry, PetRarity } from '../types';
import { BESTIARY_DATA } from '../data/bestiary';
import { X, BookOpen, Lock, Sparkles, Trophy } from 'lucide-react';

interface BestiaryModalProps {
  unlockedSpecies: string[];
  isOpen: boolean;
  onClose: () => void;
}

export const BestiaryModal: React.FC<BestiaryModalProps> = ({
  unlockedSpecies,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const rarityBadge = (rarity: PetRarity) => {
    const map = {
      common: 'bg-slate-800 text-slate-300 border-slate-700',
      rare: 'bg-blue-900/60 text-blue-300 border-blue-500/40',
      epic: 'bg-purple-900/60 text-purple-300 border-purple-500/40',
      legendary: 'bg-amber-900/60 text-amber-300 border-amber-500/40',
      mythic: 'bg-rose-900/60 text-rose-300 border-rose-500/40',
    };
    return (
      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase ${map[rarity]}`}>
        {rarity}
      </span>
    );
  };

  const unlockedCount = BESTIARY_DATA.filter(entry =>
    unlockedSpecies.includes(entry.speciesId)
  ).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[85vh] overflow-hidden rounded-3xl border border-slate-700 bg-slate-900 p-6 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-indigo-400" />
            <h3 className="text-xl font-bold font-fun text-white">神獸圖鑑與品種檔案</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Progress Bar Header */}
        <div className="my-4 rounded-2xl bg-slate-950/60 p-4 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400">目前圖鑑收集進度</p>
              <p className="text-lg font-bold font-fun text-white">
                {unlockedCount} / {BESTIARY_DATA.length} 種物種已解鎖
              </p>
            </div>
          </div>
          <div className="w-32">
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-amber-400"
                style={{ width: `${(unlockedCount / BESTIARY_DATA.length) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Bestiary Cards Grid */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {BESTIARY_DATA.map(item => {
              const isUnlocked = unlockedSpecies.includes(item.speciesId);

              return (
                <div
                  key={item.speciesId}
                  className={`rounded-2xl border p-4 transition-all ${
                    isUnlocked
                      ? 'border-slate-700/80 bg-slate-800/40 hover:border-indigo-500/50'
                      : 'border-slate-800/60 bg-slate-950/40 opacity-70'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-12 w-12 rounded-2xl flex items-center justify-center text-2xl border ${
                          isUnlocked
                            ? 'bg-slate-800 border-indigo-500/30'
                            : 'bg-slate-900 border-slate-800 text-slate-600'
                        }`}
                      >
                        {isUnlocked ? item.iconSymbol : <Lock className="h-5 w-5 text-slate-500" />}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">
                          {isUnlocked ? item.name : '??? 未知封印神獸'}
                        </h4>
                        <div className="mt-1 flex items-center gap-1.5">
                          {rarityBadge(item.rarity)}
                          <span className="text-[10px] text-slate-400 font-medium">
                            {item.element.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="mt-3 text-xs text-slate-300 leading-relaxed">
                    {isUnlocked ? item.description : '透過持續背誦單字並進行基因變異可解鎖此物種。'}
                  </p>

                  <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                    <span>進化途徑：</span>
                    <span className="text-indigo-300 font-medium truncate max-w-[160px]">
                      {isUnlocked ? item.evolutionPath : '條件未達成'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

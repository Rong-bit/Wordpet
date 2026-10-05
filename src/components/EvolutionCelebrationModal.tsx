import React from 'react';
import { Pet } from '../types';
import { PetCanvas } from './PetCanvas';
import { getNextEvolution } from '../utils/evolution';
import { Sparkles } from 'lucide-react';

interface EvolutionCelebrationModalProps {
  pet: Pet;
  hatched: boolean;
  onClose: () => void;
}

const STAGE_LABELS: Record<string, string> = {
  baby: '幼年體',
  juvenile: '成長期',
  adult: '完全體',
  ultimate: '神話終極體',
};

export const EvolutionCelebrationModal: React.FC<EvolutionCelebrationModalProps> = ({ pet, hatched, onClose }) => {
  const next = getNextEvolution(pet);

  return (
    <div className="fixed inset-0 z-[55] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-amber-500/40 bg-slate-900 p-6 text-center shadow-2xl">
        <div className="pointer-events-none absolute -top-20 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full bg-amber-400/20 blur-3xl" />

        <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 border border-amber-500/40 px-3 py-1 text-xs font-bold text-amber-300">
          <Sparkles className="h-4 w-4" />
          {hatched ? '破殼而出！' : `進化成功！晉升${STAGE_LABELS[pet.stage] || ''}`}
        </div>

        <div className="my-3 flex justify-center">
          <PetCanvas pet={pet} size="md" interactive={false} />
        </div>

        <h3 className="text-2xl font-bold font-fun text-white">{pet.name}</h3>
        <p className="text-xs text-amber-400 font-semibold mt-0.5">
          {pet.title}・Lv.{pet.level}・{pet.rarity.toUpperCase()}
        </p>

        <div className="mt-4 rounded-xl bg-slate-800/60 border border-slate-700 p-3 text-xs text-slate-200 text-left">
          <p className="font-bold text-amber-300">✨ 新天賦</p>
          <p className="mt-0.5">{pet.specialTrait}</p>
        </div>

        <p className="mt-3 text-[11px] text-slate-400">
          {next
            ? `下一次進化：Lv.${next.level} 會自動進化為「${next.form.name}」`
            : '已達最終型態！可用異色變異核心改變毛色'}
        </p>

        <button
          onClick={onClose}
          className="mt-4 w-full rounded-2xl bg-indigo-600 hover:bg-indigo-500 py-3 text-sm font-bold text-white transition-colors shadow-lg cursor-pointer"
        >
          繼續一起背單字！
        </button>
      </div>
    </div>
  );
};

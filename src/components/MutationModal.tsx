import React, { useState } from 'react';
import { Pet, Item } from '../types';
import { PetCanvas } from './PetCanvas';
import { applyShinyPalette, evolveOneStage, getNextEvolution, HATCH_LEVEL } from '../utils/evolution';
import { HATCH_POOL } from '../data/petSpecies';

const SHINY_CORE_ID = 'item_mutation_core';
import { soundFx } from '../utils/sound';
import confetti from 'canvas-confetti';
import { X, Dna, Sparkles, Zap, ArrowRight, CheckCircle2 } from 'lucide-react';

interface MutationModalProps {
  pet: Pet;
  items: Item[];
  isOpen: boolean;
  onClose: () => void;
  onMutateSuccess: (newPet: Pet, consumedItemId: string) => void;
}

export const MutationModal: React.FC<MutationModalProps> = ({
  pet,
  items,
  isOpen,
  onClose,
  onMutateSuccess,
}) => {
  const [pickedStoneId, setSelectedStoneId] = useState<string>('');
  const [isMutating, setIsMutating] = useState(false);
  const [mutationResult, setMutationResult] = useState<Pet | null>(null);

  if (!isOpen) return null;

  const evolutionStones = items.filter(i => i.type === 'evolution_stone' && i.count > 0);
  const selectedStoneId = evolutionStones.some(s => s.id === pickedStoneId)
    ? pickedStoneId
    : evolutionStones[0]?.id || '';
  const isShinyCore = selectedStoneId === SHINY_CORE_ID;
  const nextEvolution = getNextEvolution(pet);
  const preview = pet.stage === 'egg' ? null : evolveOneStage(pet);
  const canUseStone = !!selectedStoneId && (pet.stage === 'egg' || !!preview || isShinyCore);
  const nextLevelText =
    pet.stage === 'egg'
      ? `Lv.${HATCH_LEVEL} 自動孵化`
      : nextEvolution
      ? `Lv.${nextEvolution.level} 自動進化為「${nextEvolution.form.name}」`
      : '已達最終型態';

  const handleStartMutation = () => {
    if (!canUseStone) return;

    setIsMutating(true);
    soundFx.playMutation();

    setTimeout(() => {
      const evolved = evolveOneStage(pet) || pet;
      const result: Pet = {
        ...(isShinyCore ? applyShinyPalette(evolved) : evolved),
        health: 100,
        hunger: 100,
        mood: 'ecstatic',
      };

      setMutationResult(result);
      setIsMutating(false);
      soundFx.playLevelUp();
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
      onMutateSuccess(result, selectedStoneId);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg max-h-[90dvh] overflow-y-auto overflow-x-hidden rounded-3xl border border-purple-500/40 bg-slate-900 p-6 shadow-2xl">
        {/* Glow backdrop */}
        <div className="pointer-events-none absolute -top-20 -right-20 h-64 w-64 rounded-full bg-purple-600/20 blur-3xl" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Dna className="h-5 w-5 text-purple-400" />
            <h3 className="text-xl font-bold font-fun text-white">寵物進化與異色變異</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Mutation Process or Result */}
        {!mutationResult ? (
          <div>
            <p className="text-xs text-slate-300 my-3 leading-relaxed">
              寵物升級會沿著自己的進化路線<span className="text-amber-400 font-bold">自動進化</span>
              （Lv.10 成長期、Lv.20 完全體、Lv.35 神話終極體）。
              使用複習掉落的【進化結晶】可立即提前進化；【異色變異核心】還會額外變成稀有的異色毛色！
            </p>
            <p className="text-[11px] text-indigo-300 mb-3">📈 不用道具：{nextLevelText}（目前 Lv.{pet.level}）</p>

            {/* Fusion Visual Chamber */}
            <div className="relative my-4 flex items-center justify-center rounded-2xl bg-slate-950/80 p-6 border border-purple-900/50">
              {isMutating ? (
                <div className="flex flex-col items-center justify-center py-6">
                  <div className="relative h-28 w-28">
                    <div className="absolute inset-0 rounded-full border-4 border-dashed border-purple-500 animate-spin" />
                    <div className="absolute inset-2 rounded-full border-4 border-dashed border-indigo-400 animate-spin" style={{ animationDirection: 'reverse' }} />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Sparkles className="h-10 w-10 text-amber-300 animate-pulse" />
                    </div>
                  </div>
                  <p className="mt-4 font-bold text-sm text-purple-300 animate-pulse">
                    基因重組合成中，正在突破界限...
                  </p>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-6">
                  <div className="text-center">
                    <p className="text-[11px] text-slate-400 mb-1">當前型態</p>
                    <PetCanvas pet={pet} size="sm" interactive={false} />
                    <p className="text-xs font-bold text-white mt-1">{pet.name}</p>
                  </div>

                  <ArrowRight className="h-6 w-6 text-purple-400 animate-pulse" />

                  <div className="text-center">
                    <p className="text-[11px] text-purple-400 font-bold mb-1">
                      {preview ? '進化目標' : isShinyCore && pet.stage === 'ultimate' ? '異色變異' : '孵化結果'}
                    </p>
                    {preview ? (
                      <PetCanvas pet={preview} size="sm" interactive={false} showStatusAura={false} />
                    ) : (
                      <div className="h-24 w-24 rounded-2xl border border-dashed border-purple-500/60 bg-purple-950/30 flex flex-col items-center justify-center">
                        <Zap className="h-8 w-8 text-amber-400 animate-bounce" />
                        <span className="text-[10px] text-purple-300 font-semibold mt-1">
                          {pet.stage === 'egg' ? '隨機寵物' : '全新毛色'}
                        </span>
                      </div>
                    )}
                    <p className="text-xs text-purple-300 mt-1 font-semibold">
                      {preview ? preview.name : pet.stage === 'egg' ? `${HATCH_POOL.length} 種之一` : '已是最終型態'}
                      {isShinyCore ? '・異色' : ''}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Evolution stone selector */}
            <div className="mb-4">
              <label className="block text-xs font-bold text-slate-300 mb-2">
                選擇注入的變異核心 / 進化石
              </label>
              {evolutionStones.length === 0 ? (
                <div className="rounded-xl bg-slate-800/60 border border-slate-700/60 p-3 text-center">
                  <p className="text-xs text-slate-400">目前背包尚無進化石！</p>
                  <p className="text-[11px] text-indigo-400 mt-1">每次複習 5 題以上有機率掉落，每日任務「易錯單字狙擊」必得 1 顆！</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {evolutionStones.map(stone => (
                    <button
                      key={stone.id}
                      onClick={() => setSelectedStoneId(stone.id)}
                      className={`w-full flex items-center justify-between rounded-xl border p-3 text-left transition-all ${
                        selectedStoneId === stone.id
                          ? 'border-purple-500 bg-purple-500/20 text-white'
                          : 'border-slate-800 bg-slate-800/60 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{stone.icon}</span>
                        <div>
                          <p className="text-xs font-bold text-white">{stone.name}</p>
                          <p className="text-[11px] text-slate-400">{stone.description}</p>
                        </div>
                      </div>
                      <span className="rounded-lg bg-purple-900/60 px-2.5 py-1 text-xs font-bold text-purple-300 border border-purple-500/30">
                        x{stone.count}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Action trigger button */}
            <button
              onClick={handleStartMutation}
              disabled={isMutating || !canUseStone}
              className={`w-full flex items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold shadow-lg transition-all ${
                isMutating || !canUseStone
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-600/30 active:scale-98'
              }`}
            >
              <Sparkles className="h-4 w-4" />
              {isMutating
                ? '進化能量注入中...'
                : pet.stage === 'egg' || preview
                ? isShinyCore
                  ? '注入核心・立即進化＋異色'
                  : '使用結晶・立即進化'
                : isShinyCore
                ? '注入核心・異色變異'
                : '已達最終型態（可改用異色核心）'}
            </button>
          </div>
        ) : (
          /* MUTATION SUCCESS DISPLAY */
          <div className="text-center py-4">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 px-3 py-1 text-xs font-bold text-emerald-300 mb-3">
              <CheckCircle2 className="h-4 w-4" /> 突變進化大成功！
            </div>

            <h4 className="text-2xl font-bold font-fun text-white mb-1">
              {mutationResult.name}
            </h4>
            <p className="text-xs text-amber-400 font-semibold mb-4">
              {mutationResult.title}・{mutationResult.rarity.toUpperCase()}
            </p>

            <div className="my-2 flex justify-center">
              <PetCanvas pet={mutationResult} size="md" interactive={false} />
            </div>

            <div className="rounded-xl bg-purple-950/40 border border-purple-500/30 p-3 my-4 text-xs text-purple-200">
              <p className="font-bold text-amber-300">✨ 新覺醒天賦：</p>
              <p className="mt-0.5">{mutationResult.specialTrait}</p>
            </div>

            <button
              onClick={() => {
                setMutationResult(null);
                onClose();
              }}
              className="w-full rounded-2xl bg-indigo-600 hover:bg-indigo-500 py-3 text-xs font-bold text-white transition-colors shadow-lg"
            >
              攜帶新神獸繼續學習！
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Pet, Item, PetElement } from '../types';
import { PetCanvas } from './PetCanvas';
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
  if (!isOpen) return null;

  const [selectedStoneId, setSelectedStoneId] = useState<string>(
    items.find(i => i.type === 'evolution_stone' && i.count > 0)?.id || ''
  );
  const [isMutating, setIsMutating] = useState(false);
  const [mutationResult, setMutationResult] = useState<Pet | null>(null);

  const evolutionStones = items.filter(i => i.type === 'evolution_stone' && i.count > 0);

  const handleStartMutation = () => {
    if (!selectedStoneId) return;

    setIsMutating(true);
    soundFx.playMutation();

    setTimeout(() => {
      // Generate new evolved / mutated pet with unique genes
      const isGenesisEgg = pet.stage === 'egg';
      let nextStage = pet.stage;
      let nextRarity = pet.rarity;
      let nextTitle = pet.title;
      let newName = pet.name;
      let newTrait = pet.specialTrait;
      let speciesId = pet.speciesId;

      const elements: PetElement[] = ['flame', 'frost', 'nature', 'thunder', 'void', 'radiant', 'cyber'];
      const chosenElement = elements[Math.floor(Math.random() * elements.length)];

      if (isGenesisEgg) {
        nextStage = 'baby';
        nextRarity = 'rare';
        newName = chosenElement === 'flame' ? '熾焰火蜥' : chosenElement === 'frost' ? '霜晶小狐' : '翡翠森幼鹿';
        nextTitle = '初階覺醒精靈';
        speciesId = chosenElement === 'flame' ? 'p_fire_dragon_1' : chosenElement === 'frost' ? 'p_frost_fox_1' : 'p_nature_deer_1';
        newTrait = '靈光一閃：每日首個測驗答對獲得雙倍經驗！';
      } else if (pet.stage === 'baby') {
        nextStage = 'juvenile';
        nextRarity = 'epic';
        newName = `疾風${pet.name}`;
        nextTitle = '成長期迅捷獸';
        newTrait = '思維共振：複習時長冷卻縮短 20%';
      } else if (pet.stage === 'juvenile') {
        nextStage = 'adult';
        nextRarity = 'legendary';
        newName = chosenElement === 'flame' ? '烈焰翼龍' : '奔雷電隼';
        speciesId = chosenElement === 'flame' ? 'p_fire_dragon_2' : 'p_thunder_falcon_1';
        nextTitle = '完全體神獸';
        newTrait = '記憶壁壘：連續登入天數提供額外金幣加成 +30%';
      } else {
        // Ultimate Mutation!
        nextStage = 'ultimate';
        nextRarity = 'mythic';
        newName = chosenElement === 'frost' ? '極光永凍九尾' : chosenElement === 'cyber' ? '量子神經機械龍' : '恆星日珥神龍';
        speciesId = chosenElement === 'frost' ? 'p_frost_ultimate' : chosenElement === 'cyber' ? 'p_cyber_mecha_ultimate' : 'p_fire_ultimate';
        nextTitle = '終極神話融合變異體';
        newTrait = '終極神域：測驗全對觸發終極全屏光效，解鎖連勝絕對守護盾！';
      }

      const mutatedPet: Pet = {
        ...pet,
        name: newName,
        speciesId,
        title: nextTitle,
        stage: nextStage,
        rarity: nextRarity,
        element: chosenElement,
        level: Math.max(pet.level + 2, nextStage === 'ultimate' ? 20 : 5),
        health: 100,
        hunger: 100,
        mood: 'ecstatic',
        specialTrait: newTrait,
        genes: {
          element: chosenElement,
          pattern: nextStage === 'ultimate' ? 'galaxy' : 'aurora',
          horns: nextStage === 'ultimate' ? 'dragon' : 'crystal',
          wings: nextStage === 'ultimate' ? 'mecha' : 'dragon',
          particle: chosenElement === 'frost' ? 'snowflakes' : chosenElement === 'flame' ? 'fire' : 'sparkles',
          primaryColor: chosenElement === 'frost' ? '#38BDF8' : chosenElement === 'flame' ? '#EF4444' : chosenElement === 'nature' ? '#10B981' : '#8B5CF6',
          secondaryColor: chosenElement === 'frost' ? '#818CF8' : chosenElement === 'flame' ? '#F97316' : chosenElement === 'nature' ? '#34D399' : '#C084FC',
          glowColor: '#FDE047',
        },
      };

      setMutationResult(mutatedPet);
      setIsMutating(false);
      soundFx.playLevelUp();
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
      });
      onMutateSuccess(mutatedPet, selectedStoneId);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-purple-500/40 bg-slate-900 p-6 shadow-2xl">
        {/* Glow backdrop */}
        <div className="pointer-events-none absolute -top-20 -right-20 h-64 w-64 rounded-full bg-purple-600/20 blur-3xl" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Dna className="h-5 w-5 text-purple-400" />
            <h3 className="text-xl font-bold font-fun text-white">神獸基因合成與變異殿堂</h3>
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
              透過複習單字獲取的【進化結晶】或【變異核心】，可引導寵物突破基因限制！
              有極高機率覺醒為稀有、史詩與<span className="text-amber-400 font-bold">【終極神話型態】</span>，解鎖璀璨光環與全域加成！
            </p>

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
                    <p className="text-[11px] text-purple-400 font-bold mb-1">目標變異</p>
                    <div className="h-24 w-24 rounded-2xl border border-dashed border-purple-500/60 bg-purple-950/30 flex flex-col items-center justify-center">
                      <Zap className="h-8 w-8 text-amber-400 animate-bounce" />
                      <span className="text-[10px] text-purple-300 font-semibold mt-1">未知新神獸</span>
                    </div>
                    <p className="text-xs text-purple-300 mt-1 font-semibold">隨機稀有/神話</p>
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
                  <p className="text-[11px] text-indigo-400 mt-1">完成每日任務或累積複習可免費獲得！</p>
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
              disabled={isMutating || !selectedStoneId}
              className={`w-full flex items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold shadow-lg transition-all ${
                isMutating || !selectedStoneId
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-600/30 active:scale-98'
              }`}
            >
              <Sparkles className="h-4 w-4" />
              {isMutating ? '變異能量注入中...' : '注入能量・啟動突變融合'}
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

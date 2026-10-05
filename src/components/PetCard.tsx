import React, { useState } from 'react';
import { Pet, Item } from '../types';
import { PetCanvas } from './PetCanvas';
import { getNextEvolution, HATCH_LEVEL } from '../utils/evolution';
import { EVOLUTION_LEVELS } from '../data/petSpecies';
import { soundFx } from '../utils/sound';
import confetti from 'canvas-confetti';
import {
  Heart,
  Sparkles,
  Utensils,
  Zap,
  Dna,
  Share2,
  AlertTriangle,
  ShieldCheck,
  Palette,
  Maximize2,
  Minimize2,
  X,
  Crown,
} from 'lucide-react';

interface PetCardProps {
  pet: Pet;
  items: Item[];
  onFeedItem: (item: Item) => void;
  onUpdatePet: (updated: Pet) => void;
  onOpenMutation: () => void;
  onOpenShare: () => void;
  onOpenCustomizer: () => void;
  onStartReview: () => void;
  onOpenBestiary?: () => void;
}

export const PetCard: React.FC<PetCardProps> = ({
  pet,
  items,
  onFeedItem,
  onUpdatePet,
  onOpenMutation,
  onOpenShare,
  onOpenCustomizer,
  onStartReview,
  onOpenBestiary,
}) => {
  const [showFeedMenu, setShowFeedMenu] = useState(false);
  const [isExpandedStage, setIsExpandedStage] = useState(false);
  const [touchHearts, setTouchHearts] = useState<number[]>([]);

  const stageLabels = {
    egg: '神秘星蛋',
    baby: '幼年體',
    juvenile: '成長期',
    adult: '完全體',
    ultimate: '神話終極體',
  };

  const rarityColors = {
    common: 'text-slate-300 border-slate-700 bg-slate-800/60',
    rare: 'text-blue-400 border-blue-500/40 bg-blue-950/40',
    epic: 'text-purple-400 border-purple-500/40 bg-purple-950/40',
    legendary: 'text-amber-400 border-amber-500/40 bg-amber-950/40',
    mythic: 'text-rose-400 border-rose-500/40 bg-rose-950/40',
  };

  const handlePetPetting = () => {
    soundFx.playFeed();
    setTouchHearts(prev => [...prev.slice(-3), Date.now()]);
    if (pet.mood === 'normal' || pet.mood === 'hungry') {
      onUpdatePet({
        ...pet,
        mood: 'happy',
      });
    }
  };

  const foodItems = items.filter(i => (i.type === 'food' || i.type === 'potion') && i.count > 0);

  const nextEvolution = getNextEvolution(pet);
  const prevGate =
    pet.stage === 'juvenile' ? EVOLUTION_LEVELS.juvenile : pet.stage === 'adult' ? EVOLUTION_LEVELS.adult : HATCH_LEVEL;
  const evolutionProgress = nextEvolution
    ? Math.min(
        100,
        Math.max(
          0,
          ((pet.level - prevGate + pet.exp / Math.max(1, pet.maxExp)) / (nextEvolution.level - prevGate)) * 100
        )
      )
    : 100;

  return (
    <>
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-800 bg-slate-900/80 p-3.5 sm:p-6 shadow-2xl backdrop-blur-xl transition-all">
        {/* Ambient Element Glow in Card Background */}
        <div
          className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full opacity-20 blur-3xl"
          style={{ background: pet.genes.primaryColor }}
        />
        <div
          className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full opacity-20 blur-3xl"
          style={{ background: pet.genes.glowColor }}
        />

        {/* Top Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${rarityColors[pet.rarity]}`}>
              {pet.rarity.toUpperCase()}
            </span>
            <span className="rounded-full bg-slate-800/80 px-2.5 py-0.5 text-xs font-medium text-slate-300">
              {stageLabels[pet.stage]}
            </span>
          </div>

          <div className="flex items-center gap-0.5">
            <button
              onClick={onOpenCustomizer}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer"
              title="換裝"
            >
              <Palette className="h-4 w-4" />
            </button>
            <button
              onClick={onOpenShare}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer"
              title="分享卡"
            >
              <Share2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Pet Title & Name */}
        <div className="mt-3 text-center">
          <div className="text-xs font-medium tracking-wider text-slate-400 uppercase">
            {pet.title}
          </div>
          <h2 className="text-2xl font-bold font-fun text-white tracking-wide flex items-center justify-center gap-2">
            {pet.name}
            <span className="text-sm font-semibold px-2 py-0.5 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Lv.{pet.level}
            </span>
          </h2>
        </div>

        {/* Main Pet Stage Display (Spacious Sanctuary Pedestal) */}
        <div className="relative my-2.5 sm:my-4 flex flex-col items-center justify-center rounded-2xl sm:rounded-3xl bg-slate-950/40 border border-slate-800/60 p-2 sm:p-6 overflow-visible group">
          {/* Floating Love Hearts on touch */}
          {touchHearts.map(timestamp => (
            <div
              key={timestamp}
              className="pointer-events-none absolute text-rose-500 animate-ping z-30"
              style={{
                top: `${20 + Math.random() * 40}%`,
                left: `${35 + Math.random() * 30}%`,
              }}
            >
              <Heart className="h-7 w-7 fill-rose-500" />
            </div>
          ))}

          {/* Quick Maximize Hint at corner */}
          <button
            onClick={() => {
              soundFx.playTap();
              setIsExpandedStage(true);
            }}
            className="absolute top-3 right-3 p-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700/60 transition-colors z-20 cursor-pointer"
            title="全螢幕檢視"
          >
            <Maximize2 className="h-4 w-4" />
          </button>

          {/* Generous Hero Pet Canvas with Wide ViewBox */}
          <PetCanvas pet={pet} size="hero" onClick={handlePetPetting} />

          <p className="mt-2 text-xs text-slate-500">點一下寵物可以摸摸牠</p>
        </div>

        {/* EGG INCUBATION BANNER */}
        {pet.stage === 'egg' && (
          <div className="mb-4 flex items-center gap-3 rounded-2xl bg-slate-950/50 p-3 border border-slate-800">
            <Sparkles className="h-4 w-4 shrink-0 text-amber-400" />
            <div className="text-xs min-w-0">
              <p className="font-semibold text-white">孵化中・Lv.{pet.level} / Lv.{HATCH_LEVEL}</p>
              <p className="text-[11px] mt-0.5 text-slate-400">完成一輪複習就能孵化</p>
            </div>
            <button
              onClick={onStartReview}
              className="ml-auto shrink-0 rounded-lg border border-slate-700 hover:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 transition-colors cursor-pointer"
            >
              去複習
            </button>
          </div>
        )}

        {pet.stage !== 'egg' && (
          <div className="mb-4 rounded-2xl bg-slate-950/50 p-3 border border-slate-800 text-xs text-slate-300">
            {nextEvolution ? (
              <>
                <div className="flex justify-between font-semibold">
                  <span>下一階段：{nextEvolution.form.name}</span>
                  <span className="text-slate-400 font-normal">
                    Lv.{pet.level} / Lv.{nextEvolution.level}
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-full rounded-full bg-purple-500 transition-all duration-500"
                    style={{ width: `${evolutionProgress}%` }}
                  />
                </div>
              </>
            ) : (
              <p className="font-semibold">已達最終型態・可用「異色變異核心」覺醒異色</p>
            )}
          </div>
        )}

        {/* INACTIVITY WARNING BANNER */}
        {pet.daysUnreviewed > 0 && (
          <div className="mb-4 flex items-center gap-3 rounded-2xl bg-amber-500/10 p-3 border border-amber-500/30 text-amber-200">
            <AlertTriangle className="h-5 w-5 shrink-0 text-amber-400" />
            <div className="text-xs">
              <p className="font-bold">
                {pet.daysUnreviewed >= 3 ? '寵物快要離家出走了！' : '寵物餓了'}
              </p>
              <p className="opacity-90 text-[11px] mt-0.5">
                已 {pet.daysUnreviewed} 天沒複習，複習一下就能恢復。
              </p>
            </div>
            <button
              onClick={onStartReview}
              className="ml-auto shrink-0 rounded-xl bg-amber-500 hover:bg-amber-400 px-3 py-1.5 text-xs font-bold text-slate-950 transition-colors shadow-md"
            >
              立即搶救
            </button>
          </div>
        )}

        {/* Stats Gauges (EXP, Hunger, Health) */}
        <div className="space-y-2.5 rounded-2xl bg-slate-950/50 p-3.5 border border-slate-800/80">
          {/* EXP Bar */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="flex items-center gap-1.5 text-slate-300 font-semibold">
                <Zap className="h-3.5 w-3.5 text-indigo-400" /> 經驗
              </span>
              <span className="text-slate-400">
                {pet.exp} / {pet.maxExp}
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
                style={{ width: `${Math.min(100, (pet.exp / pet.maxExp) * 100)}%` }}
              />
            </div>
          </div>

          {/* Hunger Bar */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="flex items-center gap-1.5 text-slate-300 font-semibold">
                <Utensils className="h-3.5 w-3.5 text-amber-400" /> 飽食
              </span>
              <span className="text-slate-400">{pet.hunger}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  pet.hunger > 50
                    ? 'bg-amber-500'
                    : pet.hunger > 20
                    ? 'bg-amber-600'
                    : 'bg-rose-500 animate-pulse'
                }`}
                style={{ width: `${pet.hunger}%` }}
              />
            </div>
          </div>

          {/* Health Bar */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="flex items-center gap-1.5 text-slate-300 font-semibold">
                <Heart className="h-3.5 w-3.5 text-rose-400 fill-rose-400" /> 健康
              </span>
              <span className="text-slate-400">{pet.health}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-rose-500 transition-all duration-500"
                style={{ width: `${pet.health}%` }}
              />
            </div>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="mt-4 grid grid-cols-2 gap-2 sm:gap-3">
          {/* Feed Button */}
          <div className="relative">
            <button
              onClick={() => setShowFeedMenu(!showFeedMenu)}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-slate-800/70 hover:bg-slate-800 border border-slate-700/60 px-4 py-3 text-sm font-semibold text-slate-200 transition-all active:scale-95 cursor-pointer"
            >
              <Utensils className="h-4 w-4 text-amber-400" />
              餵食
            </button>

            {/* Quick Feed Dropdown */}
            {showFeedMenu && (
              <div className="absolute bottom-full left-0 mb-2 w-64 rounded-2xl border border-slate-700 bg-slate-900/95 p-3 shadow-2xl backdrop-blur-xl z-20">
                <div className="text-xs font-bold text-slate-300 mb-2 flex justify-between items-center">
                  <span>選擇飼料或藥水</span>
                  <span className="text-[10px] text-slate-500">複習單字可獲得更多</span>
                </div>
                {foodItems.length === 0 ? (
                  <p className="text-xs text-slate-400 py-3 text-center">背包沒有食物了！多複習單字獲取道具吧！</p>
                ) : (
                  <div className="space-y-1.5">
                    {foodItems.map(item => (
                      <button
                        key={item.id}
                        onClick={() => {
                          onFeedItem(item);
                          setShowFeedMenu(false);
                        }}
                        className="w-full flex items-center justify-between rounded-xl bg-slate-800/80 hover:bg-slate-700 px-3 py-2 text-xs transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{item.icon}</span>
                          <div className="text-left">
                            <p className="font-semibold text-white">{item.name}</p>
                            <p className="text-[10px] text-slate-400">
                              飽食 +{item.effect.hunger || 0} / EXP +{item.effect.exp || 0}
                            </p>
                          </div>
                        </div>
                        <span className="rounded-md bg-indigo-500/20 px-2 py-0.5 font-bold text-indigo-300 text-[11px]">
                          x{item.count}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mutation / Evolution Trigger Button */}
          <button
            onClick={onOpenMutation}
            className="flex items-center justify-center gap-2 rounded-2xl bg-slate-800/70 hover:bg-slate-800 border border-slate-700/60 px-4 py-3 text-sm font-semibold text-slate-200 transition-all active:scale-95 cursor-pointer"
          >
            <Dna className="h-4 w-4 text-purple-400" />
            進化與異色
          </button>
        </div>

        {/* Special Trait + Bestiary link */}
        <div className="mt-4 flex items-start justify-between gap-3 text-xs">
          <p className="text-slate-400 leading-relaxed">
            <span className="font-semibold text-slate-300">特質：</span>
            {pet.specialTrait}
          </p>
          {onOpenBestiary && (
            <button
              onClick={onOpenBestiary}
              className="shrink-0 font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              神獸圖鑑 →
            </button>
          )}
        </div>
      </div>

      {/* --- FULLSCREEN IMMERSIVE SANCTUARY MODAL --- */}
      {isExpandedStage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/90 backdrop-blur-2xl animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl max-h-[90dvh] overflow-y-auto overflow-x-hidden rounded-3xl border border-amber-500/40 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 p-6 shadow-2xl flex flex-col items-center">
            {/* Ambient Background Aura */}
            <div
              className="absolute inset-0 opacity-25 blur-3xl pointer-events-none"
              style={{
                background: `radial-gradient(circle at 50% 50%, ${pet.genes.glowColor || '#F59E0B'} 0%, ${pet.genes.primaryColor || '#6366F1'} 50%, transparent 80%)`,
              }}
            />

            {/* Header Controls */}
            <div className="relative z-10 w-full flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-amber-400" />
                <h3 className="text-lg font-bold font-fun text-white">全螢幕檢視</h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Lv.{pet.level} {stageLabels[pet.stage]}
                </span>
              </div>
              <button
                onClick={() => setIsExpandedStage(false)}
                className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Pet Name & Title */}
            <div className="relative z-10 mt-4 text-center">
              <div className="text-xs font-semibold text-amber-400 uppercase tracking-widest">
                {pet.title}
              </div>
              <h2 className="text-3xl font-black font-fun text-white mt-1">
                {pet.name}
              </h2>
            </div>

            {/* Massive Unconstrained Stage Display */}
            <div className="relative z-10 my-6 w-full flex items-center justify-center min-h-[300px] sm:min-h-[360px]">
              <PetCanvas pet={pet} size="hero" onClick={handlePetPetting} />
            </div>

            {/* Interactive Pedestal Controls */}
            <div className="relative z-10 w-full max-w-md space-y-3 text-center">
              <p className="text-xs text-slate-300 flex items-center justify-center gap-1.5">
                <Sparkles className="h-4 w-4 text-amber-400" />
                點一下寵物可以摸摸牠
              </p>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={onOpenCustomizer}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all"
                >
                  <Palette className="h-4 w-4 text-indigo-400" />
                  換裝
                </button>
                <button
                  onClick={onOpenMutation}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-purple-600/30 hover:bg-purple-600/40 text-purple-200 text-xs font-bold border border-purple-500/40 transition-all"
                >
                  <Dna className="h-4 w-4 text-purple-400" />
                  進化與異色
                </button>
                <button
                  onClick={() => setIsExpandedStage(false)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all"
                >
                  <Minimize2 className="h-4 w-4" />
                  返回
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

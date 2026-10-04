import React, { useState } from 'react';
import { Pet, Item } from '../types';
import { PetCanvas } from './PetCanvas';
import { soundFx } from '../utils/sound';
import confetti from 'canvas-confetti';
import { Heart, Sparkles, Utensils, Zap, Dna, Share2, AlertTriangle, ShieldCheck, Palette } from 'lucide-react';

interface PetCardProps {
  pet: Pet;
  items: Item[];
  onFeedItem: (item: Item) => void;
  onUpdatePet: (updated: Pet) => void;
  onOpenMutation: () => void;
  onOpenShare: () => void;
  onOpenCustomizer: () => void;
  onStartReview: () => void;
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
}) => {
  const [showFeedMenu, setShowFeedMenu] = useState(false);
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

  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-b from-slate-900/90 via-slate-900/60 to-slate-950 p-6 shadow-2xl backdrop-blur-xl">
      {/* Background radial glow */}
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

        <div className="flex items-center gap-1.5">
          <button
            onClick={onOpenCustomizer}
            className="flex items-center gap-1 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 px-3 py-1.5 text-xs font-medium text-slate-200 transition-colors border border-slate-700/50"
            title="造型工坊"
          >
            <Palette className="h-3.5 w-3.5 text-indigo-400" />
            <span className="hidden sm:inline">換裝</span>
          </button>
          <button
            onClick={onOpenShare}
            className="flex items-center gap-1 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 px-3 py-1.5 text-xs font-medium text-indigo-300 transition-colors border border-indigo-500/30"
            title="生成分享卡"
          >
            <Share2 className="h-3.5 w-3.5 text-indigo-400" />
            <span className="hidden sm:inline">分享</span>
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

      {/* Main Pet Stage Display */}
      <div className="relative my-4 flex flex-col items-center justify-center">
        {/* Floating Love Hearts on touch */}
        {touchHearts.map(timestamp => (
          <div
            key={timestamp}
            className="pointer-events-none absolute text-rose-500 animate-ping"
            style={{
              top: `${20 + Math.random() * 40}%`,
              left: `${35 + Math.random() * 30}%`,
            }}
          >
            <Heart className="h-7 w-7 fill-rose-500" />
          </div>
        ))}

        <PetCanvas pet={pet} size="lg" onClick={handlePetPetting} />

        <p className="mt-2 text-xs text-slate-400 italic flex items-center gap-1">
          <Sparkles className="h-3.5 w-3.5 text-amber-400" />
          點擊寵物撫摸互動・每天完成複習維持活力
        </p>
      </div>

      {/* INACTIVITY WARNING BANNER */}
      {pet.daysUnreviewed > 0 && (
        <div className="mb-4 flex items-center gap-3 rounded-2xl bg-amber-500/10 p-3.5 border border-amber-500/30 text-amber-200">
          <AlertTriangle className="h-5 w-5 shrink-0 text-amber-400 animate-bounce" />
          <div className="text-xs">
            <p className="font-bold">
              {pet.daysUnreviewed >= 3 ? '🚨 瀕臨逃跑警告！' : '⚠️ 寵物飢餓衰弱中！'}
            </p>
            <p className="opacity-90 text-[11px] mt-0.5">
              你已 {pet.daysUnreviewed} 天未複習單字。立即進行複習可恢復飽食與親密度！
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
      <div className="space-y-3 rounded-2xl bg-slate-950/60 p-4 border border-slate-800/80">
        {/* EXP Bar */}
        <div>
          <div className="flex justify-between text-xs font-semibold mb-1">
            <span className="flex items-center gap-1 text-indigo-400">
              <Zap className="h-3.5 w-3.5" /> 學習經驗值
            </span>
            <span className="text-slate-300">
              {pet.exp} / {pet.maxExp} EXP
            </span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
              style={{ width: `${Math.min(100, (pet.exp / pet.maxExp) * 100)}%` }}
            />
          </div>
        </div>

        {/* Hunger & Health Grid */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          {/* Hunger Bar */}
          <div>
            <div className="flex justify-between text-xs font-medium mb-1 text-slate-400">
              <span className="flex items-center gap-1">
                <Utensils className="h-3 w-3 text-emerald-400" /> 飽食度
              </span>
              <span className={pet.hunger < 30 ? 'text-rose-400 font-bold' : 'text-slate-300'}>
                {pet.hunger}%
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  pet.hunger > 50
                    ? 'bg-emerald-500'
                    : pet.hunger > 25
                    ? 'bg-amber-500'
                    : 'bg-rose-500'
                }`}
                style={{ width: `${pet.hunger}%` }}
              />
            </div>
          </div>

          {/* Health Bar */}
          <div>
            <div className="flex justify-between text-xs font-medium mb-1 text-slate-400">
              <span className="flex items-center gap-1">
                <Heart className="h-3 w-3 text-rose-400" /> 生命活力
              </span>
              <span className={pet.health < 30 ? 'text-rose-400 font-bold' : 'text-slate-300'}>
                {pet.health}%
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-rose-500 transition-all duration-500"
                style={{ width: `${pet.health}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Buttons */}
      <div className="mt-4 grid grid-cols-2 gap-2 sm:gap-3">
        {/* Feed Button */}
        <div className="relative">
          <button
            onClick={() => setShowFeedMenu(!showFeedMenu)}
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 px-4 py-3 text-sm font-semibold text-emerald-300 transition-all active:scale-95 shadow-sm"
          >
            <Utensils className="h-4 w-4" />
            餵食營養品
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
          className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600/30 to-indigo-600/30 hover:from-purple-600/40 hover:to-indigo-600/40 border border-purple-500/40 px-4 py-3 text-sm font-semibold text-purple-300 transition-all active:scale-95 shadow-sm"
        >
          <Dna className="h-4 w-4 text-purple-400 animate-spin" style={{ animationDuration: '6s' }} />
          基因合成變異
        </button>
      </div>

      {/* Special Trait Description */}
      <div className="mt-4 rounded-xl bg-slate-800/40 p-3 border border-slate-800 text-xs text-slate-300">
        <span className="font-bold text-amber-400">✨ 專屬特質：</span>
        {pet.specialTrait}
      </div>
    </div>
  );
};

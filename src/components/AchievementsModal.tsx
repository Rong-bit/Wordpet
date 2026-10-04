import React from 'react';
import { Achievement, DailyQuest, Item } from '../types';
import { soundFx } from '../utils/sound';
import confetti from 'canvas-confetti';
import { Trophy, CheckCircle, Sparkles, X, Gift, Star, Award } from 'lucide-react';

interface AchievementsModalProps {
  quests: DailyQuest[];
  achievements: Achievement[];
  isOpen: boolean;
  onClose: () => void;
  onClaimQuest: (questId: string) => void;
  onClaimAchievement: (achId: string) => void;
}

export const AchievementsModal: React.FC<AchievementsModalProps> = ({
  quests,
  achievements,
  isOpen,
  onClose,
  onClaimQuest,
  onClaimAchievement,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = React.useState<'quests' | 'achievements'>('quests');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[85vh] overflow-hidden rounded-3xl border border-slate-700 bg-slate-900 p-6 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-400" />
            <h3 className="text-xl font-bold font-fun text-white">任務與榮耀成就殿堂</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-2 my-4">
          <button
            onClick={() => setActiveTab('quests')}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              activeTab === 'quests'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white bg-slate-800/40'
            }`}
          >
            每日學習任務 ({quests.filter(q => q.isCompleted && !q.isClaimed).length} 可領取)
          </button>
          <button
            onClick={() => setActiveTab('achievements')}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              activeTab === 'achievements'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white bg-slate-800/40'
            }`}
          >
            生涯里程碑徽章 ({achievements.filter(a => a.unlocked).length}/{achievements.length})
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-3">
          {activeTab === 'quests' ? (
            <div className="space-y-2.5">
              {quests.map(quest => {
                const canClaim = quest.isCompleted && !quest.isClaimed;

                return (
                  <div
                    key={quest.id}
                    className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-800/40 p-3.5 hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-lg">
                        {quest.isClaimed ? '✅' : '🎯'}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">{quest.title}</h4>
                        <p className="text-[11px] text-slate-400">{quest.desc}</p>
                        <div className="mt-1 flex items-center gap-2">
                          <div className="h-1.5 w-24 bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-indigo-500 rounded-full"
                              style={{ width: `${Math.min(100, (quest.current / quest.target) * 100)}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {quest.current}/{quest.target}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      {quest.isClaimed ? (
                        <span className="text-xs text-slate-500 font-medium">已領取獎勵</span>
                      ) : canClaim ? (
                        <button
                          onClick={() => {
                            soundFx.playLevelUp();
                            confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
                            onClaimQuest(quest.id);
                          }}
                          className="rounded-xl bg-amber-500 hover:bg-amber-400 px-3.5 py-1.5 text-xs font-bold text-slate-950 transition-colors shadow-md shadow-amber-500/20"
                        >
                          領取獎勵
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
                          {quest.rewardAmount} {quest.rewardType === 'coins' ? '🪙' : 'EXP'}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {achievements.map(ach => (
                <div
                  key={ach.id}
                  className={`rounded-2xl border p-4 transition-all ${
                    ach.unlocked
                      ? 'border-amber-500/40 bg-amber-950/20'
                      : 'border-slate-800 bg-slate-950/40 opacity-75'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{ach.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-white">{ach.title}</h4>
                        {ach.unlocked ? (
                          <span className="rounded bg-amber-500/20 text-amber-300 text-[10px] px-1.5 py-0.2 font-bold border border-amber-500/30">
                            已達成
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-500">
                            {ach.progress}/{ach.maxProgress}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">{ach.desc}</p>
                      <p className="text-[10px] text-amber-400 font-semibold mt-1">
                        達成獎勵：+{ach.rewardCoins} 🪙
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

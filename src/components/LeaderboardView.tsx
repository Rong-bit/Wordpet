import React, { useState } from 'react';
import { LeaderboardUser, Pet, UserProfile } from '../types';
import { INITIAL_LEADERBOARD } from '../data/socialAndQuests';
import { Trophy, Flame, Zap, Award, Users, Share2, Crown, Sparkles } from 'lucide-react';

interface LeaderboardViewProps {
  pet: Pet;
  profile: UserProfile;
  masteredWordsCount: number;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({
  pet,
  profile,
  masteredWordsCount,
}) => {
  const [tab, setTab] = useState<'weekly' | 'allTime'>('weekly');
  const [inviteCopied, setInviteCopied] = useState(false);

  // Compute current user score dynamically:
  // Score = mastered words * 25 + streak * 50 + pet level * 100
  const currentUserScore =
    masteredWordsCount * 25 + profile.streakDays * 50 + pet.level * 100;

  // Build combined list
  const users: LeaderboardUser[] = INITIAL_LEADERBOARD.map(u => {
    if (u.isCurrentUser) {
      return {
        ...u,
        name: profile.name,
        streakDays: profile.streakDays,
        wordsMastered: masteredWordsCount,
        petLevel: pet.level,
        petName: pet.name,
        petElement: pet.element,
        petStage: pet.stage,
        petRarity: pet.rarity,
        totalScore: currentUserScore,
      };
    }
    return u;
  }).sort((a, b) => b.totalScore - a.totalScore);

  const currentUserRank = users.findIndex(u => u.isCurrentUser) + 1;

  const handleCopyChallenge = async () => {
    const text = `⚔️ 我在 WordPet 榜單中獲得了 ${currentUserScore} 分 (第 ${currentUserRank} 名)！敢來跟我比背英文單字與培育神獸嗎？`;
    try {
      await navigator.clipboard.writeText(text);
      setInviteCopied(true);
      setTimeout(() => setInviteCopied(false), 2500);
    } catch (err) {
      console.error(err);
    }
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-400 text-slate-950 font-bold text-sm shadow-lg shadow-amber-400/30">
          🥇
        </span>
      );
    }
    if (rank === 2) {
      return (
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-300 text-slate-950 font-bold text-sm shadow-md">
          🥈
        </span>
      );
    }
    if (rank === 3) {
      return (
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-700 text-white font-bold text-sm shadow-md">
          🥉
        </span>
      );
    }
    return (
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-800 text-slate-400 font-bold text-xs">
        #{rank}
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="rounded-3xl border border-slate-800 bg-gradient-to-r from-amber-950/40 via-slate-900 to-indigo-950/40 p-6 shadow-xl backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
              <Trophy className="h-4 w-4" /> 全球與好友排行榜
            </div>
            <h2 className="text-2xl font-bold font-fun text-white mt-1">
              單字英豪競爭天梯
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              每日按時複習累積連勝與詞彙掌握度，培育稀有神獸提升戰力！每週日結算前十名即可領取限定變異核心與神秘彩蛋！
            </p>
          </div>

          <button
            onClick={handleCopyChallenge}
            className="flex items-center gap-2 rounded-2xl bg-amber-500 hover:bg-amber-400 px-5 py-3 text-xs font-bold text-slate-950 transition-colors shadow-lg shadow-amber-500/20 shrink-0"
          >
            <Share2 className="h-4 w-4" />
            {inviteCopied ? '已複製挑戰邀請連結！' : '發送戰帖邀請好友PK'}
          </button>
        </div>
      </div>

      {/* User's Standings Bar */}
      <div className="rounded-2xl border border-indigo-500/40 bg-indigo-950/30 p-4 backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-white shadow-lg">
            #{currentUserRank}
          </div>
          <div>
            <p className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>{profile.name} (你的當前排名)</span>
              <span className="rounded bg-indigo-500/20 px-1.5 py-0.5 text-[10px] text-indigo-300 font-mono">
                YOU
              </span>
            </p>
            <p className="text-[11px] text-slate-400">
              神獸：{pet.name} (Lv.{pet.level})・掌握單字：{masteredWordsCount}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-right">
          <div>
            <p className="text-[10px] text-slate-400">綜合冒險積分</p>
            <p className="text-lg font-bold text-amber-400">{currentUserScore} PTS</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setTab('weekly')}
          className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
            tab === 'weekly'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          本週榮譽榜
        </button>
        <button
          onClick={() => setTab('allTime')}
          className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
            tab === 'allTime'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          全伺服器總榜
        </button>
      </div>

      {/* Leaderboard Table List */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 overflow-hidden shadow-xl">
        <div className="divide-y divide-slate-800/80">
          {users.map((user, idx) => {
            const rank = idx + 1;
            const isMe = user.isCurrentUser;

            return (
              <div
                key={user.id}
                className={`flex items-center justify-between p-4 transition-colors ${
                  isMe ? 'bg-indigo-950/40' : 'hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  {/* Rank badge */}
                  <div className="w-8 flex justify-center">
                    {getRankBadge(rank)}
                  </div>

                  {/* Avatar */}
                  <div className="relative h-10 w-10 shrink-0 rounded-full overflow-hidden border border-slate-700 bg-slate-800 flex items-center justify-center font-bold text-slate-300">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                    ) : (
                      <span>{user.name.slice(0, 1)}</span>
                    )}
                  </div>

                  {/* Info */}
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white">{user.name}</h4>
                      {isMe && (
                        <span className="rounded bg-indigo-500/20 text-indigo-300 px-1.5 py-0.2 text-[10px] font-bold">
                          你
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                      <span className="text-purple-300 font-medium">
                        🐾 {user.petName} (Lv.{user.petLevel})
                      </span>
                      <span>・</span>
                      <span className="text-orange-300 flex items-center gap-0.5">
                        <Flame className="h-3 w-3 fill-orange-400" /> {user.streakDays}天
                      </span>
                    </div>
                  </div>
                </div>

                {/* Score */}
                <div className="text-right">
                  <p className="text-sm font-bold font-fun text-amber-400">
                    {user.totalScore.toLocaleString()} PTS
                  </p>
                  <p className="text-[11px] text-slate-400">
                    精通 {user.wordsMastered} 單字
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

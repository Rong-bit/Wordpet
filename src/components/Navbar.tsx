import React from 'react';
import { UserProfile } from '../types';
import { soundFx } from '../utils/sound';
import { PWAInstallButton } from './PWAInstallButton';
import {
  Flame,
  Volume2,
  VolumeX,
  BookOpen,
  Trophy,
  BarChart3,
  Backpack,
  Gift,
  Cloud,
  Settings,
  Sparkles,
  Home,
} from 'lucide-react';

interface NavbarProps {
  currentTab: 'home' | 'library' | 'stats' | 'leaderboard';
  onSelectTab: (tab: 'home' | 'library' | 'stats' | 'leaderboard') => void;
  profile: UserProfile;
  onUpdateProfile: (p: UserProfile) => void;
  onOpenBestiary: () => void;
  onOpenInventory: () => void;
  onOpenAchievements: () => void;
  onOpenSync: () => void;
  dueWordsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  profile,
  onUpdateProfile,
  onOpenBestiary,
  onOpenInventory,
  onOpenAchievements,
  onOpenSync,
  dueWordsCount,
}) => {
  const toggleSound = () => {
    const nextVal = !profile.soundEnabled;
    soundFx.setEnabled(nextVal);
    onUpdateProfile({
      ...profile,
      soundEnabled: nextVal,
    });
  };

  const toggleAccent = () => {
    onUpdateProfile({
      ...profile,
      voiceGender: profile.voiceGender === 'en-US' ? 'en-GB' : 'en-US',
    });
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/85 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo and Brand */}
        <div
          onClick={() => onSelectTab('home')}
          className="flex items-center gap-2.5 cursor-pointer select-none"
        >
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-600/30">
            <span className="text-xl">🥚</span>
          </div>
          <div>
            <h1 className="text-lg font-bold font-fun tracking-wide text-white flex items-center gap-1.5">
              WordPet
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-sans border border-indigo-500/30">
                SRS
              </span>
            </h1>
            <p className="text-[10px] text-slate-400 font-medium hidden sm:block">
              艾賓豪斯記憶法・神獸進化
            </p>
          </div>
        </div>

        {/* Center Navigation Tabs (Desktop & Tablet) */}
        <nav className="hidden md:flex items-center gap-1 rounded-2xl bg-slate-900/80 p-1 border border-slate-800/80">
          <button
            onClick={() => onSelectTab('home')}
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
              currentTab === 'home'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Home className="h-3.5 w-3.5" />
            冒險主頁
          </button>

          <button
            onClick={() => onSelectTab('library')}
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all relative ${
              currentTab === 'library'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BookOpen className="h-3.5 w-3.5" />
            單字庫
          </button>

          <button
            onClick={() => onSelectTab('stats')}
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
              currentTab === 'stats'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BarChart3 className="h-3.5 w-3.5" />
            記憶曲線
          </button>

          <button
            onClick={() => onSelectTab('leaderboard')}
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
              currentTab === 'leaderboard'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Trophy className="h-3.5 w-3.5 text-amber-400" />
            天梯排行
          </button>
        </nav>

        {/* Right Quick Controls & Currencies */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* In-app install button */}
          <PWAInstallButton compact />

          {/* Streak indicator */}
          <div className="flex items-center gap-1 rounded-xl bg-orange-500/10 border border-orange-500/30 px-2.5 py-1 text-xs font-bold text-orange-400">
            <Flame className="h-3.5 w-3.5 fill-orange-500 text-orange-500" />
            <span>{profile.streakDays}</span>
            <span className="text-[10px] hidden sm:inline">天連勝</span>
          </div>

          {/* Currencies */}
          <div className="hidden sm:flex items-center gap-2 rounded-xl bg-slate-900/80 border border-slate-800 px-2.5 py-1 text-xs font-semibold">
            <span className="text-amber-400 flex items-center gap-1">
              🪙 {profile.coins}
            </span>
            <span className="text-sky-400 flex items-center gap-1">
              💎 {profile.diamonds}
            </span>
          </div>

          {/* Quick Action Modals Trigger */}
          <div className="flex items-center gap-1">
            <button
              onClick={onOpenBestiary}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-colors"
              title="神獸圖鑑"
            >
              <BookOpen className="h-4 w-4 text-purple-400" />
            </button>

            <button
              onClick={onOpenInventory}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-colors"
              title="探險家背包"
            >
              <Backpack className="h-4 w-4 text-emerald-400" />
            </button>

            <button
              onClick={onOpenAchievements}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-colors"
              title="任務與成就"
            >
              <Gift className="h-4 w-4 text-amber-400" />
            </button>

            <button
              onClick={onOpenSync}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-colors"
              title="離線與雲端同步"
            >
              <Cloud className="h-4 w-4 text-sky-400" />
            </button>

            {/* Sound toggle */}
            <button
              onClick={toggleSound}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-colors"
              title={profile.soundEnabled ? '關閉音效' : '開啟音效'}
            >
              {profile.soundEnabled ? (
                <Volume2 className="h-4 w-4 text-indigo-400" />
              ) : (
                <VolumeX className="h-4 w-4 text-slate-500" />
              )}
            </button>

            {/* Accent toggle button */}
            <button
              onClick={toggleAccent}
              className="rounded-xl bg-slate-900 border border-slate-800 px-2 py-1 text-[11px] font-bold text-slate-300 hover:text-white transition-colors"
              title="切換美式/英式發音"
            >
              {profile.voiceGender === 'en-US' ? '美音 🇺🇸' : '英音 🇬🇧'}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar (Fixed Native-like dock) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t border-slate-800/90 bg-slate-950/95 backdrop-blur-xl py-2.5 pb-[max(0.6rem,env(safe-area-inset-bottom))] shadow-2xl">
        <button
          onClick={() => onSelectTab('home')}
          className={`flex flex-col items-center gap-1 text-[11px] font-bold px-3 py-1 rounded-xl transition-all ${
            currentTab === 'home'
              ? 'text-indigo-400 bg-indigo-500/10'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Home className="h-4 w-4" />
          <span>冒險主頁</span>
        </button>

        <button
          onClick={() => onSelectTab('library')}
          className={`flex flex-col items-center gap-1 text-[11px] font-bold px-3 py-1 rounded-xl transition-all ${
            currentTab === 'library'
              ? 'text-indigo-400 bg-indigo-500/10'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <BookOpen className="h-4 w-4" />
          <span>單字庫</span>
        </button>

        <button
          onClick={() => onSelectTab('stats')}
          className={`flex flex-col items-center gap-1 text-[11px] font-bold px-3 py-1 rounded-xl transition-all ${
            currentTab === 'stats'
              ? 'text-indigo-400 bg-indigo-500/10'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <BarChart3 className="h-4 w-4" />
          <span>記憶曲線</span>
        </button>

        <button
          onClick={() => onSelectTab('leaderboard')}
          className={`flex flex-col items-center gap-1 text-[11px] font-bold px-3 py-1 rounded-xl transition-all ${
            currentTab === 'leaderboard'
              ? 'text-indigo-400 bg-indigo-500/10'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Trophy className="h-4 w-4" />
          <span>天梯排行</span>
        </button>
      </div>
    </header>
  );
};

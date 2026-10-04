import React, { useState } from 'react';
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
  Home,
  Menu,
  X,
  Sparkles,
  Type,
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  const currentFontSize = profile.fontSizeMode || 'large';
  const cycleFontSize = () => {
    const nextMode =
      currentFontSize === 'normal'
        ? 'large'
        : currentFontSize === 'large'
        ? 'huge'
        : 'normal';
    onUpdateProfile({
      ...profile,
      fontSizeMode: nextMode,
    });
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/90 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Logo and Brand */}
        <div
          onClick={() => {
            setIsMobileMenuOpen(false);
            onSelectTab('home');
          }}
          className="flex items-center gap-2 sm:gap-2.5 cursor-pointer select-none shrink-0"
        >
          <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-md sm:shadow-lg shadow-indigo-600/30 shrink-0">
            <span className="text-base sm:text-xl">🥚</span>
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold font-fun tracking-wide text-white flex items-center gap-1 sm:gap-1.5">
              WordPet
              <span className="text-[9px] sm:text-[10px] px-1.5 py-0.2 rounded-full bg-indigo-500/20 text-indigo-300 font-sans border border-indigo-500/30">
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
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {/* Streak indicator */}
          <div className="flex items-center gap-1 rounded-xl bg-orange-500/10 border border-orange-500/30 px-2 sm:px-2.5 py-1 text-xs font-bold text-orange-400">
            <Flame className="h-3.5 w-3.5 fill-orange-500 text-orange-500" />
            <span>{profile.streakDays}</span>
            <span className="text-[10px] hidden sm:inline">天連勝</span>
          </div>

          {/* Desktop Currencies */}
          <div className="hidden sm:flex items-center gap-2 rounded-xl bg-slate-900/80 border border-slate-800 px-2.5 py-1 text-xs font-semibold">
            <span className="text-amber-400 flex items-center gap-1">
              🪙 {profile.coins}
            </span>
            <span className="text-sky-400 flex items-center gap-1">
              💎 {profile.diamonds}
            </span>
          </div>

          {/* Desktop Quick Action Modals Trigger */}
          <div className="hidden md:flex items-center gap-1">
            <PWAInstallButton compact />
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
              className="rounded-xl bg-slate-900 border border-slate-800 px-2 py-1 text-[11px] font-bold text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="切換美式/英式發音"
            >
              {profile.voiceGender === 'en-US' ? '美音 🇺🇸' : '英音 🇬🇧'}
            </button>

            {/* Font size toggle button (Desktop) */}
            <button
              onClick={cycleFontSize}
              className="flex items-center gap-1 rounded-xl bg-slate-900 border border-slate-800 px-2.5 py-1 text-xs font-bold text-slate-300 hover:text-white hover:border-slate-700 transition-colors cursor-pointer"
              title="切換字體大小 (標準 / 大 / 特大)"
            >
              <Type className="h-3.5 w-3.5 text-indigo-400" />
              <span>
                {currentFontSize === 'huge' ? '特大字體' : currentFontSize === 'large' ? '大字體' : '標準字體'}
              </span>
            </button>
          </div>

          {/* Mobile Quick Action Buttons (Single line, strictly no wrap) */}
          <div className="flex md:hidden items-center gap-1.5">
            {/* Mobile Font Size Toggle */}
            <button
              onClick={cycleFontSize}
              className="px-2 py-1 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1"
              title="切換字體大小 (標準/大/特大)"
            >
              <Type className="h-3.5 w-3.5 text-indigo-400" />
              <span className="text-[11px]">
                {currentFontSize === 'huge' ? '特大' : currentFontSize === 'large' ? '大' : '標準'}
              </span>
            </button>

            <button
              onClick={toggleSound}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-colors"
              title={profile.soundEnabled ? '關閉音效' : '開啟音效'}
            >
              {profile.soundEnabled ? (
                <Volume2 className="h-4 w-4 text-indigo-400" />
              ) : (
                <VolumeX className="h-4 w-4 text-slate-500" />
              )}
            </button>

            <button
              onClick={onOpenInventory}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-emerald-400 hover:text-emerald-300 transition-colors"
              title="探險家背包"
            >
              <Backpack className="h-4 w-4" />
            </button>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`p-2 rounded-xl border transition-colors flex items-center justify-center ${
                isMobileMenuOpen
                  ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                  : 'bg-slate-900 border-slate-800 text-indigo-400 hover:text-white'
              }`}
              title="快捷功能選單"
            >
              {isMobileMenuOpen ? (
                <X className="h-4 w-4" />
              ) : (
                <Menu className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Dropdown Sheet */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-950/98 backdrop-blur-2xl px-4 py-3.5 space-y-2.5 animate-in slide-in-from-top-2 duration-200 shadow-2xl">
          {/* User Currency & Pronunciation Summary */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
            <div className="flex items-center gap-3">
              <span className="text-amber-400 text-xs font-bold flex items-center gap-1">
                🪙 {profile.coins}
              </span>
              <span className="text-sky-400 text-xs font-bold flex items-center gap-1">
                💎 {profile.diamonds}
              </span>
            </div>
            <button
              onClick={toggleAccent}
              className="px-2 py-0.5 rounded-lg bg-slate-800 text-xs font-bold text-slate-200 border border-slate-700 active:scale-95"
            >
              發音：{profile.voiceGender === 'en-US' ? '美式 🇺🇸' : '英式 🇬🇧'}
            </button>
          </div>

          {/* Font Size Selector Row in Mobile Menu */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs">
            <span className="text-slate-300 font-bold flex items-center gap-1.5">
              <Type className="h-4 w-4 text-indigo-400" />
              字體大小：
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => onUpdateProfile({ ...profile, fontSizeMode: 'normal' })}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  currentFontSize === 'normal'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                標準
              </button>
              <button
                onClick={() => onUpdateProfile({ ...profile, fontSizeMode: 'large' })}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  currentFontSize === 'large'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                大
              </button>
              <button
                onClick={() => onUpdateProfile({ ...profile, fontSizeMode: 'huge' })}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  currentFontSize === 'huge'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                特大
              </button>
            </div>
          </div>

          {/* Quick Menu Items Grid */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                onOpenBestiary();
              }}
              className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-left text-xs font-bold text-slate-200 active:scale-95 transition-all"
            >
              <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 shrink-0">
                <BookOpen className="h-4 w-4" />
              </div>
              <div>
                <div>神獸圖鑑</div>
                <div className="text-[10px] text-slate-400 font-normal">全形態展示</div>
              </div>
            </button>

            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                onOpenAchievements();
              }}
              className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-left text-xs font-bold text-slate-200 active:scale-95 transition-all"
            >
              <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
                <Gift className="h-4 w-4" />
              </div>
              <div>
                <div>任務成就</div>
                <div className="text-[10px] text-slate-400 font-normal">領取獎勵</div>
              </div>
            </button>

            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                onOpenSync();
              }}
              className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-left text-xs font-bold text-slate-200 active:scale-95 transition-all"
            >
              <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20 shrink-0">
                <Cloud className="h-4 w-4" />
              </div>
              <div>
                <div>雲端備份</div>
                <div className="text-[10px] text-slate-400 font-normal">匯出與轉移</div>
              </div>
            </button>

            <div className="flex items-center justify-center p-2 rounded-xl bg-slate-900/50 border border-slate-800">
              <PWAInstallButton compact />
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation Bar (Fixed Native-like dock) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t border-slate-800/90 bg-slate-950/95 backdrop-blur-xl py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-2xl">
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

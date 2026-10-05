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
  Type,
  Settings,
  Mic,
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

const TABS: { id: NavbarProps['currentTab']; label: string; icon: typeof Home }[] = [
  { id: 'home', label: '主頁', icon: Home },
  { id: 'library', label: '單字庫', icon: BookOpen },
  { id: 'stats', label: '記憶曲線', icon: BarChart3 },
  { id: 'leaderboard', label: '排行榜', icon: Trophy },
];

const FONT_SIZE_OPTIONS: { value: 'normal' | 'large' | 'huge'; label: string }[] = [
  { value: 'normal', label: '標準' },
  { value: 'large', label: '大' },
  { value: 'huge', label: '特大' },
];

const iconBtn =
  'p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer';

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
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

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
  const setFontSize = (mode: 'normal' | 'large' | 'huge') => {
    onUpdateProfile({ ...profile, fontSizeMode: mode });
  };

  const settingsRows = (
    <>
      <div className="flex items-center justify-between gap-3 py-2">
        <span className="flex items-center gap-2 text-xs text-slate-300">
          {profile.soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          音效
        </span>
        <button
          onClick={toggleSound}
          className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors cursor-pointer ${
            profile.soundEnabled ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
          }`}
        >
          {profile.soundEnabled ? '開啟' : '關閉'}
        </button>
      </div>

      <div className="flex items-center justify-between gap-3 py-2">
        <span className="flex items-center gap-2 text-xs text-slate-300">
          <Mic className="h-4 w-4" />
          發音
        </span>
        <div className="flex items-center gap-1">
          {(['en-US', 'en-GB'] as const).map(v => (
            <button
              key={v}
              onClick={() => profile.voiceGender !== v && toggleAccent()}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors cursor-pointer ${
                profile.voiceGender === v ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {v === 'en-US' ? '美式' : '英式'}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 py-2">
        <span className="flex items-center gap-2 text-xs text-slate-300">
          <Type className="h-4 w-4" />
          字體
        </span>
        <div className="flex items-center gap-1">
          {FONT_SIZE_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setFontSize(opt.value)}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors cursor-pointer ${
                currentFontSize === opt.value
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </>
  );

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
          <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-indigo-600 flex items-center justify-center shrink-0">
            <span className="text-base sm:text-lg">🥚</span>
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold font-fun tracking-wide text-white leading-tight">
              WordPet
            </h1>
            <p className="text-[10px] text-slate-500 font-medium hidden lg:block">背單字・養神獸</p>
          </div>
        </div>

        {/* Center Navigation Tabs (Desktop & Tablet) */}
        <nav className="hidden md:flex items-center gap-1 rounded-2xl bg-slate-900/80 p-1 border border-slate-800/80">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`relative flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                  isActive ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {tab.label}
                {tab.id === 'home' && dueWordsCount > 0 && !isActive && (
                  <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-amber-400" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Right: status + quick actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Streak & currencies */}
          <div className="flex items-center gap-2.5 rounded-xl bg-slate-900/80 border border-slate-800 px-2.5 py-1 text-xs font-semibold">
            <span className="flex items-center gap-1 text-orange-400" title="連續學習天數">
              <Flame className="h-3.5 w-3.5 fill-orange-500 text-orange-500" />
              {profile.streakDays}
            </span>
            <span className="hidden sm:flex items-center gap-1 text-slate-300" title="金幣">
              🪙 {profile.coins}
            </span>
            <span className="hidden sm:flex items-center gap-1 text-slate-300" title="鑽石">
              💎 {profile.diamonds}
            </span>
          </div>

          {/* Desktop quick actions */}
          <div className="hidden md:flex items-center gap-0.5">
            <PWAInstallButton compact />
            <button onClick={onOpenBestiary} className={iconBtn} title="神獸圖鑑">
              <BookOpen className="h-4 w-4" />
            </button>
            <button onClick={onOpenInventory} className={iconBtn} title="背包">
              <Backpack className="h-4 w-4" />
            </button>
            <button onClick={onOpenAchievements} className={iconBtn} title="任務與成就">
              <Gift className="h-4 w-4" />
            </button>

            <div className="relative">
              <button
                onClick={() => setIsSettingsOpen(o => !o)}
                className={`${iconBtn} ${isSettingsOpen ? 'bg-slate-800 text-white' : ''}`}
                title="設定"
              >
                <Settings className="h-4 w-4" />
              </button>
              {isSettingsOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsSettingsOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 z-50 w-64 rounded-2xl border border-slate-800 bg-slate-900 p-3 shadow-2xl divide-y divide-slate-800">
                    {settingsRows}
                    <button
                      onClick={() => {
                        setIsSettingsOpen(false);
                        onOpenSync();
                      }}
                      className="w-full flex items-center gap-2 pt-2.5 pb-0.5 text-xs text-slate-300 hover:text-white cursor-pointer"
                    >
                      <Cloud className="h-4 w-4" />
                      備份與同步
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Mobile quick actions */}
          <div className="flex md:hidden items-center gap-0.5">
            <button onClick={onOpenInventory} className={iconBtn} title="背包">
              <Backpack className="h-4 w-4" />
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`${iconBtn} ${isMobileMenuOpen ? 'bg-slate-800 text-white' : ''}`}
              title="更多"
            >
              {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Dropdown Sheet */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-950/98 backdrop-blur-2xl px-4 py-3 space-y-3 animate-in slide-in-from-top-2 duration-200 shadow-2xl">
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: '神獸圖鑑', icon: BookOpen, onClick: onOpenBestiary },
              { label: '任務成就', icon: Gift, onClick: onOpenAchievements },
              { label: '備份同步', icon: Cloud, onClick: onOpenSync },
            ].map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    item.onClick();
                  }}
                  className="flex flex-col items-center gap-1.5 rounded-xl bg-slate-900 border border-slate-800 py-2.5 text-xs font-semibold text-slate-200 active:scale-95 transition-all"
                >
                  <Icon className="h-4 w-4 text-slate-400" />
                  {item.label}
                </button>
              );
            })}
          </div>

          <div className="rounded-xl bg-slate-900 border border-slate-800 px-3 py-1 divide-y divide-slate-800">
            <div className="flex items-center gap-3 py-2 text-xs font-semibold text-slate-300">
              <span>🪙 {profile.coins}</span>
              <span>💎 {profile.diamonds}</span>
            </div>
            {settingsRows}
          </div>

          <div className="flex justify-center empty:hidden">
            <PWAInstallButton compact />
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation Bar (Fixed Native-like dock) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t border-slate-800/90 bg-slate-950/95 backdrop-blur-xl py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`relative flex flex-col items-center gap-1 text-[11px] font-bold px-3 py-1 rounded-xl transition-all ${
                isActive ? 'text-indigo-400' : 'text-slate-500 hover:text-white'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{tab.label}</span>
              {tab.id === 'home' && dueWordsCount > 0 && !isActive && (
                <span className="absolute top-0.5 right-3 h-2 w-2 rounded-full bg-amber-400" />
              )}
            </button>
          );
        })}
      </div>
    </header>
  );
};

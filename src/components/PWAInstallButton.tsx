import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Smartphone, Download, X, Share, PlusSquare } from 'lucide-react';

export const PWAInstallButton: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already installed, hide prompt
  if (isInstalled) {
    return null;
  }

  // Chromium / Android flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className={`flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 font-bold text-white shadow-md shadow-emerald-950/40 transition-all active:scale-95 ${
          compact ? 'px-2.5 py-1 text-xs' : 'px-3.5 py-2 text-xs'
        }`}
        title="安裝至手機主畫面"
      >
        <Smartphone className="h-3.5 w-3.5" />
        <span>安裝至手機</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className={`flex items-center gap-1.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/40 border border-indigo-500/40 font-bold text-indigo-300 transition-all active:scale-95 ${
            compact ? 'px-2.5 py-1 text-xs' : 'px-3.5 py-2 text-xs'
          }`}
          title="加入 iPhone / iPad 主畫面"
        >
          <Smartphone className="h-3.5 w-3.5" />
          <span>加到手機</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-700 p-6 shadow-2xl text-center">
              <div className="mx-auto h-12 w-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 mb-3">
                <Smartphone className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold font-fun text-white">
                安裝 WordPet 至 iPhone / iPad
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                將此網頁加至手機桌面，享有如同 App Store 原生應用的全螢幕離線體驗：
              </p>

              <div className="my-4 space-y-2.5 rounded-2xl bg-slate-950/70 p-4 border border-slate-800 text-left text-xs text-slate-300">
                <div className="flex items-start gap-2.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white">
                    1
                  </span>
                  <p>
                    點擊 Safari 瀏覽器底部的 <Share className="inline h-3.5 w-3.5 text-sky-400 mx-0.5" /> <strong>「分享」</strong> 按鈕。
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white">
                    2
                  </span>
                  <p>
                    在選單中向下滑動，點選 <PlusSquare className="inline h-3.5 w-3.5 text-emerald-400 mx-0.5" /> <strong>「加入主畫面」</strong> (Add to Home Screen)。
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white">
                    3
                  </span>
                  <p>
                    點擊右上角<strong>「新增」</strong>即可隨時從桌面圖示秒開練習！
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full rounded-2xl bg-indigo-600 hover:bg-indigo-500 py-3 text-xs font-bold text-white transition-colors"
              >
                我知道了
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};

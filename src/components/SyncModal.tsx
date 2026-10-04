import React, { useState } from 'react';
import { AppState, downloadBackupFile } from '../utils/storage';
import { UserProfile } from '../types';
import { Cloud, Download, Upload, WifiOff, CheckCircle2, RefreshCw, X, ShieldCheck } from 'lucide-react';

interface SyncModalProps {
  appState: AppState;
  isOpen: boolean;
  onClose: () => void;
  onRestoreState: (restored: AppState) => void;
  onUpdateProfile: (profile: UserProfile) => void;
}

export const SyncModal: React.FC<SyncModalProps> = ({
  appState,
  isOpen,
  onClose,
  onRestoreState,
  onUpdateProfile,
}) => {
  if (!isOpen) return null;

  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccessMsg, setSyncSuccessMsg] = useState('');
  const [importError, setImportError] = useState('');

  const { profile } = appState;

  const handleCloudSync = () => {
    setIsSyncing(true);
    setSyncSuccessMsg('');

    setTimeout(() => {
      const nowIso = new Date().toISOString();
      onUpdateProfile({
        ...profile,
        lastCloudSync: nowIso,
      });
      setIsSyncing(false);
      setSyncSuccessMsg('雲端同步成功！已將最新單字進度與神獸基因備份至雲端。');
    }, 1200);
  };

  const handleToggleOfflineMode = () => {
    onUpdateProfile({
      ...profile,
      isOfflineMode: !profile.isOfflineMode,
    });
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportError('');
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.app === 'WordPet' && parsed.data) {
          onRestoreState(parsed.data);
          setSyncSuccessMsg('備份資料成功匯入還原！');
        } else {
          setImportError('檔案格式不相符，請確認是 WordPet 的備份 JSON 檔案。');
        }
      } catch (err) {
        setImportError('無法解析此 JSON 備份檔。');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Cloud className="h-5 w-5 text-indigo-400" />
            <h3 className="text-xl font-bold font-fun text-white">離線學習與雲端同步中心</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Offline Mode Switch */}
        <div className="my-4 rounded-2xl bg-slate-950/70 p-4 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`h-10 w-10 rounded-xl flex items-center justify-center text-lg ${
                profile.isOfflineMode
                  ? 'bg-amber-500/20 text-amber-400'
                  : 'bg-emerald-500/20 text-emerald-400'
              }`}
            >
              {profile.isOfflineMode ? <WifiOff className="h-5 w-5" /> : <Cloud className="h-5 w-5" />}
            </div>
            <div>
              <p className="text-xs font-bold text-white">
                {profile.isOfflineMode ? '離線學習模式已啟動' : '連線雲端模式'}
              </p>
              <p className="text-[11px] text-slate-400">
                {profile.isOfflineMode
                  ? '所有單字與寵物數據皆純本地安全儲存，斷網也能暢玩'
                  : '即時自動保存，可隨時手動上傳至雲端伺服器備份'}
              </p>
            </div>
          </div>

          <button
            onClick={handleToggleOfflineMode}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-colors ${
              profile.isOfflineMode
                ? 'bg-amber-500 text-slate-950'
                : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            {profile.isOfflineMode ? '切換為連線' : '切換為離線'}
          </button>
        </div>

        {/* Cloud Sync Status */}
        <div className="rounded-2xl border border-indigo-500/30 bg-indigo-950/20 p-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4" /> 雲端備份狀態
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                上次備份時間：{profile.lastCloudSync ? new Date(profile.lastCloudSync).toLocaleString() : '尚未同步'}
              </p>
            </div>
            <button
              onClick={handleCloudSync}
              disabled={isSyncing}
              className="flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-3.5 py-2 text-xs font-bold text-white transition-colors shadow-md disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? '同步中...' : '立即同步雲端'}
            </button>
          </div>
          {syncSuccessMsg && (
            <p className="mt-2 text-xs text-emerald-400 font-medium flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" /> {syncSuccessMsg}
            </p>
          )}
        </div>

        {/* Local JSON Backup / Restore */}
        <div className="space-y-2.5">
          <label className="block text-xs font-bold text-slate-300">
            裝置備份與跨設備資料轉移
          </label>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => downloadBackupFile(appState)}
              className="flex items-center justify-center gap-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 p-3 text-xs font-bold text-slate-200 transition-colors"
            >
              <Download className="h-4 w-4 text-indigo-400" />
              匯出本機備份 (JSON)
            </button>

            <label className="flex items-center justify-center gap-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 p-3 text-xs font-bold text-slate-200 transition-colors cursor-pointer">
              <Upload className="h-4 w-4 text-emerald-400" />
              匯入還原資料
              <input
                type="file"
                accept=".json"
                onChange={handleImportFile}
                className="hidden"
              />
            </label>
          </div>
          {importError && (
            <p className="text-xs text-rose-400 font-medium">{importError}</p>
          )}
        </div>
      </div>
    </div>
  );
};

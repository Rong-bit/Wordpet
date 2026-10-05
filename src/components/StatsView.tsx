import React from 'react';
import { Word, UserProfile } from '../types';
import { getEbbinghausCurveData, calculateRetentionRate } from '../utils/srs';
import {
  TrendingUp,
  Brain,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  Sparkles,
  Flame,
} from 'lucide-react';

interface StatsViewProps {
  words: Word[];
  profile: UserProfile;
}

export const StatsView: React.FC<StatsViewProps> = ({ words, profile }) => {
  const curveData = getEbbinghausCurveData();

  // Calculate statistics
  const totalCount = words.length;
  const masteredCount = words.filter(w => w.status === 'mastered').length;
  const reviewingCount = words.filter(w => w.status === 'reviewing').length;
  const learningCount = words.filter(w => w.status === 'learning').length;
  const newCount = words.filter(w => w.status === 'new').length;
  const weakCount = words.filter(w => w.isWeak).length;

  const now = new Date().getTime();
  const dueCount = words.filter(w => new Date(w.nextReviewAt).getTime() <= now).length;

  // Compute average retention rate
  const reviewedWords = words.filter(w => w.lastReviewedAt !== null);
  const avgRetention =
    reviewedWords.length > 0
      ? Math.round(
          reviewedWords.reduce((acc, w) => acc + calculateRetentionRate(w), 0) /
            reviewedWords.length
        )
      : 85;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner Overview */}
      <div className="rounded-2xl sm:rounded-3xl border border-slate-800 bg-slate-900/80 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-300 text-xs font-semibold">
              <Brain className="h-4 w-4" /> 學習分析
            </div>
            <h2 className="text-2xl font-bold font-fun text-white mt-1">記憶曲線</h2>
            <p className="text-sm text-slate-400 mt-1 max-w-xl">
              系統會在你快忘記時安排複習，把短期記憶變成長期記憶。
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 rounded-2xl bg-slate-950/50 p-3.5 border border-slate-800">
            <div className="text-center">
              <p className="text-[10px] text-slate-400">目前記憶留存率</p>
              <p className="text-2xl font-bold text-emerald-400">{avgRetention}%</p>
            </div>
            <div className="h-8 w-px bg-slate-800" />
            <div className="text-center">
              <p className="text-[10px] text-slate-400">連續複習</p>
              <p className="text-2xl font-bold text-amber-400 flex items-center justify-center gap-1">
                <Flame className="h-5 w-5 fill-amber-500 text-amber-500" />
                {profile.streakDays}天
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-1">
            <span>今日待複習</span>
            <Clock className="h-4 w-4 text-indigo-400" />
          </div>
          <p className="text-2xl font-bold text-white">{dueCount}</p>
          <p className="text-[11px] text-slate-500 mt-1">現在複習效果最好</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-1">
            <span>已熟練掌握</span>
            <CheckCircle className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-emerald-400">{masteredCount}</p>
          <p className="text-[11px] text-slate-500 mt-1">已進入長期記憶</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-1">
            <span>鞏固複習中</span>
            <TrendingUp className="h-4 w-4 text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-blue-400">{reviewingCount + learningCount}</p>
          <p className="text-[11px] text-slate-500 mt-1">還需要幾次複習</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-1">
            <span>易錯 / 需加強</span>
            <AlertCircle className="h-4 w-4 text-rose-400" />
          </div>
          <p className="text-2xl font-bold text-rose-400">{weakCount}</p>
          <p className="text-[11px] text-slate-500 mt-1">可在主頁弱點特訓</p>
        </div>
      </div>

      {/* Interactive Ebbinghaus Forgetting Curve Comparison Chart */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h3 className="text-lg font-bold font-fun text-white flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-indigo-400" />
              記憶保持曲線
            </h3>
            <p className="text-xs text-slate-400">不複習 vs. 間隔複習的記憶留存率</p>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-rose-500/80" />
              <span className="text-slate-300">不複習</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-emerald-400" />
              <span className="text-slate-200 font-semibold">間隔複習</span>
            </div>
          </div>
        </div>

        {/* Custom SVG Curve Graph */}
        <div className="relative w-full h-64 select-none">
          <svg viewBox="0 0 700 240" className="w-full h-full overflow-visible">
            {/* Grid horizontal lines */}
            {[100, 75, 50, 25, 0].map(val => {
              const y = 200 - (val / 100) * 160;
              return (
                <g key={val}>
                  <line x1="45" y1={y} x2="680" y2={y} stroke="#334155" strokeWidth="0.8" strokeDasharray="4 4" />
                  <text x="35" y={y + 4} fontSize="10" fill="#94A3B8" textAnchor="end">{val}%</text>
                </g>
              );
            })}

            {/* X-axis time labels */}
            {curveData.map((d, idx) => {
              const x = 50 + (idx / (curveData.length - 1)) * 620;
              return (
                <g key={idx}>
                  <line x1={x} y1="200" x2={x} y2="206" stroke="#475569" strokeWidth="1" />
                  <text x={x} y="222" fontSize="10" fill="#94A3B8" textAnchor="middle">{d.day}</text>
                </g>
              );
            })}

            {/* Natural Curve Area & Path */}
            <path
              d={curveData.reduce((acc, d, idx) => {
                const x = 50 + (idx / (curveData.length - 1)) * 620;
                const y = 200 - (d.naturalRate / 100) * 160;
                return idx === 0 ? `M ${x},${y}` : `${acc} L ${x},${y}`;
              }, '')}
              fill="none"
              stroke="#F43F5E"
              strokeWidth="2.5"
              strokeDasharray="5 3"
            />

            {/* SRS Reinforced Curve Area & Path */}
            <path
              d={
                curveData.reduce((acc, d, idx) => {
                  const x = 50 + (idx / (curveData.length - 1)) * 620;
                  const y = 200 - (d.srsRate / 100) * 160;
                  return idx === 0 ? `M ${x},${y}` : `${acc} L ${x},${y}`;
                }, '') + ` L 670,200 L 50,200 Z`
              }
              fill="rgba(16, 185, 129, 0.08)"
            />

            <path
              d={curveData.reduce((acc, d, idx) => {
                const x = 50 + (idx / (curveData.length - 1)) * 620;
                const y = 200 - (d.srsRate / 100) * 160;
                return idx === 0 ? `M ${x},${y}` : `${acc} L ${x},${y}`;
              }, '')}
              fill="none"
              stroke="#10B981"
              strokeWidth="3.5"
            />

            {/* Points on SRS curve */}
            {curveData.map((d, idx) => {
              const x = 50 + (idx / (curveData.length - 1)) * 620;
              const ySrs = 200 - (d.srsRate / 100) * 160;
              const yNat = 200 - (d.naturalRate / 100) * 160;

              return (
                <g key={idx}>
                  <circle cx={x} cy={yNat} r="3.5" fill="#F43F5E" />
                  <circle cx={x} cy={ySrs} r="4.5" fill="#10B981" stroke="#FFFFFF" strokeWidth="1.5" />
                  {/* Tooltip text for key checkpoints */}
                  {(idx === 2 || idx === 4 || idx === 7) && (
                    <text x={x} y={ySrs - 9} fontSize="10" fill="#6EE7B7" textAnchor="middle" fontWeight="bold">
                      {d.srsRate}%
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        <div className="mt-4 rounded-2xl bg-slate-950/70 p-4 border border-slate-800 text-xs text-slate-300 leading-relaxed">
          <p className="font-semibold text-white mb-1">複習排程</p>
          <ul className="list-disc pl-4 space-y-1 text-slate-400">
            <li>第 1 次複習：背完後隔天 (維持留存率在 90% 以上)</li>
            <li>第 2 次複習：第 3 天 (克服第二波遺忘峰值)</li>
            <li>第 3 次複習：第 7 天 (形成深層記憶迴路)</li>
            <li>第 4 次複習：第 15~30 天 (達到終生不忘的長期記憶狀態)</li>
          </ul>
        </div>
      </div>

      {/* Vocabulary Mastery Distribution */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl backdrop-blur-xl">
        <h3 className="text-lg font-bold font-fun text-white mb-4">
          掌握度分佈
        </h3>

        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-emerald-400">精通階段 (Mastered, 複習 ≥ 4 次)</span>
              <span className="text-white">{masteredCount} 字 ({totalCount > 0 ? Math.round((masteredCount / totalCount) * 100) : 0}%)</span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full"
                style={{ width: `${totalCount > 0 ? (masteredCount / totalCount) * 100 : 0}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-blue-400">複習階段 (Reviewing, 複習 2-3 次)</span>
              <span className="text-white">{reviewingCount} 字 ({totalCount > 0 ? Math.round((reviewingCount / totalCount) * 100) : 0}%)</span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full"
                style={{ width: `${totalCount > 0 ? (reviewingCount / totalCount) * 100 : 0}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-purple-400">初學階段 (Learning, 複習 1 次)</span>
              <span className="text-white">{learningCount} 字 ({totalCount > 0 ? Math.round((learningCount / totalCount) * 100) : 0}%)</span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-purple-500 rounded-full"
                style={{ width: `${totalCount > 0 ? (learningCount / totalCount) * 100 : 0}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-slate-400">新單字待學習 (New Words)</span>
              <span className="text-white">{newCount} 字 ({totalCount > 0 ? Math.round((newCount / totalCount) * 100) : 0}%)</span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-slate-600 rounded-full"
                style={{ width: `${totalCount > 0 ? (newCount / totalCount) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { EscapedPetSummary } from '../utils/storage';
import { AlertTriangle, Egg, ArrowRight } from 'lucide-react';

interface EscapedPetModalProps {
  escaped: EscapedPetSummary;
  onStartReview: () => void;
  onDismiss: () => void;
}

const STAGE_LABELS: Record<string, string> = {
  baby: '幼年體',
  juvenile: '成長期',
  adult: '完全體',
  ultimate: '終極體',
};

export const EscapedPetModal: React.FC<EscapedPetModalProps> = ({
  escaped,
  onStartReview,
  onDismiss,
}) => {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm max-h-[90dvh] overflow-y-auto overflow-x-hidden rounded-3xl border border-rose-500/40 bg-slate-900 p-6 text-center shadow-2xl">
        <div className="pointer-events-none absolute -top-20 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full bg-rose-500/15 blur-3xl" />

        <div className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/20 border border-rose-500/40 px-3 py-1 text-xs font-bold text-rose-300">
          <AlertTriangle className="h-4 w-4" />
          寵物離家出走了
        </div>

        <div className="my-5 flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-800 border border-slate-700 text-slate-300">
            <Egg className="h-10 w-10" />
          </div>
        </div>

        <h3 className="text-xl font-bold font-fun text-white">
          「{escaped.name}」離開了…
        </h3>
        <p className="mt-2 text-sm text-slate-300 leading-relaxed">
          已連續 <span className="font-bold text-rose-300">{escaped.daysAway}</span> 天沒複習。
          <br />
          Lv.{escaped.level} {STAGE_LABELS[escaped.stage] || escaped.stage}・{escaped.title}
          <br />
          因為太久沒被照顧，牠決定先離開。
        </p>

        <div className="mt-4 rounded-xl bg-slate-800/60 border border-slate-700 p-3 text-xs text-slate-300 text-left leading-relaxed">
          <p className="font-bold text-amber-300 mb-1">你還留著這些</p>
          <p>單字進度、金幣、圖鑑解鎖都還在。現在是一顆新蛋——只要開始複習，就能重新養成。</p>
        </div>

        <button
          onClick={onStartReview}
          className="mt-5 w-full flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 hover:bg-indigo-500 py-3 text-sm font-bold text-white transition-colors shadow-lg cursor-pointer"
        >
          立刻複習，重新開始
          <ArrowRight className="h-4 w-4" />
        </button>
        <button
          onClick={onDismiss}
          className="mt-2 w-full rounded-2xl py-2.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          稍後再說
        </button>
      </div>
    </div>
  );
};

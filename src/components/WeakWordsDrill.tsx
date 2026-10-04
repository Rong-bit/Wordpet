import React, { useState, useEffect, useRef } from 'react';
import { Word, Pet } from '../types';
import { soundFx } from '../utils/sound';
import { speakEnglish } from '../utils/tts';
import confetti from 'canvas-confetti';
import {
  ShieldAlert,
  Volume2,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Flame,
  Award,
  Sparkles,
  RotateCcw,
} from 'lucide-react';

interface WeakWordsDrillProps {
  weakWords: Word[];
  allWords: Word[];
  pet: Pet;
  onFinishDrill: (updatedWords: Word[], gainedExp: number, gainedCoins: number) => void;
  onClose: () => void;
  voiceGender: 'en-US' | 'en-GB';
  voiceSpeed: number;
}

export const WeakWordsDrill: React.FC<WeakWordsDrillProps> = ({
  weakWords,
  allWords,
  pet,
  onFinishDrill,
  onClose,
  voiceGender,
  voiceSpeed,
}) => {
  // We keep an active queue of weak words. If answered wrong, it gets pushed back to end of queue!
  const [drillQueue, setDrillQueue] = useState<Word[]>([]);
  const [clearedWords, setClearedWords] = useState<Word[]>([]);
  const [options, setOptions] = useState<string[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [earnedExp, setEarnedExp] = useState(0);
  const [earnedCoins, setEarnedCoins] = useState(0);

  // Auto-next timer ref on correct answer
  const autoNextTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (autoNextTimerRef.current) {
        clearTimeout(autoNextTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    // If user has weak words, load them; else sample low-repetition words
    let initialList = [...weakWords];
    if (initialList.length === 0) {
      initialList = allWords.filter(w => w.mistakeCount > 0 || w.status === 'learning').slice(0, 5);
    }
    if (initialList.length === 0) {
      initialList = allWords.slice(0, 5);
    }
    setDrillQueue(initialList);
  }, [weakWords, allWords]);

  const currentWord = drillQueue[0];

  // Generate options
  useEffect(() => {
    if (!currentWord) return;
    setIsAnswered(false);
    setSelectedOption(null);

    const correctAns = currentWord.meaning;
    const others = allWords.filter(w => w.id !== currentWord.id);
    const shuffledOthers = [...others].sort(() => Math.random() - 0.5);
    const wrongOptions = shuffledOthers.slice(0, 3).map(w => w.meaning);
    const combined = [correctAns, ...wrongOptions].sort(() => Math.random() - 0.5);
    setOptions(combined);
  }, [currentWord, allWords]);

  const handleSelectOption = (option: string) => {
    if (isAnswered || !currentWord) return;

    setSelectedOption(option);
    setIsAnswered(true);
    const correct = option.trim() === currentWord.meaning.trim();
    setIsCorrect(correct);

    speakEnglish(currentWord.word, voiceGender, voiceSpeed);

    if (correct) {
      soundFx.playCorrect();
      setEarnedExp(prev => prev + 30);
      setEarnedCoins(prev => prev + 20);

      // 若正確直接下一題（等待 550ms）
      autoNextTimerRef.current = setTimeout(() => {
        handleNextWord();
      }, 550);
    } else {
      soundFx.playWrong();
    }
  };

  const handleNextWord = () => {
    if (autoNextTimerRef.current) {
      clearTimeout(autoNextTimerRef.current);
      autoNextTimerRef.current = null;
    }
    if (!currentWord) return;

    if (isCorrect) {
      // Word mastered for now, remove from queue and add to cleared list
      const updatedWord: Word = {
        ...currentWord,
        isWeak: false,
        consecutiveCorrect: currentWord.consecutiveCorrect + 1,
      };
      setClearedWords(prev => [...prev, updatedWord]);
      setDrillQueue(prev => prev.slice(1));
    } else {
      // Push back to the end of the queue for re-drilling!
      const updatedWord: Word = {
        ...currentWord,
        isWeak: true,
        mistakeCount: currentWord.mistakeCount + 1,
      };
      setDrillQueue(prev => [...prev.slice(1), updatedWord]);
    }
  };

  // If all queue items cleared
  if (drillQueue.length === 0 && clearedWords.length > 0) {
    return (
      <div className="rounded-3xl border border-emerald-500/40 bg-slate-900/95 p-8 text-center shadow-2xl backdrop-blur-xl">
        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/20 px-3.5 py-1 text-xs font-bold text-emerald-300 border border-emerald-500/30 mb-3">
          <Award className="h-4 w-4" /> 弱點單字特訓圓滿達成！
        </div>

        <h3 className="text-2xl sm:text-3xl font-bold font-fun text-white mb-2">
          恭喜攻克所有不熟單字！
        </h3>
        <p className="text-xs text-slate-400 mb-6">
          已成功掌握 {clearedWords.length} 個高難度與易混淆單字，寵物獲得大量特訓營養！
        </p>

        <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto mb-6">
          <div className="rounded-2xl bg-slate-950/70 p-3 border border-slate-800">
            <p className="text-[11px] text-slate-400">特訓經驗</p>
            <p className="text-lg font-bold text-indigo-400">+{earnedExp} EXP</p>
          </div>
          <div className="rounded-2xl bg-slate-950/70 p-3 border border-slate-800">
            <p className="text-[11px] text-slate-400">金幣獎勵</p>
            <p className="text-lg font-bold text-amber-400">+{earnedCoins} 🪙</p>
          </div>
        </div>

        <button
          onClick={() => onFinishDrill(clearedWords, earnedExp, earnedCoins)}
          className="rounded-2xl bg-emerald-600 hover:bg-emerald-500 px-8 py-3 text-xs font-bold text-white transition-colors shadow-lg shadow-emerald-600/30"
        >
          儲存掌握進度並領取獎勵
        </button>
      </div>
    );
  }

  if (!currentWord) {
    return null;
  }

  return (
    <div className="relative overflow-hidden rounded-3xl border border-amber-500/40 bg-slate-900/95 p-5 sm:p-7 shadow-2xl backdrop-blur-xl">
      {/* Top Banner */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Flame className="h-5 w-5 text-amber-400 animate-pulse" />
          <div>
            <h3 className="text-base font-bold font-fun text-white">
              不熟單字強效特訓
            </h3>
            <p className="text-[11px] text-amber-400">
              循環重測機制：直到完全答對熟練為止！
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-lg bg-amber-500/20 px-2.5 py-1 text-xs font-bold text-amber-300 border border-amber-500/30">
            剩餘待攻克：{drillQueue.length} 題
          </span>
          <button onClick={onClose} className="text-xs text-slate-400 hover:text-white">
            結束
          </button>
        </div>
      </div>

      {/* Target Word Display */}
      <div className="my-6 rounded-2xl bg-slate-950/60 p-6 border border-slate-800 text-center">
        <div className="flex items-center justify-center gap-2 mb-1">
          <span className="text-xs px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30">
            {currentWord.partOfSpeech}
          </span>
          <span className="text-xs text-slate-400 font-mono">
            {currentWord.phonetic}
          </span>
          <button
            onClick={() => speakEnglish(currentWord.word, voiceGender, voiceSpeed)}
            className="text-slate-400 hover:text-indigo-400 p-1 transition-colors"
          >
            <Volume2 className="h-4 w-4" />
          </button>
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold font-fun text-white tracking-wide">
          {currentWord.word}
        </h2>
      </div>

      {/* Option Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {options.map((option, idx) => {
          const isThisCorrect = option === currentWord.meaning;
          const isThisSelected = selectedOption === option;

          let btnStyle =
            'border-slate-800 bg-slate-800/40 text-slate-200 hover:border-slate-700 hover:bg-slate-800/80';
          if (isAnswered) {
            if (isThisCorrect) {
              btnStyle = 'border-emerald-500 bg-emerald-500/20 text-emerald-200 font-bold';
            } else if (isThisSelected) {
              btnStyle = 'border-rose-500 bg-rose-500/20 text-rose-200 font-bold';
            } else {
              btnStyle = 'border-slate-800/40 bg-slate-950/40 text-slate-500 opacity-50';
            }
          }

          return (
            <button
              key={idx}
              disabled={isAnswered}
              onClick={() => handleSelectOption(option)}
              className={`flex items-center gap-3 rounded-2xl border p-4 text-left text-sm transition-all duration-200 ${btnStyle}`}
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-xs font-bold text-slate-400">
                {String.fromCharCode(65 + idx)}
              </span>
              <span className="flex-1 font-medium">{option}</span>
              {isAnswered && isThisCorrect && (
                <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
              )}
              {isAnswered && isThisSelected && !isThisCorrect && (
                <XCircle className="h-5 w-5 text-rose-400 shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {/* Clarification on Answer: ONLY show when incorrect! */}
      {isAnswered && !isCorrect && (
        <div className="mt-5 space-y-3 animate-in fade-in duration-200">
          <div className="rounded-2xl border border-rose-500/30 bg-rose-950/30 p-4 text-xs text-slate-300">
            <p className="font-bold text-rose-300 mb-1 text-sm">
              <span className="text-white font-mono">{currentWord.word}</span> = <span className="text-amber-300">{currentWord.meaning}</span>
            </p>
            <p className="italic text-slate-300">"{currentWord.exampleEn}"</p>
            <p className="text-slate-400 text-[11px] mb-2">{currentWord.exampleZh}</p>

            <div className="rounded-xl bg-amber-500/10 border border-amber-500/30 p-2.5 text-amber-200">
              <span className="font-bold">🧠 易混淆點及破解技巧：</span> {currentWord.confusionNotes}
            </div>
          </div>

          <button
            onClick={handleNextWord}
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-amber-500 hover:bg-amber-400 py-3.5 text-xs font-bold text-slate-950 transition-colors shadow-lg cursor-pointer"
          >
            記住了！放回隊列重測
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
};

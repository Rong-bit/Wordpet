import React, { useState, useEffect, useRef } from 'react';
import { Word, Pet, Item } from '../types';
import { calculateNextReview } from '../utils/srs';
import { soundFx } from '../utils/sound';
import { speakEnglish } from '../utils/tts';
import confetti from 'canvas-confetti';
import {
  Volume2,
  CheckCircle,
  XCircle,
  ArrowRight,
  BookOpen,
  Award,
  Sparkles,
  HelpCircle,
  RefreshCw,
  Zap,
} from 'lucide-react';

interface QuizSectionProps {
  dueWords: Word[];
  allWords: Word[];
  pet: Pet;
  onFinishQuiz: (updatedWords: Word[], gainedExp: number, gainedCoins: number, rewardItem?: Item) => void;
  onClose: () => void;
  voiceGender: 'en-US' | 'en-GB';
  voiceSpeed: number;
}

export type QuizDirection = 'zh_to_en' | 'en_to_zh' | 'listening';

export const QuizSection: React.FC<QuizSectionProps> = ({
  dueWords,
  allWords,
  pet,
  onFinishQuiz,
  onClose,
  voiceGender,
  voiceSpeed,
}) => {
  const [testWords, setTestWords] = useState<Word[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<QuizDirection>('en_to_zh');
  const [options, setOptions] = useState<string[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [typedAnswer, setTypedAnswer] = useState('');
  const [isSpellingMode, setIsSpellingMode] = useState(false);

  // Tracking completed words during session
  const [sessionResults, setSessionResults] = useState<{
    word: Word;
    isCorrect: boolean;
    quality: number;
  }[]>([]);

  // Incorrect words saved for post-quiz review / weak drill
  const [mistakeWords, setMistakeWords] = useState<Word[]>([]);

  // Rewards earned in this session
  const [earnedExp, setEarnedExp] = useState(0);
  const [earnedCoins, setEarnedCoins] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  // Auto-next timer ref for seamless instant transition on correct answer
  const autoNextTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (autoNextTimerRef.current) {
        clearTimeout(autoNextTimerRef.current);
      }
    };
  }, []);

  // Initialize test list
  useEffect(() => {
    // If no due words, pick 5 least reviewed words from allWords
    let initialList = [...dueWords];
    if (initialList.length === 0) {
      initialList = [...allWords]
        .sort((a, b) => a.repetition - b.repetition)
        .slice(0, 6);
    }
    // Shuffle
    setTestWords(initialList.sort(() => Math.random() - 0.5));
  }, [dueWords, allWords]);

  const currentWord = testWords[currentIndex];

  // Generate options when currentWord changes
  useEffect(() => {
    if (!currentWord || testWords.length === 0) return;

    setIsAnswered(false);
    setSelectedOption(null);
    setTypedAnswer('');

    // Auto-play audio if direction is listening
    if (direction === 'listening') {
      speakEnglish(currentWord.word, voiceGender, voiceSpeed);
    }

    if (direction === 'en_to_zh' || direction === 'listening') {
      // Correct is Chinese meaning
      const correctAns = currentWord.meaning;
      const otherWords = allWords.filter(w => w.id !== currentWord.id);
      const shuffledOthers = [...otherWords].sort(() => Math.random() - 0.5);
      const wrongOptions = shuffledOthers.slice(0, 3).map(w => w.meaning);
      const combined = [correctAns, ...wrongOptions].sort(() => Math.random() - 0.5);
      setOptions(combined);
    } else {
      // Direction: zh_to_en -> Correct is English word
      const correctAns = currentWord.word;
      const otherWords = allWords.filter(w => w.id !== currentWord.id);
      const shuffledOthers = [...otherWords].sort(() => Math.random() - 0.5);
      const wrongOptions = shuffledOthers.slice(0, 3).map(w => w.word);
      const combined = [correctAns, ...wrongOptions].sort(() => Math.random() - 0.5);
      setOptions(combined);
    }
  }, [currentIndex, testWords, direction, allWords, voiceGender, voiceSpeed]);

  if (!currentWord && !quizFinished) {
    return (
      <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-8 text-center text-slate-300">
        <p>測驗資料載入中...</p>
      </div>
    );
  }

  // Answer selection handler (Multiple choice)
  const handleSelectOption = (option: string) => {
    if (isAnswered) return;

    setSelectedOption(option);
    setIsAnswered(true);

    const targetAnswer =
      direction === 'zh_to_en' ? currentWord.word : currentWord.meaning;
    const correct = option.trim() === targetAnswer.trim();

    handleAnswerEvaluation(correct);
  };

  // Spelling submit handler
  const handleSpellingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isAnswered || !typedAnswer.trim()) return;

    setIsAnswered(true);
    const correct = typedAnswer.trim().toLowerCase() === currentWord.word.toLowerCase();
    setSelectedOption(typedAnswer);
    handleAnswerEvaluation(correct);
  };

  const handleAnswerEvaluation = (correct: boolean) => {
    setIsCorrect(correct);

    const quality = correct ? (isSpellingMode ? 5 : 4) : 1;

    // Apply SRS updates
    const srsUpdate = calculateNextReview(currentWord, quality);
    const updatedWord: Word = {
      ...currentWord,
      ...srsUpdate,
      lastReviewedAt: new Date().toISOString(),
      totalAttempts: currentWord.totalAttempts + 1,
    };

    setSessionResults(prev => [...prev, { word: updatedWord, isCorrect: correct, quality }]);

    if (correct) {
      soundFx.playCorrect();
      setEarnedExp(prev => prev + 25);
      setEarnedCoins(prev => prev + 15);

      // 測驗若正確，直接下一題（等待 550ms 讓使用者看見綠色反饋及播放提示音）
      autoNextTimerRef.current = setTimeout(() => {
        handleNextWord();
      }, 550);
    } else {
      soundFx.playWrong();
      setMistakeWords(prev => [...prev, updatedWord]);
    }

    // Pronounce word after answer
    speakEnglish(currentWord.word, voiceGender, voiceSpeed);
  };

  const handleNextWord = () => {
    if (autoNextTimerRef.current) {
      clearTimeout(autoNextTimerRef.current);
      autoNextTimerRef.current = null;
    }
    if (currentIndex + 1 < testWords.length) {
      setCurrentIndex(prev => prev + 1);
    } else {
      // Quiz finished
      setQuizFinished(true);
      soundFx.playLevelUp();
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  };

  const handleFinalSubmit = () => {
    const updatedList = sessionResults.map(r => r.word);
    onFinishQuiz(updatedList, earnedExp, earnedCoins);
  };

  const handleRetryMistakes = () => {
    if (mistakeWords.length === 0) return;
    setTestWords([...mistakeWords].sort(() => Math.random() - 0.5));
    setCurrentIndex(0);
    setSessionResults([]);
    setMistakeWords([]);
    setQuizFinished(false);
  };

  // --- FINAL RESULTS SUMMARY VIEW ---
  if (quizFinished) {
    const correctCount = sessionResults.filter(r => r.isCorrect).length;
    const accuracy = Math.round((correctCount / sessionResults.length) * 100) || 0;

    return (
      <div className="relative overflow-hidden rounded-3xl border border-slate-700 bg-slate-900/95 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        <div className="text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/20 px-3.5 py-1 text-xs font-bold text-indigo-300 border border-indigo-500/30 mb-3">
            <Award className="h-4 w-4 text-amber-400" />
            測驗圓滿完成！
          </div>

          <h3 className="text-2xl sm:text-3xl font-bold font-fun text-white mb-2">
            艾賓豪斯複習成果驗收
          </h3>
          <p className="text-xs text-slate-400">
            間隔重複系統已自動為你安排了各單字的下一次最佳複習時機！
          </p>

          {/* Stats Badges */}
          <div className="my-6 grid grid-cols-3 gap-3">
            <div className="rounded-2xl bg-slate-950/70 p-3.5 border border-slate-800">
              <p className="text-[11px] text-slate-400">正確率</p>
              <p className="text-xl font-bold text-emerald-400">{accuracy}%</p>
            </div>
            <div className="rounded-2xl bg-slate-950/70 p-3.5 border border-slate-800">
              <p className="text-[11px] text-slate-400">寵物經驗值</p>
              <p className="text-xl font-bold text-indigo-400">+{earnedExp} EXP</p>
            </div>
            <div className="rounded-2xl bg-slate-950/70 p-3.5 border border-slate-800">
              <p className="text-[11px] text-slate-400">金幣獎勵</p>
              <p className="text-xl font-bold text-amber-400">+{earnedCoins} 🪙</p>
            </div>
          </div>

          {/* Mistake List & Clarification */}
          {mistakeWords.length > 0 ? (
            <div className="mb-6 rounded-2xl bg-rose-950/30 border border-rose-500/30 p-4 text-left">
              <h4 className="text-xs font-bold text-rose-300 flex items-center gap-1.5 mb-2">
                <XCircle className="h-4 w-4 text-rose-400" />
                本次測驗易錯單字（已自動標記為不熟，可立即進行加強特訓）：
              </h4>
              <div className="space-y-2">
                {mistakeWords.map(w => (
                  <div key={w.id} className="rounded-xl bg-slate-900/80 p-2.5 border border-slate-800 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">
                        {w.word} <span className="text-[11px] text-slate-400 font-normal">{w.phonetic} {w.partOfSpeech}</span>
                      </span>
                      <span className="text-amber-300 font-semibold">{w.meaning}</span>
                    </div>
                    <p className="mt-1 text-[11px] text-slate-300">{w.confusionNotes}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="mb-6 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 p-4 text-center">
              <p className="text-sm font-bold text-emerald-300 flex items-center justify-center gap-1.5">
                <Sparkles className="h-4 w-4 text-amber-300" /> 太神了！本次測驗全數正確，完美通關！
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            {mistakeWords.length > 0 && (
              <button
                onClick={handleRetryMistakes}
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-2xl bg-rose-600/30 hover:bg-rose-600/40 border border-rose-500/40 px-5 py-3 text-xs font-bold text-rose-200 transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                立即加強特訓錯題 ({mistakeWords.length})
              </button>
            )}
            <button
              onClick={handleFinalSubmit}
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 hover:bg-indigo-500 px-7 py-3 text-xs font-bold text-white transition-colors shadow-lg shadow-indigo-600/30"
            >
              <CheckCircle className="h-4 w-4" />
              領取獎勵並返回首頁
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- ACTIVE QUIZ QUESTION VIEW ---
  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-700 bg-slate-900/95 p-5 sm:p-7 shadow-2xl backdrop-blur-xl">
      {/* Top Controls: Mode Switch & Progress */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
        {/* Direction Switcher */}
        <div className="flex items-center gap-1 rounded-xl bg-slate-950/70 p-1 border border-slate-800">
          <button
            onClick={() => setDirection('en_to_zh')}
            className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
              direction === 'en_to_zh'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            英文考中文
          </button>
          <button
            onClick={() => setDirection('zh_to_en')}
            className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
              direction === 'zh_to_en'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            中文考英文
          </button>
          <button
            onClick={() => setDirection('listening')}
            className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
              direction === 'listening'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            聽力盲測
          </button>
        </div>

        {/* Spelling Toggle & Progress */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSpellingMode(!isSpellingMode)}
            className={`rounded-xl px-2.5 py-1 text-xs font-bold border transition-colors ${
              isSpellingMode
                ? 'border-amber-500/50 bg-amber-500/20 text-amber-300'
                : 'border-slate-800 bg-slate-800/40 text-slate-400 hover:text-white'
            }`}
          >
            {isSpellingMode ? '✏️ 拼寫測驗' : '🔲 選擇題'}
          </button>

          <span className="text-xs font-bold text-indigo-300">
            {currentIndex + 1} / {testWords.length}
          </span>

          <button
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-white"
          >
            結束
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="my-4 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / testWords.length) * 100}%` }}
        />
      </div>

      {/* Main Question Card */}
      <div className="my-6 rounded-2xl bg-slate-950/60 p-6 border border-slate-800/80 text-center">
        {/* Listening Mode or Regular Mode */}
        {direction === 'listening' ? (
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
              🎧 請仔細聆聽發音
            </span>
            <div className="my-4 flex items-center justify-center">
              <button
                onClick={() => speakEnglish(currentWord.word, voiceGender, voiceSpeed)}
                className="h-16 w-16 rounded-full bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 flex items-center justify-center text-indigo-300 transition-all hover:scale-105 active:scale-95"
              >
                <Volume2 className="h-8 w-8 animate-pulse" />
              </button>
            </div>
            {isAnswered && (
              <p className="text-xl font-bold font-fun text-white mt-2">
                {currentWord.word}
                <span className="text-xs font-normal text-slate-400 ml-2">
                  {currentWord.phonetic}
                </span>
              </p>
            )}
          </div>
        ) : direction === 'en_to_zh' ? (
          <div>
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-xs sm:text-sm px-2.5 py-1 rounded-md bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30">
                {currentWord.partOfSpeech}
              </span>
              <span className="text-sm sm:text-base text-slate-400 font-mono">
                {currentWord.phonetic}
              </span>
              <button
                onClick={() => speakEnglish(currentWord.word, voiceGender, voiceSpeed)}
                className="text-slate-400 hover:text-indigo-400 p-1.5 transition-colors cursor-pointer"
                title="語音朗讀"
              >
                <Volume2 className="h-5 w-5" />
              </button>
            </div>
            <h2 className="text-4xl sm:text-5xl font-black font-fun text-white tracking-wide">
              {currentWord.word}
            </h2>
          </div>
        ) : (
          /* zh_to_en: Chinese Prompt */
          <div>
            <div className="text-xs sm:text-sm px-2.5 py-1 rounded-md bg-purple-500/20 text-purple-300 font-bold inline-block mb-2 border border-purple-500/30">
              {currentWord.partOfSpeech} 請選出正確英文單字
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-amber-300 tracking-wide">
              {currentWord.meaning}
            </h2>
          </div>
        )}
      </div>

      {/* Answer Options or Spelling Form */}
      {!isSpellingMode ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {options.map((option, idx) => {
            const targetAnswer =
              direction === 'zh_to_en' ? currentWord.word : currentWord.meaning;
            const isThisCorrect = option === targetAnswer;
            const isThisSelected = selectedOption === option;

            let btnStyle =
              'border-slate-800 bg-slate-800/40 text-slate-200 hover:border-slate-700 hover:bg-slate-800/80';
            if (isAnswered) {
              if (isThisCorrect) {
                btnStyle = 'border-emerald-500 bg-emerald-500/20 text-emerald-200 font-black shadow-lg shadow-emerald-500/20';
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
                className={`flex items-center gap-3.5 rounded-2xl border p-4 sm:p-5 text-left text-base sm:text-lg transition-all duration-200 min-h-[64px] cursor-pointer ${btnStyle}`}
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-xs sm:text-sm font-bold text-slate-400">
                  {String.fromCharCode(65 + idx)}
                </span>
                <span className="flex-1 font-bold leading-snug">{option}</span>
                {isAnswered && isThisCorrect && (
                  <CheckCircle className="h-6 w-6 text-emerald-400 shrink-0" />
                )}
                {isAnswered && isThisSelected && !isThisCorrect && (
                  <XCircle className="h-6 w-6 text-rose-400 shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      ) : (
        /* Spelling Input Box */
        <form onSubmit={handleSpellingSubmit} className="space-y-3">
          <input
            type="text"
            disabled={isAnswered}
            value={typedAnswer}
            onChange={e => setTypedAnswer(e.target.value)}
            placeholder="請輸入英文單字拼寫..."
            autoFocus
            className="w-full rounded-2xl bg-slate-950 border border-slate-700 px-4 py-3.5 text-base text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
          {!isAnswered && (
            <button
              type="submit"
              disabled={!typedAnswer.trim()}
              className="w-full rounded-2xl bg-indigo-600 hover:bg-indigo-500 py-3 text-xs font-bold text-white transition-colors"
            >
              提交拼寫驗證
            </button>
          )}
        </form>
      )}

      {/* Answer Feedback & Error Analysis: ONLY show when incorrect! */}
      {isAnswered && !isCorrect && (
        <div className="mt-5 space-y-3 animate-in fade-in duration-300">
          <div className="rounded-2xl border border-rose-500/30 bg-rose-950/30 text-rose-200 p-4 sm:p-5 text-sm">
            <div className="flex items-center gap-2 font-black text-base sm:text-lg mb-2 text-rose-300">
              <XCircle className="h-5 w-5 text-rose-400 shrink-0" />
              答錯了，請仔細查看觀念解析！
            </div>

            {/* In-depth error clarification */}
            <div className="space-y-2 text-slate-300 text-sm sm:text-base">
              <p>
                <span className="font-extrabold text-white text-base sm:text-lg">{currentWord.word}</span>{' '}
                <span className="text-slate-400 font-mono">{currentWord.phonetic}</span> :{' '}
                <span className="font-bold text-amber-300">{currentWord.meaning}</span>
              </p>
              <div className="rounded-xl bg-slate-900/80 p-3 border border-slate-800 text-sm sm:text-base">
                <p className="text-slate-200 italic">"{currentWord.exampleEn}"</p>
                <p className="text-slate-400 text-xs sm:text-sm mt-1">{currentWord.exampleZh}</p>
              </div>
              <p className="text-xs sm:text-sm text-indigo-300 bg-indigo-950/40 p-2.5 rounded-xl border border-indigo-900/60 leading-relaxed">
                💡 <span className="font-bold">易混淆辨析 / 記憶技巧：</span> {currentWord.confusionNotes}
              </p>
            </div>
          </div>

          {/* Continue button */}
          <button
            onClick={handleNextWord}
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 hover:bg-indigo-500 py-4 text-sm sm:text-base font-bold text-white transition-all shadow-lg shadow-indigo-600/30 active:scale-98 cursor-pointer"
          >
            {currentIndex + 1 < testWords.length ? '下一題複習' : '查看本次複習總結'}
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  );
};

import { Word, WordStatus } from '../types';

export interface SrsResult {
  nextReviewAt: string;
  repetition: number;
  easeFactor: number;
  intervalDays: number;
  status: WordStatus;
  consecutiveCorrect: number;
  isWeak: boolean;
}

/**
 * SuperMemo SM-2 & Ebbinghaus Interval Calculator
 * @param word Current word object
 * @param quality 0 (Fail), 3 (Pass with effort), 4 (Good), 5 (Easy/Mastered)
 */
export function calculateNextReview(word: Word, quality: number): SrsResult {
  let { repetition, easeFactor, intervalDays, consecutiveCorrect, mistakeCount } = word;

  const isCorrect = quality >= 3;

  if (isCorrect) {
    consecutiveCorrect += 1;
    if (repetition === 0) {
      intervalDays = 1;
    } else if (repetition === 1) {
      intervalDays = 3;
    } else if (repetition === 2) {
      intervalDays = 7;
    } else {
      intervalDays = Math.round(intervalDays * easeFactor);
    }
    repetition += 1;
  } else {
    consecutiveCorrect = 0;
    repetition = 0;
    intervalDays = 1; // Needs review tomorrow or same day
    mistakeCount += 1;
  }

  // Calculate new Ease Factor
  easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (easeFactor < 1.3) {
    easeFactor = 1.3;
  }

  // Status mapping
  let status: WordStatus = 'learning';
  if (repetition === 0) {
    status = 'learning';
  } else if (repetition < 3) {
    status = 'reviewing';
  } else {
    status = 'mastered';
  }

  // Mark as weak if mistakeCount >= 2 or failed recently
  const isWeak = (!isCorrect || mistakeCount >= 2) && status !== 'mastered';

  // Compute next review date
  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + intervalDays);

  return {
    nextReviewAt: nextDate.toISOString(),
    repetition,
    easeFactor: Number(easeFactor.toFixed(2)),
    intervalDays,
    status,
    consecutiveCorrect,
    isWeak,
  };
}

/**
 * Calculate expected retention based on Ebbinghaus curve:
 * R = e^(-t / S), where t is elapsed days and S is memory stability (proportional to repetition)
 */
export function calculateRetentionRate(word: Word): number {
  if (!word.lastReviewedAt) return 0;
  const now = new Date().getTime();
  const lastRev = new Date(word.lastReviewedAt).getTime();
  const elapsedDays = Math.max(0, (now - lastRev) / (1000 * 60 * 60 * 24));

  // Memory stability increases with repetition: S ≈ 1.5 * (repetition + 1)^1.2
  const stability = Math.max(1, 1.8 * Math.pow(word.repetition + 1, 1.3));
  const retention = Math.exp(-elapsedDays / stability);
  return Math.min(100, Math.max(0, Math.round(retention * 100)));
}

/**
 * Theoretical Ebbinghaus curve data points for comparison visualization
 */
export function getEbbinghausCurveData() {
  const points = [];
  // Standard forgetting without repetition vs With WordPet SRS
  const times = [0, 0.33, 1, 2, 4, 7, 15, 30]; // in days
  for (const day of times) {
    // Standard without review: R = e^(-day / 1.5)
    const naturalRate = Math.round(Math.exp(-day / 1.6) * 100);
    // With spaced repetition: resets to ~100% on review days, decays much slower
    let srsRate = 100;
    if (day <= 1) {
      srsRate = Math.round(92 - day * 8);
    } else if (day <= 3) {
      srsRate = Math.round(95 - (day - 1) * 5);
    } else if (day <= 7) {
      srsRate = Math.round(93 - (day - 3) * 3);
    } else {
      srsRate = Math.round(94 - (day - 7) * 0.8);
    }

    points.push({
      day: day === 0 ? '即刻' : `${day}天`,
      naturalRate: Math.max(15, naturalRate),
      srsRate: Math.max(80, srsRate),
    });
  }
  return points;
}

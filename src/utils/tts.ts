// High-fidelity English pronunciation engine: Native Studio Audio + Natural Neural TTS fallback

let currentAudio: HTMLAudioElement | null = null;
let cachedVoices: SpeechSynthesisVoice[] = [];

// Preload and cache browser voices as soon as available
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  const loadVoices = () => {
    cachedVoices = window.speechSynthesis.getVoices();
  };
  loadVoices();
  if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }
}

/**
 * Find the best natural English voice from browser speechSynthesis
 */
function getBestEnglishVoice(accent: 'en-US' | 'en-GB'): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;

  const voices = cachedVoices.length > 0 ? cachedVoices : window.speechSynthesis.getVoices();
  if (voices.length === 0) return null;

  // Filter ONLY English voices
  const enVoices = voices.filter(v => v.lang.toLowerCase().startsWith('en'));
  if (enVoices.length === 0) return null;

  const targetLang = accent.toLowerCase();

  // Preferred high-quality natural voice names
  const preferredNames = [
    'natural',
    'google us english',
    'google uk english',
    'samantha',
    'daniel',
    'karen',
    'alex',
    'jenny',
    'aria',
    'guy',
    'serena',
    'oliver',
    'kate',
  ];

  // 1. Exact language match + preferred high-quality voice
  const preferredMatch = enVoices.find(
    v =>
      v.lang.toLowerCase().replace('_', '-') === targetLang &&
      preferredNames.some(name => v.name.toLowerCase().includes(name))
  );
  if (preferredMatch) return preferredMatch;

  // 2. Exact language match
  const exactLangMatch = enVoices.find(
    v => v.lang.toLowerCase().replace('_', '-') === targetLang
  );
  if (exactLangMatch) return exactLangMatch;

  // 3. Any English voice with preferred natural name
  const anyPreferred = enVoices.find(v =>
    preferredNames.some(name => v.name.toLowerCase().includes(name))
  );
  if (anyPreferred) return anyPreferred;

  // 4. Any English voice
  return enVoices[0];
}

/**
 * Fallback to browser Web Speech API with strict English voice selection
 */
function speakViaWebSpeech(text: string, accent: 'en-US' | 'en-GB', rate: number) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

  try {
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = accent;
    utterance.rate = Math.max(0.7, Math.min(1.2, rate));
    utterance.pitch = 1.0;

    const voice = getBestEnglishVoice(accent);
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang;
    }

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn('Speech synthesis playback error:', err);
  }
}

/**
 * Speak English text with native studio pronunciation (high fidelity)
 * Automatically falls back to Web Speech API if offline or for full sentences
 */
export const speakEnglish = (
  text: string,
  accent: 'en-US' | 'en-GB' = 'en-US',
  rate: number = 0.95
) => {
  if (!text || typeof window === 'undefined') return;

  const cleanText = text.trim();
  const wordCount = cleanText.split(/\s+/).length;

  // Stop any currently playing audio
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }

  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }

  // For individual words or short phrases (<= 3 words), use authentic native human pronunciation
  if (wordCount <= 3 && !/[，。！？\n]/.test(cleanText)) {
    try {
      // type=1 is British (en-GB), type=2 is American (en-US)
      // 有道部分單字只缺其中一種口音（例如 rely 的美式音檔會回 500），失敗時先改用另一種口音
      const audioTypes = accent === 'en-GB' ? [1, 2] : [2, 1];
      const audioUrls = audioTypes.map(
        t => `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(cleanText)}&type=${t}`
      );

      // iOS 只允許在點擊當下啟動播放；沿用同一個 audio 元件換音源，才能在非同步失敗後繼續播放
      const audio = new Audio();
      currentAudio = audio;
      const playbackRate = Math.max(0.75, Math.min(1.25, rate));

      let fellBack = false;
      const fallbackToWebSpeech = () => {
        if (fellBack || currentAudio !== audio) return;
        fellBack = true;
        speakViaWebSpeech(cleanText, accent, rate);
      };

      let nextIndex = 0;
      const playNextSource = () => {
        if (currentAudio !== audio) return;
        if (nextIndex >= audioUrls.length) {
          fallbackToWebSpeech();
          return;
        }
        audio.src = audioUrls[nextIndex++];
        audio.defaultPlaybackRate = playbackRate;
        audio.playbackRate = playbackRate;
        audio.play()?.catch(err => {
          // 載入失敗交給 onerror 換下一個音源；被瀏覽器擋下自動播放才直接改用 Web Speech
          if (err?.name === 'NotAllowedError') fallbackToWebSpeech();
        });
      };

      audio.onerror = playNextSource;
      playNextSource();

      return;
    } catch {
      speakViaWebSpeech(cleanText, accent, rate);
      return;
    }
  }

  // For longer sentences / examples, use the natural Web Speech API
  speakViaWebSpeech(cleanText, accent, rate);
};

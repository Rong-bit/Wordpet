export const speakEnglish = (
  text: string,
  accent: 'en-US' | 'en-GB' = 'en-US',
  rate: number = 0.95
) => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    console.warn('Speech synthesis not supported in this browser.');
    return;
  }

  window.speechSynthesis.cancel(); // Stop any pending utterance

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = accent;
  utterance.rate = rate;
  utterance.pitch = 1.0;

  // Try to find a matching natural voice
  const voices = window.speechSynthesis.getVoices();
  const matchedVoice = voices.find(v => v.lang === accent || v.lang.startsWith(accent.split('-')[0]));
  if (matchedVoice) {
    utterance.voice = matchedVoice;
  }

  window.speechSynthesis.speak(utterance);
};

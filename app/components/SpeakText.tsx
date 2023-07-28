const msgSource = new Map<string, SpeechSynthesisUtterance>();
// let msgTarget: SpeechSynthesisUtterance | null = null;

export function InitSpeech() {
  if (msgSource.size > 0 || !window.speechSynthesis) {
    return;
  }

  window.speechSynthesis.getVoices();
  // console.log('voices', voices);

  const langs = ['en', 'ru', 'tr'];
  // create a new utterance for each language
  langs.forEach((lang) => {
    const msg = new SpeechSynthesisUtterance();
    msg.lang = lang;
    msgSource.set(lang, msg);
  });
}

const getLanguage = (names: string[], lang: string) => {
  const voices = window.speechSynthesis.getVoices();
  const voicesFiltered = voices.filter((voice) => voice.lang.startsWith(lang));
  // console.log(lang, voicesFiltered);

  // console.log('Voices for', lang, voicesFiltered);

  if (names.length > 0) {
    for (const name of names) {
      const findByName = voicesFiltered.find((voice) => voice.voiceURI.includes(name));
      if (findByName) return findByName;
    }
  }

  if (voicesFiltered.length > 0) {
    return voicesFiltered[0];
  }

  return null;
};

let lastMsg: SpeechSynthesisUtterance | null = null;

export function SpeakText(text: string, language: string) {
  if (msgSource.size === 0) {
    InitSpeech();
    return;
  }

  const msg = msgSource.get(language);
  if (msg && (!lastMsg || lastMsg.text !== text)) {
    speechSynthesis.cancel();
    msg.text = text;
    switch (language) {
      case 'ru':
        // msg.voice = getLanguage(['US.Samantha'], 'en');
        msg.lang = 'ru';
        msg.volume = 0.8;
        break;
      case 'tr':
        msg.voice = getLanguage([], language);
        msg.volume = 1;
        break;
      case 'en':
        msg.voice = getLanguage(['Karen', 'Daniel', 'US.Samantha'], language);
        msg.volume = 0.8;
        break;
    }
    lastMsg = msg;
    speechSynthesis.speak(msg);
  }
}

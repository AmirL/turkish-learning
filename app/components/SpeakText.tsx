let msgSource = new Map<string, SpeechSynthesisUtterance>();
// let msgTarget: SpeechSynthesisUtterance | null = null;

export function InitSpeech() {
  if (msgSource.size > 0 || !window.speechSynthesis) {
    return;
  }

  const voices = window.speechSynthesis.getVoices();
  console.log('voices', voices);

  const langs = ['en', 'ru', 'tr'];
  // create a new utterance for each language
  langs.forEach((lang) => {
    const msg = new SpeechSynthesisUtterance();
    msg.lang = lang;
    msgSource.set(lang, msg);
  });
}

const getLanguage = (name: string, lang: string) => {
  const voices = window.speechSynthesis.getVoices();
  if (name > '') {
    const findByName = voices.find((voice) => voice.name.includes(name));
    if (findByName) return findByName;
  }

  if (lang > '') {
    const findByLang = voices.find((voice) => voice.lang.includes(lang));
    if (findByLang) return findByLang;
  }

  return null;
};

let lastMsg: SpeechSynthesisUtterance | null = null;

export function SpeakText(text: string, language: string) {
  if (msgSource.size === 0) {
    InitSpeech();
    return;
  }

  const voices = window.speechSynthesis.getVoices();
  console.log('voices', voices);

  const msg = msgSource.get(language);
  if (msg && (!lastMsg || lastMsg.text !== text)) {
    msg.text = text;
    switch (language) {
      case 'ru':
        // msg.voice = getLanguage('Google русский', '');
        msg.lang = 'ru';
        msg.volume = 0.8;
        break;
      case 'tr':
        msg.voice = getLanguage('', 'tr-TR');
        msg.volume = 1;
        break;
      case 'en':
        msg.voice = getLanguage('Google US English', 'en-US');
        msg.volume = 1;
        break;
    }
    lastMsg = msg;
    speechSynthesis.speak(msg);
  }
}

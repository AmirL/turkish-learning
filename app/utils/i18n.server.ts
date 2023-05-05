import type { TranslatedKey } from './useTranslation';
import { TranslatedStringsKeys } from './useTranslation';

import langRuJson from './locales/ru.json';
import langEnJson from './locales/en.json';

export async function getTranslatedStrings(lang: string) {
  const data = lang === 'ru' ? langRuJson : langEnJson;
  const translatedStrings: any = {};

  for (const i in TranslatedStringsKeys) {
    const key: TranslatedKey = TranslatedStringsKeys[i];
    // generate&fill translated strings
    translatedStrings[key] = data[key] ?? key;
  }

  return translatedStrings;
}

import type { TranslatedKey } from './useTranslation';
import { TranslatedStringsKeys } from './useTranslation';
import path from 'path';

export function getTranslatedStrings(lang: string) {
  const langFile = path.join(process.cwd(), 'public', 'locales', `${lang}.json`);
  const data = require(langFile);
  const translatedStrings: any = {};

  for (const i in TranslatedStringsKeys) {
    const key: TranslatedKey = TranslatedStringsKeys[i];
    // generate&fill translated strings
    translatedStrings[key] = data[key] ?? key;
  }

  return translatedStrings;
}

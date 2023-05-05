import type { TranslatedKey } from './useTranslation';
import { TranslatedStringsKeys } from './useTranslation';
import path from 'path';

import { promises as fs } from 'fs';

export async function getTranslatedStrings(lang: string) {
  const langFile = path.join(process.cwd(), 'locales', `${lang}.json`);
  const data = JSON.parse(await fs.readFile(langFile, 'utf8'));
  const translatedStrings: any = {};

  for (const i in TranslatedStringsKeys) {
    const key: TranslatedKey = TranslatedStringsKeys[i];
    // generate&fill translated strings
    translatedStrings[key] = data[key] ?? key;
  }

  return translatedStrings;
}

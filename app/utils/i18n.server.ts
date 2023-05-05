import i18n from 'i18n';
import type { TranslatedKey } from './useTranslation';
import { TranslatedStringsKeys } from './useTranslation';
import path from 'path';

i18n.configure({
  locales: ['en', 'ru'],
  directory: path.join(process.cwd(), 'public', 'locales'),
  //path.resolve('./public/locales/'),
});

export const translatedStrings: any = {};

for (const i in TranslatedStringsKeys) {
  const key: TranslatedKey = TranslatedStringsKeys[i];
  // generate&fill translated strings
  translatedStrings[key] = i18n.__(key);
}

import i18n from 'i18n';
import type { TranslatedKey } from './useTranslation';
import { TranslatedStringsKeys } from './useTranslation';

export const translatedStrings: any = {};

for (const i in TranslatedStringsKeys) {
  const key: TranslatedKey = TranslatedStringsKeys[i];
  // generate&fill translated strings
  translatedStrings[key] = i18n.__(key);
}

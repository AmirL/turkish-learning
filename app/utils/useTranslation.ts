import { useContext } from 'react';
import { AppContext } from '~/components/AppContext';

export const TranslatedStringsKeys = [
  'Home',
  'Admin',
  'Repeat',
  'Charts',
  'Profile',
  'Topics',
  'Progress',
  'Select language to repeat',
  'Remember',
  'Well known words',
  'Known words',
  'Learned words',
  'Got it',
  'Click on the word to flip',
  'Generate new avatar',
  'Name',
  'Email',
  'Settings',
  'Native language',
  'Learning mode',
  'Save',
  'Logout',
  'Completed',
  'Go back',
  'Word',
  'Translation',
  'Level',
  'Next review',
  'Today',
  'in %i days',
  'Repeat words',
  'Remember words',
] as const;

export type TranslatedStrings = Record<typeof TranslatedStringsKeys[number], string>;
export type TranslatedKey = keyof TranslatedStrings;

export function useTranslation() {
  const context = useContext(AppContext);
  return (key: TranslatedKey) => context.translated?.[key] ?? key;
}

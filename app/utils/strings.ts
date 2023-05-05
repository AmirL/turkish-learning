/* get long language name by given short language name */
export function getLanguageLabel(language: string) {
  switch (language) {
    case 'en':
      return '🇬🇧 English';
    case 'tr':
      return '🇹🇷 Turkish';
    case 'ru':
    default:
      return '🇷🇺 Russian';
  }
}

export const UserLanguages = ['en', 'ru'];

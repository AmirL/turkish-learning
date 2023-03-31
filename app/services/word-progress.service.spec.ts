import type { Topic, Word } from '@prisma/client';
import { expect, test, describe } from 'vitest';
import { LearningMode, WordProgressService } from './word-progress.service.server';

// test('1 === 1', () => {
//   expect(1).toBe(1);
// });

describe('getWordVariantsByLearningMode', () => {
  type wordsWithDirection = Word & { topic: Topic };

  const topic: Topic = {
    id: 245,
    name: 'Фрукты',
    difficulty: 0,
    languageSource: 'en',
    languageTarget: 'ru',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const defaultWord = {
    id: 0,
    word: '',
    translation: '',
    topic_id: 245,
    createdAt: new Date(),
    updatedAt: new Date(),
    topic,
  };

  const words: wordsWithDirection[] = [
    {
      ...defaultWord,
      word: 'Cherry',
      translation: 'Вишня',
    },
    {
      ...defaultWord,
      word: 'Kiwi',
      translation: 'Киви',
    },
    {
      ...defaultWord,
      word: 'Mango',
      translation: 'Манго',
    },
  ];

  test('normal', () => {
    const withDirection = WordProgressService.getWordVariantsByLearningMode(LearningMode.normal, words);
    expect(withDirection).length(3);

    expect(withDirection.every((item) => item.level === 0)).toBe(true);
    expect(withDirection.every((item) => item.wrong === 0)).toBe(true);
    expect(withDirection.every((item) => item.isReversed === false)).toBe(true);
  });

  test('reverse', () => {
    const withDirection = WordProgressService.getWordVariantsByLearningMode(LearningMode.reverse, words);
    expect(withDirection).length(3);

    expect(withDirection.every((item) => item.level === 0)).toBe(true);
    expect(withDirection.every((item) => item.wrong === 0)).toBe(true);
    expect(withDirection.every((item) => item.isReversed === true)).toBe(true);
  });

  test('both', () => {
    const withDirection = WordProgressService.getWordVariantsByLearningMode(LearningMode.both, words);
    expect(withDirection).length(6);

    expect(withDirection.every((item) => item.level === 0)).toBe(true);
    expect(withDirection.every((item) => item.wrong === 0)).toBe(true);
    expect(withDirection.filter((item) => item.isReversed === true)).length(3);
    expect(withDirection.filter((item) => item.isReversed === false)).length(3);
  });
});

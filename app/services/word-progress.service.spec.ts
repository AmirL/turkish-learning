import { faker } from '@faker-js/faker';
import type { WordProgress } from '@prisma/client';
import { WordWithProgress } from './word-progress.service.server';
import {
  fakeMultiple,
  fakeTopic,
  fakeWordProgress,
  fakeWordProgressForWords,
  fakeWordWithTopic,
} from 'prisma/types/fake-data';
import { expect, describe, it, vi, beforeEach, test } from 'vitest';
import { db } from '~/utils/__mocks__/db.server';
import { LearningMode, WordProgressService } from './word-progress.service.server';

vi.mock('~/utils/db.server');

describe('WordProgressService', () => {
  const topic = fakeTopic();
  const topicWords = fakeMultiple(3, fakeWordWithTopic, { topic });
  const wordsProgressNormal: WordProgress[] = fakeWordProgressForWords(topicWords, topic, { isReversed: false });
  const wordsProgressReverse: WordProgress[] = fakeWordProgressForWords(topicWords, topic, { isReversed: true });
  const wordsProgressBoth = [...wordsProgressNormal, ...wordsProgressReverse];

  describe('getWordsProgress', () => {
    beforeEach(() => {
      vi.restoreAllMocks();
    });

    it('returns words with level 0 and wrong 0 when no progress yet', async () => {
      // given topicWords
      // when no progress yet
      db.wordProgress.findMany.mockResolvedValueOnce([]);

      // then
      const words = await WordProgressService.getWordsProgress(topicWords, 1, LearningMode.normal);
      expect(words).length(3);
      expect(words.every((item) => item.level === 0)).toBe(true);
      expect(words.every((item) => item.wrong === 0)).toBe(true);
    });

    it('returns words isReversed = true when learningMode = reverse', async () => {
      // given topicWords
      // when no progress yet
      // and learningMode = reverse
      db.wordProgress.findMany.mockResolvedValueOnce([]);

      // then
      const words = await WordProgressService.getWordsProgress(topicWords, 1, LearningMode.reverse);
      expect(words).length(3);
      expect(words.every((item) => item.isReversed === true)).toBe(true);
    });

    it('returns words isReversed = false when learningMode = normal', async () => {
      // given topicWords
      // when no progress yet
      // and learningMode = normal
      db.wordProgress.findMany.mockResolvedValueOnce([]);

      // then
      const words = await WordProgressService.getWordsProgress(topicWords, 1, LearningMode.normal);
      expect(words).length(3);
      expect(words.every((item) => item.isReversed === false)).toBe(true);
    });

    it('returns words isReversed = true + isReversed = false when learningMode = both', async () => {
      // given topicWords
      // when no progress yet
      // and learningMode = both
      db.wordProgress.findMany.mockResolvedValueOnce([]);

      // then
      const words = await WordProgressService.getWordsProgress(topicWords, 1, LearningMode.both);
      expect(words).length(6);
      expect(words.filter((item) => item.isReversed === true)).length(3);
      expect(words.filter((item) => item.isReversed === false)).length(3);
    });

    it('return existing words progress', async () => {
      // given topicWords
      // when progress for some words exists
      // and learningMode = both
      let wordsProgress: WordProgress[] = fakeWordProgressForWords(topicWords, topic, { isReversed: false });
      db.wordProgress.findMany.mockResolvedValueOnce(wordsProgress);

      // then
      const words = await WordProgressService.getWordsProgress(topicWords, 1, LearningMode.both);
      expect(words).length(6);
      // words with progress
      expect(words.filter((item) => item.isReversed === false && item.level > 0)).length(3);
      expect(words.filter((item) => item.isReversed === false && item.wrong > 0)).length(3);
      // words without progress
      expect(words.filter((item) => item.isReversed === true && item.wrong == 0)).length(3);
      expect(words.filter((item) => item.isReversed === true && item.level == 0)).length(3);
    });
  });

  describe('getNextReviewDate', () => {
    const today = new Date(Date.now());
    today.setUTCHours(0, 0, 0, 0);
    const todayTimestamp = today.getTime();

    const testData = [
      { level: 0, correct: true, expected: null },
      { level: 4, correct: true, expected: null },
      { level: 5, correct: true, expected: 1 },
      { level: 6, correct: true, expected: 3 },
      { level: 7, correct: true, expected: 6 },
      { level: 8, correct: true, expected: 14 },
      { level: 9, correct: true, expected: 30 },
      { level: 10, correct: true, expected: 90 },
      { level: 6, correct: false, expected: null },
    ];
    it.each(testData)('returns correct next review date', (data) => {
      const result = WordProgressService.getNextReviewDate(data.level, data.correct);
      if (result === null) {
        expect(result).toBe(data.expected);
      } else {
        const diffDays = Math.ceil((result.getTime() - todayTimestamp) / (1000 * 60 * 60 * 24));
        expect(diffDays).toEqual(data.expected);
      }
    });
  });

  describe('findWordsToRepeat', () => {
    function expectItIsTypedCorrectly(word: WordWithProgress) {
      expect(Object.keys(word)).toEqual(
        expect.arrayContaining(['word', 'translation', 'topic', 'isReversed', 'level', 'wrong', 'nextReview'])
      );
    }

    test('LearningMode normal', async () => {
      db.wordProgress.findMany.mockResolvedValueOnce(wordsProgressNormal);
      const words = await WordProgressService.findWordsToRepeat(1, 'en', LearningMode.normal);
      // expect words to be correct WordWithProgress[]

      expectItIsTypedCorrectly(words[0]);
      expect(words[0]).toHaveProperty('word');
      expect(words).length(3);
    });
    test('LearningMode reverse', async () => {
      db.wordProgress.findMany.mockResolvedValueOnce(wordsProgressReverse);
      const words = await WordProgressService.findWordsToRepeat(1, 'en', LearningMode.reverse);
      expectItIsTypedCorrectly(words[0]);
      expect(words).length(3);
    });
    test('LearningMode both', async () => {
      db.wordProgress.findMany.mockResolvedValueOnce(wordsProgressBoth);
      const words = await WordProgressService.findWordsToRepeat(1, 'en', LearningMode.both);
      expectItIsTypedCorrectly(words[0]);
      expect(words).length(6);
    });
  });
});

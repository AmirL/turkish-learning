import { faker } from '@faker-js/faker';
import type { WordProgress } from '@prisma/client';
import { fakeMultiple, fakeTopic, fakeWordProgress, fakeWordWithTopic } from 'prisma/types/fake-data';
import { expect, describe, it, vi, beforeEach } from 'vitest';
import { db } from '~/utils/__mocks__/db.server';
import { LearningMode, WordProgressService } from './word-progress.service.server';

vi.mock('~/utils/db.server');

describe('WordProgressService', () => {
  describe('getWordsProgress', () => {
    const topic = fakeTopic();
    const topicWords = fakeMultiple(3, fakeWordWithTopic, { topic });

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
      let wordsProgress: WordProgress[] = [];
      topicWords.forEach((word) => {
        wordsProgress.push(
          fakeWordProgress({
            word_id: word.id,
            level: faker.datatype.number({ min: 1, max: 5 }),
            wrong: faker.datatype.number({ min: 1, max: 4 }),
            correct: faker.datatype.number({ min: 1, max: 4 }),
            isReversed: false,
          })
        );
      });
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
});

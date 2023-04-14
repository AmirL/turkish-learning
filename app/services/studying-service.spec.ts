import { expect, describe, it, vi, beforeEach } from 'vitest';
import { StudyingService } from './studying-service';

describe('StudyingService', () => {
  describe('updateWordsArray', () => {
    it('it removes first word from array if level >= 5', () => {
      const wordsArray = [1, 2, 3];
      StudyingService.updateWordsArray(true, 5, wordsArray);
      expect(wordsArray).toEqual([2, 3]);
    });

    const cases = [
      { level: 1, step: 1 },
      { level: 2, step: 3 },
      { level: 3, step: 7 },
      { level: 4, step: 12 },
    ];

    cases.forEach(({ level, step }) => {
      it(`it moves word forward by ${step} steps if level is ${level}`, () => {
        // fill array numbers from 1 to 15
        const wordsArray = Array.from({ length: 15 }, (_, i) => i + 1);
        StudyingService.updateWordsArray(true, level, wordsArray);
        // check if word is moved forward by step
        expect(wordsArray[step]).toBe(1);
        expect(wordsArray[0]).toBe(2);
      });
    });

    it('it moves word forward by 1 step answer is not correct', () => {
      const wordsArray = [1, 2, 3];
      StudyingService.updateWordsArray(false, 1, wordsArray);
      // check if word is moved forward by step
      expect(wordsArray).toEqual([2, 1, 3]);
    });
  });

});

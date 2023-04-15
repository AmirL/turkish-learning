import { expect, describe, it } from 'vitest';
import { StudyingService } from './studying-service';

describe('StudyingService', () => {
  describe('moveCurrentWord', () => {
    it('it removes first word from array if level >= 5', () => {
      const wordsArray = [1, 2, 3];
      StudyingService.moveCurrentWord(true, 5, wordsArray);
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
        StudyingService.moveCurrentWord(true, level, wordsArray);
        // check if word is moved forward by step
        expect(wordsArray[step]).toBe(1);
        expect(wordsArray[0]).toBe(2);
      });
    });

    it('it moves word forward by 1 step answer is not correct', () => {
      const wordsArray = [1, 2, 3];
      StudyingService.moveCurrentWord(false, 1, wordsArray);
      // check if word is moved forward by step
      expect(wordsArray).toEqual([2, 1, 3]);
    });
  });

  describe('updateWordLevel', () => {
    it('it increases word level by 1 if answer is correct', () => {
      const word = { level: 1, wrong: 0 };
      StudyingService.updateWordLevel(true, word);
      expect(word.level).toBe(2);
    });

    it('it increases word level to 4 if answer is correct and word level is 0 and wrong is 0', () => {
      const word = { level: 0, wrong: 0 };
      StudyingService.updateWordLevel(true, word);
      expect(word.level).toBe(4);
    });

    it('it decreases word level by 2 if answer is not correct', () => {
      const word = { level: 3, wrong: 0 };
      StudyingService.updateWordLevel(false, word);
      expect(word.level).toBe(1);
    });

    it('it decreases word level to 0 if answer is not correct and word level is 1', () => {
      const word = { level: 1, wrong: 0 };
      StudyingService.updateWordLevel(false, word);
      expect(word.level).toBe(0);
    });
  });
});

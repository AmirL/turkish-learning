import type { SerializeFrom } from '@remix-run/node';
import type { Topic, Word } from '@prisma/client';
import { WordProgressRepository } from './database/word-progress.repository.server';

export type TotalWordsCount = {
  language: string;
  count: number;
};

export type WordWithProgress = {
  id: number;
  word: string;
  translation: string;
  isReversed: boolean;
  level: number;
  wrong: number; // number of wrong answers. Boost level to 4 if answer correct from 1st try
  nextReview: Date | null;
  topic: SerializeFrom<Topic> | Topic;
};

export const LearningMode = {
  normal: 0,
  reverse: 1,
  both: 2,
};

export type WordWithTopic = Word & { topic: Topic };

export class WordProgressService {
  /**
   * Get words with progress for user, depending on learning mode
   *
   * @param words - words to get progress for
   * @param user_id
   * @param learningMode (normal, reverse, both)
   * @returns
   */
  static async getWordsProgress(words: WordWithTopic[], user_id: number, learningMode: number) {
    const wordProgress = await WordProgressRepository.findByUserAndWordsId(
      user_id,
      words.map((word) => word.id)
    );

    // // create a map with wordId and isReversed as key and level as value
    const wordProgressMap = new Map();
    wordProgress.forEach((progress) => {
      wordProgressMap.set(`${progress.word_id}-${progress.isReversed}`, progress);
    });

    let wordsWithDirection = WordProgressService.getWordVariantsByLearningMode(learningMode, words);
    wordsWithDirection.forEach((word) => {
      const progress = wordProgressMap.get(`${word.id}-${word.isReversed}`);
      if (progress) {
        word.level = progress.level;
        word.wrong = progress.wrong;
        word.nextReview = progress.nextReview;
      }
    });

    return wordsWithDirection;
  }

  /**
   * Add variants of words depending on learning mode
   * @param learningMode
   *  LearningMode.normal - only normal direction
   *  LearningMode.reverse - only reverse direction
   *  LearningMode.both - both directions (normal + reverse)
   * @param words
   * @returns
   */
  private static getWordVariantsByLearningMode(learningMode: number, words: WordWithTopic[]): WordWithProgress[] {
    let withDirection: WordWithProgress[] = [];

    // make new array with words with 2 varuant of direction variable
    if (learningMode === LearningMode.normal || learningMode === LearningMode.both) {
      withDirection = [
        ...words.map((word) => ({
          ...word,
          isReversed: false,
          level: 0,
          wrong: 0,
          nextReview: null,
        })),
      ];
    }

    if (learningMode === LearningMode.reverse || learningMode === LearningMode.both) {
      withDirection = [
        ...withDirection,
        ...words.map((word) => ({
          ...word,
          word: word.translation,
          translation: word.word,
          isReversed: true,
          level: 0,
          wrong: 0,
          nextReview: null,
        })),
      ];
    }
    return withDirection;
  }

  static getNextReviewDate(level: number, correct: boolean) {
    const day = 24 * 60 * 60 * 1000;
    // 1 day for level 5
    // 3 days for level 6
    // 6 days for level 7
    // 14 days for level 8
    // 30 days for level 9
    const nextReviewSteps = [null, null, null, null, null, 1, 3, 6, 14, 30, 90, 180, 365];
    const nextReviewStep = nextReviewSteps[level] || 365;
    const today = new Date(Date.now());
    today.setUTCHours(0, 0, 0, 0);

    if (correct && level >= 5) {
      return new Date(today.getTime() + nextReviewStep * day);
    }

    return null;
  }

  static async findWordsToRepeat(user_id: number, lang: string, learningMode: number): Promise<WordWithProgress[]> {
    let isReversed;
    switch (learningMode) {
      case LearningMode.normal:
        isReversed = false;
        break;
      case LearningMode.reverse:
        isReversed = true;
        break;
      case LearningMode.both:
      default:
        isReversed = undefined;
        break;
    }

    const words = await WordProgressRepository.findWordsToRepeat(user_id, lang, isReversed);

    return words.map((wordProgress) => ({
      id: wordProgress.word.id,
      word: !wordProgress.isReversed ? wordProgress.word.word : wordProgress.word.translation,
      translation: !wordProgress.isReversed ? wordProgress.word.translation : wordProgress.word.word,
      topic: wordProgress.word.topic,
      isReversed: wordProgress.isReversed,
      level: wordProgress.level,
      wrong: wordProgress.wrong,
      nextReview: wordProgress.nextReview,
    }));
  }
}

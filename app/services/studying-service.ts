import axios from 'axios';

import type { SerializeFrom } from '@remix-run/node';

import { arrayMoveMutable } from '~/utils/helpers';
import type { WordWithProgress } from '~/services/word-progress.service.server';

type Word = SerializeFrom<WordWithProgress>;

interface ISaveWordProgress {
  id: number;
  level: number;
  isReversed: boolean;
  correct: boolean;
}

export class StudyingService {
  static updateWordsArray(correct: boolean, currentWordLevel: number, wordsArray: any[]) {
    if (correct) {
      if (currentWordLevel >= 5) {
        // remove word from words array
        wordsArray.splice(0, 1);
      } else {
        const step = Math.floor(currentWordLevel ** 1.8);
        // move word forward depending on level
        arrayMoveMutable(wordsArray, 0, step);
      }
    } else {
      // move forward to show after 1 step
      arrayMoveMutable(wordsArray, 0, 1);
    }
  }

  static updateCurrentWord(correct: boolean, currentWord: Word) {
    if (correct) {
      if (currentWord.wrong === 0 && currentWord.level === 0) {
        // increase word level to 4 if user knows word from the first time
        currentWord.level = 4;
      } else {
        // just increase word level
        currentWord.level++;
      }
    } else {
      // decrease word level by 2
      currentWord.level -= 2;
      if (currentWord.level < 0) {
        currentWord.level = 0;
      }
    }
  }

  static saveWordProgress({ id, level, isReversed, correct }: ISaveWordProgress) {
    axios.post(`/progress/word/${id}`, {
      correct,
      level,
      isReversed,
    });
  }

  static markTopicAsCompleted(id: number) {
    axios
      .post(`/progress/topic/${id}`, {
        completed: true,
      })
      .then(() => {
        console.log('Topic mark as completed');
      });
  }
}

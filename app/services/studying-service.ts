import axios from 'axios';
import { arrayMoveMutable } from '~/utils/helpers';

interface ISaveWordProgress {
  id: number;
  level: number;
  isReversed: boolean;
  correct: boolean;
}

export class StudyingService {
  // get progress of studying based on words array and their levels
  static getProgress(words: { level: number }[]): number {
    if (words.length === 0) {
      return 1;
    }
    // max achievable level for studying these words
    const maxLevel = words.length * 5;
    // summ actual achieved levels for all words
    const actualLevel = words.reduce((acc, word) => acc + min(word.level, 5), 0);
    return actualLevel / maxLevel;
  }

  static moveCurrentWord(correct: boolean, currentWordLevel: number, wordsArray: any[]) {
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

  static updateWordLevel(answerCorrected: boolean, currentWord: { level: number; wrong: number }) {
    if (answerCorrected) {
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

function min(a: number, b: number) {
  return a < b ? a : b;
}

import type { SerializeFrom } from '@remix-run/node';
import { action, computed, makeAutoObservable, makeObservable, observable } from 'mobx';
import { userStore } from '~/routes/__app';
import { StudyingService } from '~/services/studying-service';
import type { WordWithProgress } from '~/services/word-progress.service.server';
import { arrayMoveMutable } from '~/utils/helpers';

export abstract class WordStoreAbstract {
  baseWords: SerializeFrom<WordWithProgress>[];

  words: SerializeFrom<WordWithProgress>[];

  abstract get progress(): number;
  abstract answer(correct: boolean): void;

  constructor(words: SerializeFrom<WordWithProgress>[]) {
    this.baseWords = words;
    this.words = words;
  }

  public get currentWord() {
    return this.words[0];
  }

  public get completed() {
    return this.words.length < 3;
  }

  updateBaseWordsLevel(word: SerializeFrom<WordWithProgress>) {
    const baseWord = this.baseWords.find((w) => w.id === word.id);
    if (baseWord) {
      baseWord.level = word.level;
    }
  }
}

export class RepeatingWordsStore extends WordStoreAbstract {
  constructor(words: SerializeFrom<WordWithProgress>[]) {
    super(words);
    makeObservable(this, {
      baseWords: observable,
      words: observable,
      completed: computed,
      currentWord: computed,
      progress: computed,
      answer: action,
    });
  }

  get progress() {
    return (1 - (this.words.length - 2) / (this.baseWords.length - 2)) * 100;
  }

  answer(correct: boolean) {
    if (correct) {
      this.currentWord.level++;
    } else {
      this.currentWord.level -= 2;
      // decrease word level until it reaches 5
      if (this.currentWord.level < 5) this.currentWord.level = 5;
    }
    StudyingService.saveWordProgress({ ...this.currentWord, correct });

    if (correct) {
      // remove word from words array
      this.words.splice(0, 1);
      userStore.decrementRepeatCount(1);
      // if it was last answer for repeating words
      if (this.words.length === 2) {
        // we don't show the last 2 words so we need to decrement repeat count by 2
        userStore.decrementRepeatCount(2);
      }
    } else {
      // move word to 3 to 6 position
      arrayMoveMutable(this.words, 0, Math.floor(Math.random() * 3) + 3);
    }
  }
}

export class StudyingWordsStore extends WordStoreAbstract {
  topic_id: number;

  constructor(words: SerializeFrom<WordWithProgress>[], topic_id: number) {
    super(words);
    makeObservable(this, {
      baseWords: observable,
      words: observable,
      completed: computed,
      currentWord: computed,
      progress: computed,
      answer: action,
    });

    this.words = words.filter((word) => word.level < 5);
    this.topic_id = topic_id;
  }

  get progress() {
    return StudyingService.getProgress(this.baseWords) * 100;
  }

  answer(correct: boolean) {
    if (correct && this.words.length < 4) {
      StudyingService.markTopicAsCompleted(this.topic_id);
    }

    StudyingService.updateWordLevel(correct, this.currentWord);
    this.updateBaseWordsLevel(this.currentWord);
    StudyingService.saveWordProgress({ ...this.currentWord, correct });

    StudyingService.moveCurrentWord(correct, this.currentWord.level, this.words);
  }
}

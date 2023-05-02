import type { Prisma, Topic, User, Word, WordProgress } from '@prisma/client';
import { faker } from '@faker-js/faker';
import type { WordWithTopic } from '~/services/word-progress.service.server';
import { WordProgressRepository } from '~/services/database/word-progress.repository.server';

export function fakeMultiple<T>(n: number, fn: (overrides?: any) => T, overrides?: any): T[] {
  return Array.from({ length: n }, () => fn(overrides));
}

let fakeUserId = 0;
export function fakeUser(overrides?: Partial<User>): User {
  return {
    id: ++fakeUserId,
    isEditor: false,
    isAdmin: false,
    muteSpeach: false,
    nativeLanguage: faker.address.countryCode(),
    learningMode: 0,
    email: faker.internet.email(),
    password: faker.lorem.words(5),
    name: faker.name.fullName(),
    avatar: faker.lorem.words(5),
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
    ...overrides,
  };
}

let fakeWordId = 0;
export function fakeWord(overrides?: Partial<Word>): Word {
  return {
    id: ++fakeWordId,
    word: faker.lorem.words(1),
    translation: faker.lorem.words(1),
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
    topic_id: faker.datatype.number(),
    ...overrides,
  };
}

interface WordTopicParams {
  topic?: Topic;
  word?: Partial<Word>;
}
export function fakeWordWithTopic({ topic, word }: WordTopicParams = {}): WordWithTopic {
  topic = topic ?? fakeTopic();
  return {
    ...fakeWord({
      ...word,
      topic_id: topic.id,
    }),
    topic,
  };
}

let fakeWordProgressId = 0;
export function fakeWordProgress(overrides?: Partial<Omit<WordProgress, 'views'>>): WordProgress {
  const correct = overrides?.correct ?? faker.datatype.number({ min: 1, max: 4 });
  const wrong = overrides?.wrong ?? faker.datatype.number({ min: 1, max: 4 });
  const views = correct + wrong;
  const level = overrides?.level ?? faker.datatype.number({ min: 1, max: 5 });
  const known = level >= 5 ? faker.date.past() : null;
  const wellKnown = level >= 8 ? faker.date.past() : null;
  const isReversed = overrides?.isReversed ?? faker.datatype.boolean();

  return {
    id: ++fakeWordProgressId,
    user_id: faker.datatype.number(),
    word_id: faker.datatype.number(),
    level,
    wrong,
    correct,
    views,
    isReversed,
    nextReview: null,
    known,
    wellKnown,
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
    ...overrides,
  };
}

export function fakeWordProgressForWords(
  topicWords: Word[],
  topic: Topic,
  overrides?: Partial<Omit<WordProgress, 'views'>>
) {
  type ResultType = WordProgress & {
    word: Word & {
      topic: Topic;
    };
  };
  // type ResultType = WordProgress & {
  //   word: Word;
  // };
  let wordsProgress: ResultType[] = [];
  topicWords.forEach((word) => {
    const wordProgress = fakeWordProgress({
      word_id: word.id,
      ...overrides,
    });
    wordsProgress.push({
      ...wordProgress,
      word: {
        ...word,
        topic,
      },
    });
  });
  return wordsProgress;
}

let fakeTopicId = 0;
export function fakeTopic(overrides?: Partial<Topic>): Topic {
  return {
    id: ++fakeTopicId,
    name: faker.name.fullName(),
    difficulty: 0,
    languageSource: 'en',
    languageTarget: 'ru',
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
    ...overrides,
  };
}
// export function fakeWordProgress(overrides?: Partial<Omit<Prisma.WordProgressUncheckedCreateInput, 'user_id' | 'word_id'>>) {
//   return {
//     nextReview: faker.datatype.boolean() ? undefined : faker.datatype.datetime(),
//     known: faker.datatype.boolean() ? undefined : faker.datatype.datetime(),
//     wellKnown: faker.datatype.boolean() ? undefined : faker.datatype.datetime(),
//     updatedAt: faker.datatype.datetime(),
//     ...overrides,
//   };
// }
// export function fakeTopicProgress(overrides?: Partial<Omit<Prisma.TopicProgressUncheckedCreateInput, 'user_id' | 'topic_id'>>) {
//   return {
//     updatedAt: faker.datatype.datetime(),
//     ...overrides,
//   };
// }
// export function fakeStudySession(overrides?: Partial<Omit<Prisma.StudySessionUncheckedCreateInput, 'user_id'>>) {
//   return {
//     date: faker.datatype.datetime(),
//     updatedAt: faker.datatype.datetime(),
//     ...overrides,
//   };
// }
// export function fakeImages(overrides?: Partial<Omit<Prisma.ImagesUncheckedCreateInput, 'word_id'>>) {
//   return {
//     link: faker.lorem.words(5),
//     updatedAt: faker.datatype.datetime(),
//     ...overrides,
//   };
// }

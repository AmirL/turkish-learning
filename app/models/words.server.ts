import { db } from '~/utils/db.server';

export type WordWithProgress = {
  id: number;
  word: string;
  translation: string;
  isReversed: boolean;
  level: number;
  wrong: number; // number of wrong answers. Boost level to 4 if answer correct from 1st try
};

export async function getWordForStudying(topicId: number, user_id: number) {
  const words = await db.word.findMany({
    select: {
      id: true,
      word: true,
      translation: true,
    },
    where: {
      topic_id: Number(topicId),
    },
  });

  if (words.length === 0) {
    return [];
  }

  // make new array with words with 2 varuant of direction variable
  let withDirection = [
    ...words.map((word) => ({
      ...word,
      isReversed: false,
      level: 0,
      wrong: 0,
    })),
    ...words.map((word) => ({
      ...word,
      word: word.translation,
      translation: word.word,
      isReversed: true,
      level: 0,
      wrong: 0,
    })),
  ];

  // load word progress for current user
  const wordProgress = await db.wordProgress.findMany({
    select: {
      word_id: true,
      level: true,
      isReversed: true,
      wrong: true,
    },
    where: {
      user_id,
      word_id: {
        in: words.map((word) => word.id),
      },
    },
  });

  // // create a map with wordId and isReversed as key and level as value
  const wordProgressMap = new Map();
  wordProgress.forEach((progress) => {
    wordProgressMap.set(`${progress.word_id}-${progress.isReversed}`, progress);
  });

  // add level to each word
  withDirection.forEach((word) => {
    const progress = wordProgressMap.get(`${word.id}-${word.isReversed}`);
    if (progress) {
      word.level = progress.level;
      word.wrong = progress.wrong;
    }
  });

  // order words randomly
  withDirection.sort(() => Math.random() - 0.5);

  return withDirection;
}

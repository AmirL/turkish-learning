import { db } from '~/utils/db.server';

export type Word = {
  id: number;
  word: string;
  translation: string;
  isReversed: boolean; // added by getWordForStudying
  level: number; // added by getWordForStudying
};

export async function getWordForStudying(topicId: number) {
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
    ...words.map((word) => ({ ...word, isReversed: false, level: 0 })),
    ...words.map((word) => ({ ...word, word: word.translation, translation: word.word, isReversed: true, level: 0 })),
  ];

  // load word progress for current user
  const wordProgress = await db.wordProgress.findMany({
    select: {
      word_id: true,
      level: true,
      isReversed: true,
    },
    where: {
      user_id: 1,
      word_id: {
        in: words.map((word) => word.id),
      },
    },
  });

  // // create a map with wordId and isReversed as key and level as value
  const wordProgressMap = new Map();
  wordProgress.forEach((progress) => {
    wordProgressMap.set(`${progress.word_id}-${progress.isReversed}`, progress.level);
  });

  // add level to each word
  withDirection.forEach((word) => {
    word.level = wordProgressMap.get(`${word.id}-${word.isReversed}`) ?? 0;
  });

  // order words randomly
  withDirection.sort(() => Math.random() - 0.5);

  return withDirection;
}

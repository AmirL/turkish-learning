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
    // ...words.map((word) => ({
    //   ...word,
    //   word: word.translation,
    //   translation: word.word,
    //   isReversed: true,
    //   level: 0,
    //   wrong: 0,
    // })),
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

type UpdateWordProgressParams = {
  correct: boolean;
  level: number;
  user_id: number;
  word_id: number;
  isReversed: boolean;
};

export async function updateWordProgress({ correct, level, user_id, word_id, isReversed }: UpdateWordProgressParams) {
  const day = 24 * 60 * 60 * 1000;
  const nextReviewSteps = [null, null, null, null, null, 2, 4, 8, 16, 32, 90];
  const nextReviewStep = nextReviewSteps[level] || 90;

  let nextReviewDate;
  if (correct && level >= 5) {
    nextReviewDate = new Date(Date.now() + nextReviewStep * day);
  } else if (!correct) {
    nextReviewDate = new Date(Date.now() + day);
  }

  await db.wordProgress.upsert({
    where: { user_id_word_id_isReversed: { user_id, word_id, isReversed } },
    update: {
      level,
      correct: correct ? { increment: 1 } : undefined,
      wrong: !correct ? { increment: 1 } : undefined,
      views: { increment: 1 },
      nextReview: nextReviewDate,
    },
    create: {
      level,
      correct: correct ? 1 : 0,
      views: 1,
      wrong: !correct ? 1 : 0,
      user: { connect: { id: user_id } },
      word: { connect: { id: word_id } },
      isReversed,
      nextReview: nextReviewDate,
    },
  });
}

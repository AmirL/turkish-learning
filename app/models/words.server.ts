import type { Topic, User } from '@prisma/client';
import type { SerializeFrom } from '@remix-run/node';
import { db } from '~/utils/db.server';
import { Prisma } from '@prisma/client';

export type WordWithProgress = {
  id: number;
  word: string;
  translation: string;
  isReversed: boolean;
  level: number;
  wrong: number; // number of wrong answers. Boost level to 4 if answer correct from 1st try
  topic: SerializeFrom<Topic> | Topic;
};

export const LearningMode = {
  normal: 0,
  reverse: 1,
  both: 2,
};

export async function getWordForStudying(topicId: number, user: User) {
  const words = await db.word.findMany({
    include: {
      topic: true,
    },
    where: {
      topic_id: Number(topicId),
    },
  });

  if (words.length === 0) {
    return [];
  }

  let withDirection: WordWithProgress[] = [];

  // make new array with words with 2 varuant of direction variable
  if (user.learningMode === LearningMode.normal || user.learningMode === LearningMode.both) {
    withDirection = [
      ...words.map((word) => ({
        ...word,
        isReversed: false,
        level: 0,
        wrong: 0,
      })),
    ];
  }

  if (user.learningMode === LearningMode.reverse || user.learningMode === LearningMode.both) {
    withDirection = [
      ...withDirection,
      ...words.map((word) => ({
        ...word,
        word: word.translation,
        translation: word.word,
        isReversed: true,
        level: 0,
        wrong: 0,
      })),
    ];
  }

  // load word progress for current user
  const wordProgress = await db.wordProgress.findMany({
    select: {
      word_id: true,
      level: true,
      isReversed: true,
      wrong: true,
    },
    where: {
      user_id: user.id,
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
  // 1 day for level 5
  // 3 days for level 6
  // 6 days for level 7
  // 14 days for level 8
  // 30 days for level 9
  const nextReviewSteps = [null, null, null, null, null, 1, 3, 6, 14, 30, 90, 180, 365];
  const nextReviewStep = nextReviewSteps[level] || 365;
  const today = new Date(Date.now());
  today.setUTCHours(0, 0, 0, 0);

  // get current nextReview date from db
  const currentProgress = await db.wordProgress.findUnique({
    where: { user_id_word_id_isReversed: { user_id, word_id, isReversed } },
  });

  // current nextReview date or null
  let nextReviewDate = currentProgress?.nextReview || null;
  if (correct && level >= 5) {
    // today plus nextReviewStep days
    nextReviewDate = new Date(today.getTime() + nextReviewStep * day);
  }

  await db.wordProgress.upsert({
    where: { user_id_word_id_isReversed: { user_id, word_id, isReversed } },
    update: {
      level,
      correct: correct ? { increment: 1 } : undefined,
      wrong: !correct ? { increment: 1 } : undefined,
      views: { increment: 1 },
      // keep nextReview date is not correct answer, and update if correct answer and level >= 5
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

type LanguageData = {
  language: string;
  count: string;
};

export async function languagesToRepeat(user: User) {
  let isReversed = Prisma.sql``;
  switch (user.learningMode) {
    case LearningMode.normal:
      isReversed = Prisma.sql`AND isReversed = 0`;
      break;
    case LearningMode.reverse:
      isReversed = Prisma.sql`AND isReversed = 1`;
      break;
  }

  // get count of words for each language with nextReview less or equal to today
  const languages: LanguageData[] = await db.$queryRaw`
  SELECT t.languageSource as language, COUNT(*) as count FROM WordProgress wp
  INNER JOIN Word w ON w.id = wp.word_id
  INNER JOIN Topic t ON t.id = w.topic_id
  WHERE
  user_id = ${user.id}
  AND nextReview <= CURRENT_DATE
  ${isReversed}
  GROUP BY t.languageSource
  HAVING count > 5
  `;
  return languages;
}

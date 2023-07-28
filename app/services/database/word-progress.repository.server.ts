import { Prisma } from '@prisma/client';
import { db } from '~/utils/db.server';
import { LearningMode } from '../word-progress.service.server';

interface GetUsersWordsInput {
  user_id: number;
  take: number;
  known?: boolean;
  wellKnown?: boolean;
  orderBy?: Prisma.WordProgressOrderByWithRelationInput;
}

export type WordStatus = 'known' | 'wellKnown';
export type TotalWordsCount = {
  language: string;
  count: number;
};

interface WriteUserProgressInput {
  level: number;
  correct: boolean;
  user_id: number;
  word_id: number;
  isReversed: boolean;
  nextReview: Date | null;
}

export class WordProgressRepository {
  static async findByUserAndWordsId(user_id: number, words_id: number[]) {
    return await db.wordProgress.findMany({
      where: {
        user_id,
        word_id: {
          in: words_id,
        },
      },
    });
  }

  static async findByUser({ user_id, take, known, wellKnown, orderBy }: GetUsersWordsInput) {
    return await db.wordProgress.findMany({
      where: {
        user_id: user_id,
        ...(known && { known: { not: null } }),
        ...(wellKnown && { wellKnown: { not: null } }),
      },
      include: {
        word: {
          include: {
            topic: true,
          },
        },
      },
      orderBy,
      take,
    });
  }

  static async getUserWordsLevels(user_id: number) {
    type Res = {
      language: string;
      level: number;
      count: number;
    };
    const res: Res[] = await db.$queryRaw`
      SELECT
        t.languageSource as language,
        wp.level,
        COUNT(*) as count
      FROM
        WordProgress wp
      INNER JOIN Word w ON w.id = wp.word_id
      INNER JOIN Topic t ON t.id = w.topic_id
      WHERE
        wp.user_id = ${user_id}
      GROUP BY
        wp.level,
        t.languageSource
      ORDER BY
        t.languageSource ASC,
        wp.level ASC`;

    return res;
  }

  static async getUserTotalWords(user_id: number, status: WordStatus) {
    let wordStatusFilter = Prisma.sql``;

    switch (status) {
      case 'known':
        wordStatusFilter = Prisma.sql`AND wp.known IS NOT NULL`;
        break;
      case 'wellKnown':
        wordStatusFilter = Prisma.sql`AND wp.wellKnown IS NOT NULL`;
        break;
    }

    // grouped by languageSource
    const res: TotalWordsCount[] = await db.$queryRaw`
      SELECT
        languageSource as language,
        COUNT(*) as count
      FROM
      WordProgress wp
      INNER JOIN Word w ON w.id = wp.word_id
      INNER JOIN Topic t ON t.id = w.topic_id
      WHERE
        wp.user_id = ${user_id}
        ${wordStatusFilter}
      GROUP BY
        languageSource`;

    return res;
  }

  static async getWordsCountWithLevel(user_id: number, level: number, languageSource: string) {
    type KnowWordsRes = { knownWords: string };

    const knownWordsRes: KnowWordsRes[] = await db.$queryRaw`
    SELECT COUNT(DISTINCT w.id) AS knownWords FROM WordProgress wp
    INNER JOIN Word w ON wp.word_id = w.id
    INNER JOIN Topic t ON w.topic_id = t.id
    WHERE wp.user_id = ${user_id} AND wp.level >= ${level} AND t.languageSource = ${languageSource}
  `;

    return parseInt(knownWordsRes[0].knownWords, 10);
  }

  static async updateNextReviewByTopic(user_id: number, topic_id: number, nextReview: Date, level: number) {
    await db.wordProgress.updateMany({
      where: {
        user_id,
        word: {
          topic_id,
        },
        level: {
          lt: level,
        },
      },
      data: {
        nextReview,
      },
    });
  }

  static async writeUserProgress({ level, correct, user_id, word_id, isReversed, nextReview }: WriteUserProgressInput) {
    // get current nextReview date from db
    const currentProgress = await db.wordProgress.findUnique({
      where: { user_id_word_id_isReversed: { user_id, word_id, isReversed } },
    });

    if (nextReview === null) nextReview = currentProgress?.nextReview || null;

    const today = new Date(Date.now());
    today.setUTCHours(0, 0, 0, 0);

    await db.wordProgress.upsert({
      where: { user_id_word_id_isReversed: { user_id, word_id, isReversed } },
      update: {
        level,
        correct: correct ? { increment: 1 } : undefined,
        wrong: !correct ? { increment: 1 } : undefined,
        views: { increment: 1 },
        nextReview,
        known: (currentProgress?.known ?? null) === null && level >= 5 ? today : undefined,
        wellKnown: (currentProgress?.wellKnown ?? null) === null && level >= 8 ? today : undefined,
      },
      create: {
        level,
        correct: correct ? 1 : 0,
        views: 1,
        wrong: !correct ? 1 : 0,
        user: { connect: { id: user_id } },
        word: { connect: { id: word_id } },
        isReversed,
        nextReview,
      },
    });
  }

  static async languagesToRepeat(user_id: number, learningMode: number) {
    let isReversed = Prisma.sql``;
    switch (learningMode) {
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
    user_id = ${user_id}
    AND nextReview <= CURRENT_DATE
    ${isReversed}
    GROUP BY t.languageSource
    HAVING count > 5
    `;
    return languages;
  }

  static async findWordsToRepeat(user_id: number, language: string, isReversed: boolean | undefined) {
    return await db.wordProgress.findMany({
      where: {
        user_id: user_id,
        nextReview: {
          lte: new Date(),
        },
        isReversed,
        word: {
          topic: {
            languageSource: language,
          },
        },
      },
      include: {
        word: {
          include: {
            topic: true,
          },
        },
      },
    });
  }
}

type LanguageData = {
  language: string;
  count: string;
};

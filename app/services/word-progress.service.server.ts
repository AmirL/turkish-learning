import { db } from '~/utils/db.server';

import { Prisma } from '@prisma/client';
export type { User } from '@prisma/client';

export type WordStatus = 'known' | 'wellKnown';

export type TotalWordsCount = {
  language: string;
  count: number;
};

export class WordProgressService {
  static async getUserLastWellKnownWords(user_id: number, count: number) {
    return await db.wordProgress.findMany({
      where: {
        user_id: user_id,
        wellKnown: {
          not: null,
        },
      },
      include: {
        word: {
          include: {
            topic: true,
          },
        },
      },
      orderBy: {
        wellKnown: 'desc',
      },
      take: count,
    });
  }

  static async getUserLastKnownWords(user_id: number, count: number) {
    return await db.wordProgress.findMany({
      where: {
        user_id: user_id,
        // known is not null
        known: {
          not: null,
        },
      },
      include: {
        word: {
          include: {
            topic: true,
          },
        },
      },
      orderBy: {
        known: 'desc',
      },
      take: count,
    });
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
}

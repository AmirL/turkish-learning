// import bcrypt from '@node-rs/bcrypt';
// import { invariant } from '@remix-run/router';
// import { db } from '~/utils/db.server';

// import { Prisma } from '@prisma/client';
export type { User } from '@prisma/client';

// export async function getUserLastWellKnownWords(user_id: number, count: number) {
//   return await db.wordProgress.findMany({
//     where: {
//       user_id: user_id,
//       wellKnown: {
//         not: null,
//       },
//     },
//     include: {
//       word: {
//         include: {
//           topic: true,
//         },
//       },
//     },
//     orderBy: {
//       wellKnown: 'desc',
//     },
//     take: count,
//   });
// }

// export async function getUserLastKnownWords(user_id: number, count: number) {
//   return await db.wordProgress.findMany({
//     where: {
//       user_id: user_id,
//       // known is not null
//       known: {
//         not: null,
//       },
//     },
//     include: {
//       word: {
//         include: {
//           topic: true,
//         },
//       },
//     },
//     orderBy: {
//       known: 'desc',
//     },
//     take: count,
//   });
// }

// export type WordStatus = 'known' | 'wellKnown';
// export type TotalWordsCount = {
//   language: string;
//   count: number;
// };

// export async function getUserTotalWords(user_id: number, status: WordStatus) {
//   let wordStatusFilter = Prisma.sql``;

//   switch (status) {
//     case 'known':
//       wordStatusFilter = Prisma.sql`AND wp.known IS NOT NULL`;
//       break;
//     case 'wellKnown':
//       wordStatusFilter = Prisma.sql`AND wp.wellKnown IS NOT NULL`;
//       break;
//   }

//   // grouped by languageSource
//   const res: TotalWordsCount[] = await db.$queryRaw`
//     SELECT
//       languageSource as language,
//       COUNT(*) as count
//     FROM
//     WordProgress wp
//     INNER JOIN Word w ON w.id = wp.word_id
//     INNER JOIN Topic t ON t.id = w.topic_id
//     WHERE
//       wp.user_id = ${user_id}
//       ${wordStatusFilter}
//     GROUP BY
//       languageSource`;

//   return res;
// }

// export async function getUserStudyingLanguages(user_id: number) {
//   const languagesData = await db.studySession.groupBy({
//     by: ['language'],
//     _max: {
//       date: true,
//     },
//     orderBy: {
//       _max: {
//         date: 'desc',
//       },
//     },
//     where: {
//       user_id,
//     },
//   });

//   return languagesData.map((language) => language.language);
// }

// export async function getUserSessions(user_id: number, date: Date) {
//   return await db.studySession.findMany({
//     where: {
//       user_id,
//       date: {
//         gte: date,
//       },
//     },
//     orderBy: {
//       date: 'desc',
//     },
//   });
// }

// export async function updateUserLearningMode(user_id: number, learningMode: number) {
//   await db.user.update({
//     where: { id: user_id },
//     data: {
//       learningMode,
//     },
//   });
// }

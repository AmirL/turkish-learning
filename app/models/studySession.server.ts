import { db } from '~/utils/db.server';
import type { User } from '@prisma/client';

async function getWordsCountWithLevel(user_id: number, level: number, languageSource: string) {
  type KnowWordsRes = { knownWords: string };

  const knownWordsRes: KnowWordsRes[] = await db.$queryRaw`
  SELECT COUNT(DISTINCT w.id) AS knownWords FROM WordProgress wp
  INNER JOIN Word w ON wp.word_id = w.id
  INNER JOIN Topic t ON w.topic_id = t.id
  WHERE wp.user_id = ${user_id} AND wp.level >= ${level} AND t.languageSource = ${languageSource}
`;

  return parseInt(knownWordsRes[0].knownWords, 10);
}

export async function updateStudySession(user: User, language: string, correct: boolean) {
  // get date at 00:00:00 by UTC
  const sessionDate = new Date();
  sessionDate.setUTCHours(0, 0, 0, 0);

  const knownWords = await getWordsCountWithLevel(user.id, 5, language);
  const wellKnownWords = await getWordsCountWithLevel(user.id, 8, language);

  const todaySession = await db.studySession.findUnique({
    where: { user_id_date_language: { user_id: user.id, date: sessionDate, language } },
  });

  // calculate ratio and round to decimal percent
  const ratio = todaySession ? todaySession.correct / (todaySession.correct + todaySession.wrong) : 0;
  const roundedRatio = Math.round(ratio * 100);

  // update user session progress
  await db.studySession.upsert({
    where: { user_id_date_language: { user_id: user.id, date: sessionDate, language } },
    update: {
      known: knownWords,
      wellKnown: wellKnownWords,
      correct: {
        increment: correct ? 1 : 0,
      },
      wrong: {
        increment: correct ? 0 : 1,
      },
      shown: { increment: 1 },
      ratio: roundedRatio,
      language,
    },
    create: {
      user_id: user.id,
      known: knownWords,
      wellKnown: wellKnownWords,
      date: sessionDate,
      correct: correct ? 1 : 0,
      wrong: correct ? 0 : 1,
      shown: 1,
      ratio: correct ? 100 : 0,
      language,
    },
  });
}

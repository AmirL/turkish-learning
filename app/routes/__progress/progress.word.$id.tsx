import type { ActionFunction } from '@remix-run/node';
import { json } from 'react-router';
import { requireUser } from '~/utils/auth.server';
import { invariant } from '@remix-run/router';
import { db } from '~/utils/db.server';
import { updateWordProgress } from '~/models/words.server';

export const action: ActionFunction = async ({ request, params }) => {
  const user = await requireUser(request);

  invariant(params.id, 'Word ID is required');

  const word = await db.word.findUnique({
    where: { id: Number(params.id) },
    include: { topic: true },
  });

  invariant(word, 'Word not found');

  const { correct, isReversed, level } = await request.json();
  invariant(typeof correct === 'boolean', 'Correct is required');
  invariant(typeof isReversed === 'boolean', 'isReversed is required');
  invariant(typeof level === 'number', 'Level is required');

  const language = word.topic?.languageSource ?? 'en';

  await updateWordProgress({ correct, level, user_id: user.id, word_id: word.id, isReversed });

  // get date at 00:00:00 by UTC
  const sessionDate = new Date();
  sessionDate.setUTCHours(0, 0, 0, 0);

  // get known words count
  const knownWords = await db.wordProgress.count({
    where: {
      user_id: user.id,
      level: { gte: 5 },
    },
  });

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
      date: sessionDate,
      correct: correct ? 1 : 0,
      wrong: correct ? 0 : 1,
      shown: 1,
      ratio: correct ? 100 : 0,
      language,
    },
  });

  return json({}, 200);
};

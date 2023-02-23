import type { ActionFunction } from '@remix-run/node';
import { json } from 'react-router';
import { requireUser } from '~/utils/auth.server';
import { invariant } from '@remix-run/router';
import { db } from '~/utils/db.server';
import { updateWordProgress } from '~/models/words.server';
import { updateStudySession } from '~/models/studySession.server';

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

  await updateStudySession(user, language, correct);

  return json({}, 200);
};

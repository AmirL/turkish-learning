import type { ActionFunction } from '@remix-run/node';
import { json } from 'react-router';
import { requireUser } from '~/utils/auth.server';
import { invariant } from '@remix-run/router';
import { db } from '~/utils/db.server';

export const action: ActionFunction = async ({ request, params }) => {
  const user = await requireUser(request);

  invariant(params.id, 'Word ID is required');

  const word = await db.word.findUnique({
    where: { id: Number(params.id) },
  });

  invariant(word, 'Word not found');

  const { correct, isReversed, level } = await request.json();
  invariant(typeof correct === 'boolean', 'Correct is required');
  invariant(typeof isReversed === 'boolean', 'isReversed is required');
  invariant(typeof level === 'number', 'Level is required');

  const day = 24 * 60 * 60 * 1000;

  if (correct) {
    // if level >= 5 set next review date to 2 days from today
    // if level < 5 set next review date null
    let nextReviewStep;
    switch (level) {
      case 5:
        nextReviewStep = 2;
      case 6:
        nextReviewStep = 4;
        break;
      case 7:
        nextReviewStep = 8;
        break;
      case 8:
        nextReviewStep = 16;
        break;
      case 9:
        nextReviewStep = 32;
        break;
      default:
        nextReviewStep = 90;
        break;
    }

    const nextReviewDate = level >= 5 ? new Date(Date.now() + nextReviewStep * day) : null;
    await db.wordProgress.upsert({
      where: { user_id_word_id_isReversed: { user_id: user.id, word_id: word.id, isReversed } },
      update: {
        level,
        correct: { increment: 1 },
        views: { increment: 1 },
        nextReview: nextReviewDate,
      },
      create: {
        level,
        correct: 1,
        views: 1,
        wrong: 0,
        user: { connect: { id: user.id } },
        word: { connect: { id: word.id } },
        isReversed,
        nextReview: nextReviewDate,
      },
    });
  } else {
    // set next review date to tomorrow
    const nextReviewDate = new Date(Date.now() + day);
    await db.wordProgress.upsert({
      where: { user_id_word_id_isReversed: { user_id: user.id, word_id: word.id, isReversed } },
      update: {
        level,
        nextReview: nextReviewDate,
        wrong: { increment: 1 },
        views: { increment: 1 },
      },
      create: {
        level,
        correct: 0,
        views: 1,
        wrong: 1,
        nextReview: null,
        user: { connect: { id: user.id } },
        word: { connect: { id: word.id } },
        isReversed,
      },
    });
  }

  return json({}, 200);
};

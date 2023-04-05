import type { ActionFunction } from '@remix-run/node';
import { json } from 'react-router';
import { requireUser } from '~/utils/auth.server';
import invariant from 'ts-invariant';
import { db } from '~/utils/db.server';
import { WordProgressService } from '~/services/word-progress.service.server';
import { TopicProgressService } from '~/services/topic-progress.service.server';

export const action: ActionFunction = async ({ request, params }) => {
  const user = await requireUser(request);

  invariant(params.id, 'Word ID is required');

  const topic = await db.topic.findUnique({
    where: { id: Number(params.id) },
  });

  invariant(topic, 'Topic not found');

  const { completed } = await request.json();
  invariant(typeof completed === 'boolean', 'Completed is required');

  await TopicProgressService.updateTopicProgress(user.id, topic.id, completed);

  const nextReview = new Date(Date.now() + 24 * 60 * 60 * 1000);
  // set wordProgress nextReview to tomorrow for all words with level < 5 for this topic
  await WordProgressService.updateNextReviewByTopic(user.id, topic.id, nextReview, 5);

  return json({}, 200);
};

export default function TopicProgress() {
  return (
    <div>
      <h1>Topic Progress</h1>
    </div>
  );
}

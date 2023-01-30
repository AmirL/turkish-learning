import type { ActionFunction } from '@remix-run/node';
import { json } from 'react-router';
import { requireUser } from '~/utils/auth.server';
import { invariant } from '@remix-run/router';
import { db } from '~/utils/db.server';

export const action: ActionFunction = async ({ request, params }) => {
  const user = await requireUser(request);

  invariant(params.id, 'Word ID is required');

  const topic = await db.topic.findUnique({
    where: { id: Number(params.id) },
  });

  invariant(topic, 'Topic not found');

  const { completed } = await request.json();
  invariant(typeof completed === 'boolean', 'Completed is required');

  await db.topicProgress.upsert({
    where: { user_id_topic_id: { user_id: user.id, topic_id: topic.id } },
    update: {
      completed,
    },
    create: {
      completed,
      user_id: user.id,
      topic_id: topic.id,
    },
  });

  // set wordProgress nextReview to tomorrow for all words with level < 5 for this topic
  await db.wordProgress.updateMany({
    where: {
      user_id: user.id,
      word: {
        topic_id: topic.id,
      },
      level: {
        lt: 5,
      },
    },
    data: {
      nextReview: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  });

  return json({}, 200);
};

export default function TopicProgress() {
  return (
    <div>
      <h1>Topic Progress</h1>
    </div>
  );
}

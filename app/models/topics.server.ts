import type { Topic } from '@prisma/client';
import { db } from '~/utils/db.server';

export type TopicInfo = Topic & {
  name: string;
  difficulty: number;
  languageSource: string;
  wordsCount: number;
  started: boolean;
  completed: boolean;
};

export async function getTopics(user_id: number) {
  // get topics from db and group them by language source
  const topics = await db.$queryRaw<TopicInfo[]>`
  SELECT
    t.*,
    tp.started,
    tp.completed,
    COUNT(w.id) as wordsCount
  FROM Topic t
  LEFT JOIN TopicProgress tp ON t.id = tp.topic_id AND tp.user_id = ${user_id}
  JOIN Word  w ON t.id = w.topic_id
  GROUP BY t.name, t.languageSource, t.difficulty, t.id, tp.started, tp.completed
  ORDER BY t.languageSource Desc, t.difficulty ASC
  `;

  return topics;
}

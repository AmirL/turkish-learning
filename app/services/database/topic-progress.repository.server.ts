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

export class TopicProgressRepository {
  /**
   * get topics from db and group them by language source
   */
  static async getTopics(user_id: number): Promise<TopicInfo[]> {
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
    ORDER BY t.languageSource Desc, tp.completed ASC, t.difficulty ASC
    `;

    return topics;
  }

  static async getTopicsStats(user_id: number): Promise<TopicStats[]> {
    const topicsInfo = await db.$queryRaw<TopicStats[]>`
    SELECT
      t.id as topic_id,
      COUNT(DISTINCT w.id) AS word_count,
      COUNT(CASE WHEN wp.level > 4 THEN wp.id END) AS user_words_both_count,
      COUNT(CASE WHEN wp.isReversed = 0 AND wp.level > 4 THEN wp.id END) AS user_words_count,
      COUNT(CASE WHEN wp.isReversed = 1 AND wp.level > 4 THEN wp.id END) AS user_reversed_words_count
    FROM Topic t
    LEFT JOIN Word w ON t.id = w.topic_id
    LEFT JOIN WordProgress wp ON w.id = wp.word_id AND wp.user_id = ${user_id}
    GROUP BY t.id;
  `;
    return topicsInfo;
  }

  static async updateTopicCompleted(user_id: number, topic_id: number, completed: boolean) {
    return await db.topicProgress.upsert({
      where: {
        user_id_topic_id: {
          topic_id,
          user_id,
        },
      },
      create: {
        topic_id: topic_id,
        user_id,
        completed,
      },
      update: {
        completed,
      },
    });
  }
}

export type TopicStats = {
  topic_id: number;
  word_count: string;
  user_words_both_count: string;
  user_words_count: string;
  user_reversed_words_count: string;
};

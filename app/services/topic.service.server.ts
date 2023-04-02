import { db } from '~/utils/db.server';
import type { ImportWordRow } from './word.service.server';

export class TopicService {
  static async createTopics(table: ImportWordRow[]) {
    await db.topic.createMany({
      data: table.map((topic) => ({
        name: topic.topic,
        languageSource: topic.languageSource,
        languageTarget: topic.languageTarget,
      })),
      skipDuplicates: true,
    });
  }

  static async getTopicsIds(uniqueTopics: string[]) {
    const topicsIds = await db.topic.findMany({
      where: { name: { in: uniqueTopics } },
    });

    // topics can have same name, but different languages
    const topicIdsMap = topicsIds.reduce((acc, topic) => {
      if (topic.name) {
        // use name, languageSource, languageTarget as key to avoid duplicates
        acc[`${topic.name}-${topic.languageSource}-${topic.languageTarget}`] = topic.id;
      }
      return acc;
    }, {} as Record<string, number>);
    return topicIdsMap;
  }
}

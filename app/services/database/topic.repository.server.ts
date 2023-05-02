import { db } from '~/utils/db.server';
export class TopicRepository {
  static async createTopics(data: { name: string; languageSource: string; languageTarget: string }[]) {
    await db.topic.createMany({
      data,
      skipDuplicates: true,
    });
  }

  static async getTopicsByNames(names: string[]) {
    return await db.topic.findMany({
      where: { name: { in: names } },
    });
  }
}

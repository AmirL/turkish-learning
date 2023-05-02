import { db } from '~/utils/db.server';

export class WordRepository {
  static async getWordsByTopicId(topicId: number) {
    return await db.word.findMany({
      include: {
        topic: true,
      },
      where: {
        topic_id: Number(topicId),
      },
    });
  }

  static async createWords(words: { word: string; translation: string; topic_id: number }[]) {
    return await db.word.createMany({
      data: words,
      skipDuplicates: true,
    });
  }
}

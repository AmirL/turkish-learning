import { db } from '~/utils/db.server';
import { TopicService } from './topic.service.server';

export type ImportWordRow = {
  word: string;
  translation: string;
  languageSource: string;
  languageTarget: string;
  topic: string;
};

export class WordService {
  static async createWords(words: { word: string; translation: string; topic_id: number }[]) {
    return await db.word.createMany({
      data: words,
      skipDuplicates: true,
    });
  }

  static async importWords(table: ImportWordRow[]) {
    TopicService.createTopics(table);

    const uniqueTopicNames = [...new Set(table.map((topic) => topic.topic))];

    const topicsIds = await TopicService.getTopicsIds(uniqueTopicNames);

    // prepare words objetcs
    const words = table.map((row) => {
      return {
        word: row.word,
        translation: row.translation,
        topic_id: topicsIds[`${row.topic}-${row.languageSource}-${row.languageTarget}`],
      };
    });

    const result = await WordService.createWords(words);

    const skipped = words.length - result.count;

    return {
      created: result.count,
      skipped,
    };
  }
}

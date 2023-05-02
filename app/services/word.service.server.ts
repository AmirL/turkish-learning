import { WordRepository } from './database/word.repository.server';

export type ImportWordRow = {
  word: string;
  translation: string;
  languageSource: string;
  languageTarget: string;
  topic: string;
};

export class WordService {
  static async importWords(table: ImportWordRow[], topicsIds: Record<string, number>) {
    // prepare words objetcs
    const words = table.map((row) => ({
      word: row.word,
      translation: row.translation,
      topic_id: topicsIds[`${row.topic}-${row.languageSource}-${row.languageTarget}`],
    }));

    const result = await WordRepository.createWords(words);

    const skipped = words.length - result.count;

    return {
      created: result.count,
      skipped,
    };
  }
}

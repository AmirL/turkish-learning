import { TopicRepository } from './database/topic.repository.server';
import type { ImportWordRow } from './word.service.server';

export class TopicService {
  static async importTopics(table: ImportWordRow[]) {
    const topics = table.map((topic) => ({
      name: topic.topic,
      languageSource: topic.languageSource,
      languageTarget: topic.languageTarget,
    }));

    await TopicRepository.createTopics(topics);

    const uniqueTopicNames = [...new Set(table.map((topic) => topic.topic))];

    const topicsIds = await TopicRepository.getTopicsByNames(uniqueTopicNames);

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

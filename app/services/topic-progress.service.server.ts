import type { Topic } from '@prisma/client';
import { LearningMode } from './word-progress.service.server';
import type { TopicStats } from './database/topic-progress.repository.server';
import { TopicProgressRepository } from './database/topic-progress.repository.server';

export type TopicInfo = Topic & {
  name: string;
  difficulty: number;
  languageSource: string;
  wordsCount: number;
  started: boolean;
  completed: boolean;
};

export class TopicProgressService {
  static async recalcTopicProgress(user_id: number, learningMode: number) {
    //recalc topic progress based on new learning mode
    const topicsInfo = await TopicProgressRepository.getTopicsStats(user_id);

    for (const topicInfo of topicsInfo) {
      const topic_id = Number(topicInfo.topic_id);

      const completed = TopicProgressService._isTopicCompleted(topicInfo, learningMode);

      await TopicProgressRepository.updateTopicCompleted(user_id, topic_id, completed);
    }
  }

  static _isTopicCompleted(topicInfo: TopicStats, learningMode: number) {
    let completedWords = 0;
    let difference = 0;
    const word_count = Number(topicInfo.word_count);

    switch (learningMode) {
      case LearningMode.normal:
        completedWords = Number(topicInfo.user_words_count);
        difference = word_count - completedWords;
        break;
      case LearningMode.reverse:
        completedWords = Number(topicInfo.user_reversed_words_count);
        difference = word_count - completedWords;
        break;
      case LearningMode.both:
        completedWords = Number(topicInfo.user_words_both_count);
        difference = word_count * 2 - completedWords;
        break;
    }

    return difference < 3;
  }
}

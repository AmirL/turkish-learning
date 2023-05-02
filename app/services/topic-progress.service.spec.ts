import { describe, expect, test } from 'vitest';
import { TopicProgressService } from './topic-progress.service.server';
import { LearningMode } from './word-progress.service.server';

describe('TopicProgressService', () => {
  describe('_isTopicCompleted', () => {
    const topicInfoNotCompleted = {
      topic_id: 0,
      word_count: '15',
      user_words_both_count: '10',
      user_words_count: '10',
      user_reversed_words_count: '10',
    };

    const topicInfoCompleted = {
      topic_id: 0,
      word_count: '12',
      user_words_both_count: '22',
      user_words_count: '10',
      user_reversed_words_count: '10',
    };

    test('Not Completed', () => {
      const normal = TopicProgressService._isTopicCompleted(topicInfoNotCompleted, LearningMode.normal);
      const reverse = TopicProgressService._isTopicCompleted(topicInfoNotCompleted, LearningMode.reverse);
      const both = TopicProgressService._isTopicCompleted(topicInfoNotCompleted, LearningMode.both);
      expect(normal).toBe(false);
      expect(reverse).toBe(false);
      expect(both).toBe(false);
    });

    test('Completed', () => {
      const normal = TopicProgressService._isTopicCompleted(topicInfoCompleted, LearningMode.normal);
      const reverse = TopicProgressService._isTopicCompleted(topicInfoCompleted, LearningMode.reverse);
      const both = TopicProgressService._isTopicCompleted(topicInfoCompleted, LearningMode.both);
      expect(normal).toBe(true);
      expect(reverse).toBe(true);
      expect(both).toBe(true);
    });
  });
});

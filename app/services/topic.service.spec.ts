import { faker } from '@faker-js/faker';
import type { Topic } from '@prisma/client';
import { fakeTopic } from 'prisma/types/fake-data';
import { expect, describe, it, vi, beforeEach } from 'vitest';
import { db } from '~/utils/__mocks__/db.server';
import { TopicService } from './topic.service.server';

vi.mock('~/utils/db.server');

describe('TopicService', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('getTopicsIds', () => {
    it('maps topics to ids by [name-languageSource-languageTarget] => id', async () => {
      // given list of topics with same name, but different languages
      let topics: Topic[] = [];
      let uniqueTopicNames: string[] = [];
      const languageSources = ['en', 'tr'];
      const languageTargets = ['ru', 'de'];
      for (let i = 0; i < 3; i++) {
        const topicName = faker.lorem.word();
        uniqueTopicNames.push(topicName);
        for (let languageSource of languageSources) {
          for (let languageTarget of languageTargets) {
            topics.push(fakeTopic({ name: topicName, languageSource, languageTarget }));
          }
        }
      }

      db.topic.findMany.mockResolvedValueOnce(topics);

      // then
      const topicsIdMap = await TopicService.getTopicsIds(uniqueTopicNames);
      for (let topic of topics) {
        expect(topicsIdMap[`${topic.name}-${topic.languageSource}-${topic.languageTarget}`]).toBe(topic.id);
      }
    });
  });
});

import type { Meta, StoryObj } from '@storybook/react';
import { StudyingTopic } from '../studying/StudyingTopic';
import {
  fakeMultiple,
  fakeTopic,
  fakeUser,
  fakeWordProgress,
  fakeWordWithTopic,
} from '../../../prisma/types/fake-data';
import { AppContext } from '../AppContext';
import { BrowserRouter as Router } from 'react-router-dom';
import { faker } from '@faker-js/faker';
import type { WordWithProgress } from '~/services/word-progress.service.server';
import type { SerializeFrom } from '@remix-run/node';

faker.seed(0);

const appContext = {
  repeatCount: 0,
  user: {
    ...fakeUser({ muteSpeach: true }),
    createdAt: '2021-05-01T00:00:00.000Z',
    updatedAt: '2021-05-01T00:00:00.000Z',
  },
};

const meta: Meta<typeof StudyingTopic> = {
  component: StudyingTopic,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <Router>
        <AppContext.Provider value={appContext}>
          <Story />
        </AppContext.Provider>
      </Router>
    ),
  ],
};

type Story = StoryObj<typeof StudyingTopic>;
const topic = fakeTopic();

function fakeWordWithProgress(overrides: any): SerializeFrom<WordWithProgress> {
  return {
    ...SerializeFromConvert(fakeWordWithTopic(overrides.topic)),
    ...SerializeFromConvert(fakeWordProgress(overrides)),
  };
}

function SerializeFromConvert<T>(data: T): SerializeFrom<T> {
  return JSON.parse(JSON.stringify(data));
}

const WordsWithLevel0 = fakeMultiple(4, fakeWordWithProgress, { topic, level: 0 });
const WordsWithLevel2 = fakeMultiple(4, fakeWordWithProgress, { topic, level: 2 });
const WordsWithLevel5 = fakeMultiple(4, fakeWordWithProgress, { topic, level: 5 });

export const Primary: Story = {
  args: {
    words: WordsWithLevel0,
    topic_id: topic.id,
  },
};

export const PartialCompleted: Story = {
  args: {
    words: WordsWithLevel2,
    topic_id: topic.id,
  },
};

export const Completed: Story = {
  args: {
    words: WordsWithLevel5,
    topic_id: topic.id,
  },
};

export default meta;

import type { Meta, StoryObj } from '@storybook/react';
import { StudyingTopic } from './StudyingTopic';
import { fakeMultiple, fakeTopic, fakeUser, fakeWordProgress, fakeWordWithTopic } from '../../prisma/types/fake-data';
import { AppContext } from './AppContext';
import { BrowserRouter as Router } from 'react-router-dom';

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

function fakeWordWithProgress(overrides: any) {
  return {
    ...fakeWordWithTopic(overrides.topic),
    ...fakeWordProgress(overrides),
  };
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

import type { Meta, StoryObj } from '@storybook/react';
import { ListLearnedWords } from './ListLearnedWords';
import { fakeMultiple, fakeTopic, fakeWordWithTopic } from '../../../prisma/types/fake-data';
import { BrowserRouter as Router } from 'react-router-dom';
import { faker } from '@faker-js/faker';

const meta: Meta<typeof ListLearnedWords> = {
  component: ListLearnedWords,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <Router>
        <Story />
      </Router>
    ),
  ],
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};

faker.seed(0);

type Story = StoryObj<typeof ListLearnedWords>;

const topic = fakeTopic();
const words = fakeMultiple(20, fakeWordWithTopic, { topic });
const totalKnownWords = [{ language: topic.languageSource, count: 200 }];

const lastLearnedWords = words.map((word) => ({
  word: {
    ...word,
  },
}));

export const LearnedWords: Story = {
  args: {
    lastLearnedWords,
    total: totalKnownWords,
    language: topic.languageSource,
    title: 'Learned words',
    backgroundColor: '#C3DCBA',
  },
};

export const WellLearnedWords: Story = {
  args: {
    lastLearnedWords,
    total: totalKnownWords,
    language: topic.languageSource,
    title: 'Well known words',
    backgroundColor: '#A5C0B3',
  },
};

export default meta;

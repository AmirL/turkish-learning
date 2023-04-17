import type { Meta, StoryObj } from '@storybook/react';
import { WordCard } from './WordCard';

const meta: Meta<typeof WordCard> = {
  component: WordCard,
  tags: ['autodocs'],
};

type Story = StoryObj<typeof WordCard>;

const word = {
  word: 'Gel',
  translation: 'Come',
  isReversed: false,
  topic: {
    languageSource: 'tr',
    languageTarget: 'en',
  },
};

const wordReversed = {
  ...word,
  word: 'Come',
  translation: 'Gel',
  isReversed: true,
};

const template = {
  parameters: {
    docs: {
      controls: {
        exclude: ['flipped'],
      },
    },
  },
  argTypes: {
    flipped: {
      control: { type: null },
    },
  },
  args: {
    word,
    isMuted: true,
    userAnswerHandler: () => {},
    flipped: false,
  },
};

export const Word: Story = {
  ...template,
  args: {
    ...template.args,
  },
};

export const Flipped: Story = {
  ...template,
  args: {
    ...template.args,
    flipped: true,
  },
};

export const WordReversed: Story = {
  ...template,
  args: {
    ...template.args,
    word: wordReversed,
  },
};

export const FlippedReversed: Story = {
  ...template,
  args: {
    ...template.args,
    word: wordReversed,
    flipped: true,
  },
};

export default meta;

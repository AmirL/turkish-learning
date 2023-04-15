import type { Meta } from '@storybook/react';

import { ListCompleted } from './ListCompleted';

const meta: Meta<typeof ListCompleted> = {
  component: ListCompleted,
  tags: ['autodocs'],
};

export const Primary = { args: {} };
Primary.args = {
  words: [
    {
      word: 'Gel',
      translation: 'Come',
      level: 1,
      nextReview: new Date().toISOString(),
    },
    {
      word: 'Ben',
      translation: 'I',
      level: 5,
      // tomorrow
      nextReview: new Date(new Date().getTime() + 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      word: 'Sen',
      translation: 'You',
      level: 3,
      // yesterday
      nextReview: new Date(new Date().getTime() - 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      word: 'Biz',
      translation: 'We',
      level: 2,
      // empty
      nextReview: null,
    },
  ],
};

export default meta;

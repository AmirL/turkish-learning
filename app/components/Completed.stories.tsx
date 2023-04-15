import type { Meta, Story } from '@storybook/react';
import { Completed } from './Completed';
import { BrowserRouter as Router } from 'react-router-dom';

const meta: Meta<typeof Completed> = {
  component: Completed,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <Router>
        <Story />
      </Router>
    ),
  ],
};

export const Primary = { args: {} };

export default meta;

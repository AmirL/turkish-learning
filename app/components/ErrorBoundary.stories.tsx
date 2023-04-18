import type { Meta, StoryObj } from '@storybook/react';
import { ErrorBoundary } from './ErrorBoundary';

const meta: Meta<typeof ErrorBoundary> = {
  component: ErrorBoundary,
  tags: ['autodocs'],
};

type Story = StoryObj<typeof ErrorBoundary>;

export const Primary: Story = {
  args: {
    error: new Error('Error message'),
  },
};

export default meta;

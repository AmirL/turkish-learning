import type { Meta } from '@storybook/react';
import { ErrorBoundary } from './ErrorBoundary';

const meta: Meta<typeof ErrorBoundary> = {
  component: ErrorBoundary,
  tags: ['autodocs'],
};

export const Primary = { args: {} };
Primary.args = {
  error: new Error('Error message'),
};

export default meta;

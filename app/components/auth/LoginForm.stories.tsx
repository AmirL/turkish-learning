import type { Meta, StoryObj } from '@storybook/react';

import { LoginForm } from './LoginForm';

const meta: Meta<typeof LoginForm> = {
  component: LoginForm,
  tags: ['autodocs'],
};

type Story = StoryObj<typeof LoginForm>;

export const Primary: Story = {
  args: {
    transtionState: 'idle',
  },
};

export const Submitting: Story = {
  args: {
    transtionState: 'submitting',
  },
};

export const Error: Story = {
  args: {
    transtionState: 'error',
    actionData: {
      formError: 'Invalid email or password',
      fields: {
        email: 'test@email.com',
      },
    },
  },
};

export default meta;

import type { Meta, StoryObj } from '@storybook/react';
import { SignupForm } from './SignupForm';

const meta: Meta<typeof SignupForm> = {
  component: SignupForm,
  tags: ['autodocs'],
};

type Story = StoryObj<typeof SignupForm>;

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

export const ErrorUserExists: Story = {
  args: {
    transtionState: 'idle',
    actionData: {
      formError: 'A user already exists with this email',
    },
  },
};

export const ErrorInvalidFields: Story = {
  args: {
    transtionState: 'idle',
    actionData: {
      fieldErrors: {
        name: 'Name must be at least 3 characters',
        email: 'Invalid email',
        password: 'Password must be at least 6 characters',
        confirmPassword: 'Passwords do not match',
      },
    },
  },
};

export default meta;

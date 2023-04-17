import type { Meta, StoryObj } from '@storybook/react';
import { MuteButton } from './MuteButton';

const meta: Meta<typeof MuteButton> = {
  component: MuteButton,
  tags: ['autodocs'],
};

type Story = StoryObj<typeof MuteButton>;

export const Unmuted: Story = {
  args: {
    muteSpeach: false,
    setIsMuted: () => {},
  },
};

export const Muted: Story = {
  args: {
    muteSpeach: true,
    setIsMuted: () => {},
  },
};

export default meta;

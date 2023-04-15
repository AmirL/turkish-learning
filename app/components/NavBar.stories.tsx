import type { Meta, StoryObj } from '@storybook/react';
import type { NavBarProps } from './NavBar';
import NavBar from './NavBar';
import { BrowserRouter as Router } from 'react-router-dom';

const meta: Meta<typeof NavBar> = {
  component: NavBar,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <Router>
        <Story />
      </Router>
    ),
  ],
  parameters: {
    pathname: {
      values: [
        { name: '/', value: '/' },
        { name: '/repeat', value: '/repeat' },
        { name: '/charts', value: '/charts' },
        { name: '/profile', value: '/profile' },
        { name: '/admin/import', value: '/admin/import' },
      ],
    },
  },
};

type Story = StoryObj<typeof NavBar>;

const template: Story = {
  render: (args) => <NavBar {...args} style={{ position: 'static' }} />,
  args: {
    isAdmin: false,
    repeatCount: 0,
    pathname: '/',
  },
  argTypes: {
    pathname: {
      options: { Home: '/', Repeat: '/repeat', Charts: '/charts', Profile: '/profile', Admin: '/admin/import' },
      control: { type: 'radio' },
    },
  },
};

export const DefaultNavBar: Story = template;

export const NavBarWithRepeatBadge: Story = {
  ...template,
  args: {
    ...template.args,
    repeatCount: 5,
  },
};

export const AdminNavBar: Story = {
  ...template,
  args: {
    ...template.args,
    isAdmin: true,
  },
};

export default meta;

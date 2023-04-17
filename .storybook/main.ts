import type { StorybookConfig } from '@storybook/react-webpack5';
const path = require('path');

const config: StorybookConfig = {
  stories: ['../app/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: ['@storybook/addon-links', '@storybook/addon-essentials', '@storybook/addon-interactions'],
  framework: {
    name: '@storybook/react-webpack5',
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
  webpackFinal: async (config: any, { configType }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '~': path.resolve(__dirname, '../app'),
    };

    return config;
  },
};
export default config;

import type { Meta, StoryObj } from '@storybook/react';

import { BarChart, barChartLabels, knownData, rememberData, repeatData, wellKnownData } from './BarChart';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
  TimeScale,
} from 'chart.js';
import { faker } from '@faker-js/faker';

faker.seed(0);

const meta: Meta<typeof BarChart> = {
  component: BarChart,
  tags: ['autodocs'],
  parameters: {
    viewport: {
      defaultViewport: 'mobile2',
    },
  },
};

type Story = StoryObj<typeof BarChart>;

ChartJS.register(
  TimeScale,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

const sessions = [
  {
    known: 1,
    wellKnown: 1,
    wrong: 20,
    correct: 10,
    date: '2023-01-01',
  },
  {
    known: 10,
    wellKnown: 5,
    wrong: 5,
    correct: 10,
    date: '2023-01-02',
  },
  {
    known: 20,
    wellKnown: 10,
    wrong: 10,
    correct: 20,
    date: '2023-01-03',
  },
];

const labels = barChartLabels(sessions);

export const WellKnownWords: Story = {
  args: {
    data: sessions,
    labels,
    datasets: [wellKnownData, knownData],
  },
};

export const RepeatRemember: Story = {
  args: {
    data: sessions,
    labels,
    datasets: [repeatData, rememberData],
  },
};

export default meta;

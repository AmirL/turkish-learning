import type { StudySession } from '@prisma/client';
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  TimeScale,
  Title,
  Tooltip,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

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

interface Dataset {
  label: string;
  backgroundColor: [string];
  borderColor: [string];
  borderWidth: number;
  borderRadius?: number;
  getData: (session: any) => number;
}

interface BarChartProps {
  labels: string[];
  datasets: Dataset[];
  data: any[];
}

export const wellKnownData: Dataset = {
  label: 'Well known words',
  backgroundColor: ['#60767890'],
  borderColor: ['#34495E'],
  borderWidth: 1,
  borderRadius: 15,
  getData: (session: StudySession) => session.wellKnown,
};

export const knownData: Dataset = {
  label: 'Known words',
  backgroundColor: ['#A5C0B3'],
  borderColor: ['#49674C'],
  borderWidth: 1,
  borderRadius: 15,
  getData: (session: StudySession) => session.known - session.wellKnown,
};

export const repeatData: Dataset = {
  label: 'Repeat',
  backgroundColor: ['#fcd07e'],
  borderColor: ['#E3A934'],
  borderWidth: 1,
  borderRadius: 15,
  getData: (session: StudySession) => session.wrong,
};

export const rememberData: Dataset = {
  label: 'Remember',
  backgroundColor: ['#A5C0B3'],
  borderColor: ['#49674C'],
  borderWidth: 1,
  borderRadius: 15,
  getData: (session: StudySession) => session.correct,
};

export function barChartLabels(sessions: { date: string }[]) {
  const labels = sessions.map((session) => new Date(session.date).toLocaleDateString('ru-RU'));
  return labels;
}

export function BarChart({ labels, datasets, data }: BarChartProps) {
  const options = {
    responsive: true,
    scales: {
      y: {
        stacked: true,
      },
      x: {
        stacked: true,
      },
    },
  };

  const chartData = {
    labels,
    datasets: datasets.map((dataset) => ({
      ...dataset,
      data: data.map(dataset.getData),
    })),
  };
  return <Bar data={chartData} options={options} />;
}

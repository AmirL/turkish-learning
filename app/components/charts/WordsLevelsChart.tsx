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

type WordsLevelsChartProps = {
  levels: {
    level: number;
    count: number;
  }[];
};
export function WordsLevelsChart({ levels }: WordsLevelsChartProps) {
  const data = {
    labels: [
      'Level 1',
      'Level 2',
      'Level 3',
      'Level 4',
      'Level 5',
      'Level 6',
      'Level 7',
      'Level 8',
      'Level 9',
      'Level 10',
    ],
    datasets: [
      {
        label: 'Count words in level',
        backgroundColor: ['#60767890'],
        borderColor: ['#34495E'],
        borderWidth: 1,
        data: levels.map((level) => level.count),
      },
    ],
  };
  return (
    <>
      <Bar data={data} />
    </>
  );
}

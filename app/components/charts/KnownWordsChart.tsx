import type { SerializeFrom } from '@remix-run/node';
import { Bar } from 'react-chartjs-2';
import type { StudySession } from '@prisma/client';

export default function KnownWordsChart({ sessions }: { sessions: SerializeFrom<StudySession>[] }) {
  const labels = sessions.map((session) => new Date(session.date).toLocaleDateString('ru-RU'));

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

  const data = {
    labels,
    datasets: [
      {
        label: 'Well known words',
        data: sessions.map((session) => session.wellKnown),
        backgroundColor: ['#60767890'],
        borderColor: ['#34495E'],
        borderWidth: 1,
      },
      {
        label: 'Known words',
        data: sessions.map((session) => session.known),
        borderRadius: 15,
        backgroundColor: ['#A5C0B3'],
        borderColor: ['#49674C'],
        borderWidth: 1,
      },
    ],
  };
  return <Bar data={data} options={options} />;
}

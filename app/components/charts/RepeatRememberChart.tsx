import type { SerializeFrom } from '@remix-run/node';
import { Bar } from 'react-chartjs-2';
import type { StudySession } from '@prisma/client';

export default function RepeatRememberChart({ sessions }: { sessions: SerializeFrom<StudySession>[] }) {
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
        label: 'Repeat',
        data: sessions.map((session) => session.wrong),
        backgroundColor: ['#fcd07e'],
        borderColor: ['#E3A934'],
        borderWidth: 1,
      },
      {
        label: 'Remember',
        data: sessions.map((session) => session.correct),
        borderRadius: 15,
        backgroundColor: ['#A5C0B3'],
        borderColor: ['#49674C'],
        borderWidth: 1,
      },
    ],
  };
  return <Bar data={data} options={options} />;
}

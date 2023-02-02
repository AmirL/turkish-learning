// @file Render user progress charts based on StudySession data

import type { LoaderArgs, SerializeFrom } from '@remix-run/node';
import { json } from '@remix-run/node';
import { requireUser } from '~/utils/auth.server';
import { db } from '~/utils/db.server';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
  TimeScale,
} from 'chart.js';

import { Line } from 'react-chartjs-2';
import { useEffect, useState } from 'react';
import { useLoaderData } from '@remix-run/react';
import type { StudySession } from '@prisma/client';
import { getLanguageLabel } from '~/utils/strings';

export const handle = {
  title: 'Progress',
  simpleBackground: true,
};

export async function loader({ request }: LoaderArgs) {
  const user = await requireUser(request);

  // load sessions grouped by language and date
  const sessions = await db.studySession.findMany({
    where: {
      user_id: user.id,
    },
    orderBy: {
      date: 'asc',
    },
  });

  // get languages from studySessions
  const languagesData = await db.studySession.groupBy({
    by: ['language'],
    where: {
      user_id: user.id,
    },
  });

  const languages = languagesData.map((language) => language.language);

  return json({ sessions, languages }, 200);
}

export default function ProgressCharts() {
  const [init, setInit] = useState(false);

  useEffect(() => {
    if (init) return;
    ChartJS.register(TimeScale, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler, Legend);
    setInit(true);
  }, [init]);

  const data = useLoaderData<typeof loader>();

  const sessions: { language: string; sessions: SerializeFrom<StudySession>[] }[] = [];
  // prepare data for all languages
  data.languages.forEach((language) => {
    const languageSessions = data.sessions.filter((session) => session.language === language);
    sessions.push({ language, sessions: languageSessions });
  });

  return (
    <div>
      {init
        ? sessions.map((session) => {
            return (
              <div key={session.language}>
                <h2>{getLanguageLabel(session.language)}</h2>
                <LanguageChart sessions={session.sessions} />
              </div>
            );
          })
        : null}
    </div>
  );
}

function prepareChartData(sessions: SerializeFrom<StudySession>[]) {
  const labels = sessions.map((session) => new Date(session.date).getTime());
  const knownWords = sessions.map((session) => session.known);
  const wrong = sessions.map((session) => session.wrong);
  const correct = sessions.map((session) => session.correct);
  const shown = sessions.map((session) => session.shown);
  const ratio = sessions.map((session) => session.ratio);
  return { knownWords, wrong, correct, shown, ratio, labels };
}

function LanguageChart({ sessions }: { sessions: SerializeFrom<StudySession>[] }) {
  const { knownWords, wrong, correct, shown, ratio, labels } = prepareChartData(sessions);

  const color1 = '#A5C0B3';
  const borderColor1 = '#607678';
  const color2 = '#F2E0BE90';
  const borderColor2 = '#fcd07e';

  const chartData1 = {
    labels,
    datasets: [
      {
        label: 'Correct Words',
        data: correct,
        fill: true,
        backgroundColor: [color1],
        borderColor: [borderColor1],
        borderWidth: 1,
      },
      {
        label: 'Shown Words',
        data: shown,
        fill: true,
        backgroundColor: [color2],
        borderColor: [borderColor2],
        borderWidth: 1,
      },
    ],
  };

  const chartData2 = {
    labels,
    datasets: [
      {
        label: 'Ratio',
        data: ratio,
        fill: true,
        backgroundColor: [color1],
        borderColor: [borderColor1],
        borderWidth: 1,
        yAxisID: 'yRatio',
      },
      {
        label: 'Known Words',
        data: knownWords,
        fill: true,
        backgroundColor: [color2],
        borderColor: [borderColor2],
        borderWidth: 1,
      },
    ],
  };

  return (
    <>
      <LinearChart data={chartData1} />
      <LinearChart data={chartData2} />
    </>
  );
}

function LinearChart({ data }: { data: any }) {
  return (
    <Line
      data={data}
      options={{
        scales: {
          y: {
            beginAtZero: true,
          },
          x: {
            type: 'linear',
            ticks: {
              callback: (value) => {
                return new Date(value).toLocaleDateString('ru-RU');
              },
            },
          },
          yRatio: {
            type: 'linear',
            // right
            position: 'right',
            beginAtZero: true,
          },
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: (item) => {
                // format item.parsed.x as dd.mm.YYYY
                return new Date(item.parsed.x).toLocaleDateString('ru-RU');
              },
              title: (item) => {
                return `${item[0].dataset.label}: ${item[0].parsed.y.toString()}`;
              },
            },
          },
          legend: {
            position: 'top' as const,
          },
        },
      }}
    />
  );
}

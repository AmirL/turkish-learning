// @file Render user progress charts based on StudySession data

import type { LoaderArgs, SerializeFrom } from '@remix-run/node';
import { json } from '@remix-run/node';
import { requireUser } from '~/utils/auth.server';
import { db } from '~/utils/db.server';

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

import { Line, Bar } from 'react-chartjs-2';
import { useEffect, useState } from 'react';
import { useLoaderData } from '@remix-run/react';
import type { StudySession } from '@prisma/client';
import { getLanguageLabel } from '~/utils/strings';
export { ErrorBoundary } from '~/components/ErrorBoundary';

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
                <RepeatRememberChart sessions={session.sessions} />
                <KnownWordsChart sessions={session.sessions} />
              </div>
            );
          })
        : null}
    </div>
  );
}

function RepeatRememberChart({ sessions }: { sessions: SerializeFrom<StudySession>[] }) {
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

function KnownWordsChart({ sessions }: { sessions: SerializeFrom<StudySession>[] }) {
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
        data: sessions.map((session) => session.wellKnown),
        backgroundColor: ['#A5C0B3'],
        borderColor: ['#49674C'],
        borderWidth: 1,
      },
      {
        label: 'Remember',
        data: sessions.map((session) => session.known),
        borderRadius: 15,
        backgroundColor: ['#60767890'],
        borderColor: ['#34495E'],
        borderWidth: 1,
      },
    ],
  };
  return <Bar data={data} options={options} />;
}

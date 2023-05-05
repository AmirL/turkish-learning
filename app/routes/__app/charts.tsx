// @file Render user progress charts based on StudySession data

import type { LoaderArgs, SerializeFrom } from '@remix-run/node';
import { json } from '@remix-run/node';
import { requireUser } from '~/utils/auth.server';

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

import { useEffect, useState } from 'react';
import { useLoaderData } from '@remix-run/react';
import type { StudySession } from '@prisma/client';
import { getLanguageLabel } from '~/utils/strings';
import { Grid } from '@mui/material';
import {
  BarChart,
  barChartLabels,
  knownData,
  rememberData,
  repeatData,
  wellKnownData,
} from '~/components/charts/BarChart';

import { ListLearnedWords } from '~/components/charts/ListLearnedWords';
import { WordProgressRepository } from '~/services/database/word-progress.repository.server';
import { StudySessionRepository } from '~/services/database/study-session.repository.server';
import { useTranslation } from '~/utils/useTranslation';
export { ErrorBoundary } from '~/components/ErrorBoundary';

export const handle = {
  title: 'Progress',
  simpleBackground: true,
};

export async function loader({ request }: LoaderArgs) {
  const user = await requireUser(request);

  const FilterDate = new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000);
  // load sessions grouped by language and date
  const sessions = await StudySessionRepository.getUserSessions(user.id, FilterDate);

  // reverse sessions to show them in chronological order
  sessions.reverse();

  // get languages from studySessions
  const languages = await StudySessionRepository.getUserStudyingLanguages(user.id);

  // get last known words for each language
  const lastKnownWords = await WordProgressRepository.findByUser({
    user_id: user.id,
    known: true,
    take: 50,
    orderBy: { known: 'desc' },
  });

  const lastWellKnownWords = await WordProgressRepository.findByUser({
    user_id: user.id,
    wellKnown: true,
    take: 50,
    orderBy: { wellKnown: 'desc' },
  });

  const totalKnownWords = await WordProgressRepository.getUserTotalWords(user.id, 'known');
  const totalWellKnownWords = await WordProgressRepository.getUserTotalWords(user.id, 'wellKnown');

  return json({ sessions, languages, lastKnownWords, lastWellKnownWords, totalKnownWords, totalWellKnownWords }, 200);
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

  const t = useTranslation();

  wellKnownData.label = t('Well known words');
  knownData.label = t('Known words');
  repeatData.label = t('Repeat words');
  rememberData.label = t('Remember words');

  return (
    <div>
      {init
        ? sessions.map((session) => {
            return (
              <div key={session.language}>
                <h2>{getLanguageLabel(session.language)}</h2>
                <BarChart
                  labels={barChartLabels(session.sessions)}
                  data={session.sessions}
                  datasets={[repeatData, rememberData]}
                />
                <BarChart
                  labels={barChartLabels(session.sessions)}
                  data={session.sessions}
                  datasets={[wellKnownData, knownData]}
                />
                <Grid container spacing={2} gridTemplateColumns="repeat(2, 1fr)">
                  <Grid item xs={6}>
                    <ListLearnedWords
                      total={data.totalKnownWords}
                      lastLearnedWords={data.lastKnownWords}
                      language={session.language}
                      title={t('Learned words')}
                      backgroundColor="#C3DCBA"
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <ListLearnedWords
                      total={data.totalWellKnownWords}
                      lastLearnedWords={data.lastWellKnownWords}
                      language={session.language}
                      title={t('Well known words')}
                      backgroundColor="#A5C0B3"
                    />
                  </Grid>
                </Grid>
              </div>
            );
          })
        : null}
    </div>
  );
}

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
import { Link, useLoaderData } from '@remix-run/react';
import type { StudySession, Topic, User, Word, WordProgress } from '@prisma/client';
import { getLanguageLabel } from '~/utils/strings';
import { Box } from '@mui/system';
import { Grid } from '@mui/material';
import KnownWordsChart from '~/components/charts/KnownWordsChart';
import RepeatRememberChart from '~/components/charts/RepeatRememberChart';
import {
  getUserLastKnownWords,
  getUserLastWellKnownWords,
  getUserSessions,
  getUserStudyingLanguages,
} from '~/models/user.server';
export { ErrorBoundary } from '~/components/ErrorBoundary';

export const handle = {
  title: 'Progress',
  simpleBackground: true,
};

export async function loader({ request }: LoaderArgs) {
  const user = await requireUser(request);

  const FilterDate = new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000);
  // load sessions grouped by language and date
  const sessions = await getUserSessions(user.id, FilterDate);

  // reverse sessions to show them in chronological order
  sessions.reverse();

  // get languages from studySessions
  const languages = await getUserStudyingLanguages(user.id);
  console.log('languages', languages);

  // get last known words for each language
  const lastKnownWords = await getUserLastKnownWords(user.id, 50);
  const lastWellKnownWords = await getUserLastWellKnownWords(user.id, 50);

  return json({ sessions, languages, lastKnownWords, lastWellKnownWords }, 200);
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
                <Grid container spacing={2} gridTemplateColumns="repeat(2, 1fr)">
                  <Grid item xs={6}>
                    <Box sx={{ backgroundColor: '#C3DCBA', padding: '1rem', borderRadius: '0.5rem', mt: 3 }}>
                      <h3>Learned words</h3>
                      {getWordsByLanguage(data.lastKnownWords, session.language).map((word) => {
                        return <div key={word.word.id}>{word.word.word}</div>;
                      })}
                      <Box sx={{ mt: 1 }}>
                        <Link to={`/words?language=${session.language}`}>Show all</Link>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ backgroundColor: '#A5C0B3', padding: '1rem', borderRadius: '0.5rem', mt: 3 }}>
                      <h3>Well known words</h3>
                      {getWordsByLanguage(data.lastWellKnownWords, session.language).map((word) => {
                        return <div key={word.word.id}>{word.word.word}</div>;
                      })}
                      <Box sx={{ mt: 1 }}>
                        <Link to={`/words?language=${session.language}`}>Show all</Link>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </div>
            );
          })
        : null}
    </div>
  );
}

type KnowWords = SerializeFrom<
  WordProgress & {
    word: Word & {
      topic: Topic;
    };
  }
>;

function getWordsByLanguage(words: KnowWords[], language: string, limit = 10) {
  const result = words.filter((word) => word.word.topic.languageSource === language);
  return result.slice(0, limit);
}

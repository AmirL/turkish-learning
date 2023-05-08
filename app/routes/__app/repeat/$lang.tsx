import type { LoaderArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import invariant from 'ts-invariant';
import { requireUser } from '~/utils/auth.server';
import { getLanguageLabel } from '~/utils/strings';
import { Box, LinearProgress } from '@mui/material';
import { WordCard } from '~/components/studying/WordCard';
import { useState } from 'react';
import { arrayMoveMutable } from '~/utils/helpers';
import { Completed } from '~/components/studying/Completed';
import { WordProgressService } from '~/services/word-progress.service.server';
import { StudyingService } from '~/services/studying-service';
import { userStore } from '~/routes/__app';
import { MuteButton } from '~/components/MuteButton';
import { RepeatingWordsStore } from '~/stores/words-store';
import { observer } from 'mobx-react-lite';

export { ErrorBoundary } from '~/components/ErrorBoundary';

export const handle = {
  title: 'Repeat',
  simpleBackground: true,
};

export async function loader({ request, params }: LoaderArgs) {
  const user = await requireUser(request);
  const { lang } = params;
  invariant(lang, 'Language is required');

  const wordsWithProgress = await WordProgressService.findWordsToRepeat(user.id, lang, user.learningMode);
  wordsWithProgress.sort(() => Math.random() - 0.5);

  return {
    language: getLanguageLabel(lang),
    words: wordsWithProgress,
  };
}

const RepeatWords = observer(() => {
  const { words, language } = useLoaderData<typeof loader>();

  const [wordStore] = useState(new RepeatingWordsStore(words));

  function userAnswerHandler(correct: boolean) {
    wordStore.answer(correct);
  }

  return (
    <Box>
      <h2>{language}</h2>

      {wordStore.completed ? (
        <Completed to="/repeat" />
      ) : (
        <>
          <LinearProgress variant="determinate" value={wordStore.progress} />
          <WordCard word={wordStore.currentWord} userAnswerHandler={userAnswerHandler} />
          <MuteButton />
        </>
      )}
    </Box>
  );
});

export default RepeatWords;

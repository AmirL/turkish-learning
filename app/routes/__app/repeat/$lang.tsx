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
    user,
  };
}

export default function StudyingTopic() {
  const { words, language, user } = useLoaderData<typeof loader>();

  const [wordsState, setWordsState] = useState(words);
  const [currentWord, setCurrentWord] = useState(words[0]);
  const [wordsCount] = useState(words.length);

  function userAnswerHandler(correct: boolean) {
    if (correct) {
      currentWord.level++;
      // remove word from words array
      wordsState.splice(0, 1);
    } else {
      // decrease word level until it reaches 5
      if (currentWord.level > 5) currentWord.level--;
      // move word to 3 to 6 position
      arrayMoveMutable(wordsState, 0, Math.floor(Math.random() * 3) + 3);
    }

    StudyingService.saveWordProgress({ ...currentWord, correct });

    // save new order
    setWordsState(wordsState);
    // set new word
    setCurrentWord(wordsState[0]);
  }

  const progress = 1 - wordsState.length / wordsCount;
  const completed = wordsState.length < 3;

  return (
    <Box>
      <h2>{language}</h2>

      {completed ? (
        <Completed to="/repeat" />
      ) : (
        <>
          <LinearProgress variant="determinate" value={progress * 100} />
          <WordCard word={currentWord} userAnswerHandler={userAnswerHandler} isMuted={user.muteSpeach} />
        </>
      )}
    </Box>
  );
}

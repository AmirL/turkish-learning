import axios from 'axios';
import type { LoaderArgs, SerializeFrom } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import invariant from 'ts-invariant';
import { requireUser } from '~/utils/auth.server';
import { getLanguageLabel } from '~/utils/strings';
import { Box, LinearProgress } from '@mui/material';
import { WordCard } from '~/components/WordCard';
import { useState } from 'react';
import { arrayMoveMutable } from '~/utils/helpers';
import { Completed } from '~/components/Completed';
import type { WordWithProgress } from '~/services/word-progress.service.server';
import { WordProgressService } from '~/services/word-progress.service.server';

export { ErrorBoundary } from '~/components/ErrorBoundary';

export const handle = {
  title: 'Repeat',
  simpleBackground: true,
};

type Word = SerializeFrom<WordWithProgress>;

export async function loader({ request, params }: LoaderArgs) {
  const user = await requireUser(request);
  const { lang } = params;
  invariant(lang, 'Language is required');

  const wordsWithProgress = await WordProgressService.findWordsToRepeat(user.id, lang, user.learningMode);
  const totalWords = wordsWithProgress.length;
  wordsWithProgress.sort(() => Math.random() - 0.5);

  return {
    language: getLanguageLabel(lang),
    totalWords,
    words: wordsWithProgress,
    user,
  };
}

export default function StudyingTopic() {
  const { words, totalWords, language, user } = useLoaderData<typeof loader>();

  const [currentWord, setCurrentWord] = useState<Word>(words[0]);
  const [wordsArray, setWordsArray] = useState<Word[]>(words);

  function userAnswerHandler(correct: boolean) {
    if (correct) {
      currentWord.level++;
      // remove word from words array
      wordsArray.splice(0, 1);
    } else {
      // decrease word level until it reaches 4
      if (currentWord.level > 4) {
        currentWord.level--;
      }
      // move word to 3 to 6 position
      arrayMoveMutable(wordsArray, 0, Math.floor(Math.random() * 3) + 3);
    }

    axios.post(`/progress/word/${currentWord.id}`, {
      correct,
      level: currentWord.level,
      isReversed: currentWord.isReversed,
    });

    // save new order
    setWordsArray(wordsArray);
    // set new word
    setCurrentWord(wordsArray[0]);
  }

  const progress = 1 - wordsArray.length / totalWords;
  const completed = wordsArray.length < 3;

  return (
    <Box>
      <h2>{language}</h2>

      {completed ? (
        <Completed to="/repeat" />
      ) : (
        <>
          <LinearProgress variant="determinate" value={progress * 100} />
          <WordCard word={currentWord} userAnswerHandler={userAnswerHandler} user={user} />
        </>
      )}
    </Box>
  );
}

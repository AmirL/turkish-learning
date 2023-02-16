import axios from 'axios';
import type { LoaderArgs, SerializeFrom } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { db } from '~/utils/db.server';
import { invariant } from '@remix-run/router';
import { LearningMode, WordWithProgress } from '~/models/words.server';
import { requireUser } from '~/utils/auth.server';
import { getLanguageLabel } from '~/utils/strings';
import { Box, LinearProgress } from '@mui/material';
import { WordCard } from '~/components/WordCard';
import { useState } from 'react';
import { arrayMoveMutable } from '~/utils/helpers';
import { Completed } from '~/components/Completed';
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

  let isReversed: boolean | undefined;
  switch (user.learningMode) {
    case LearningMode.normal:
      isReversed = false;
      break;
    case LearningMode.reverse:
      isReversed = true;
      break;
    case LearningMode.both:
      isReversed = undefined;
      break;
  }

  // get all words with nextReview <= now and current language
  const words = await db.wordProgress.findMany({
    where: {
      user_id: user.id,
      nextReview: {
        lte: new Date(),
      },
      isReversed,
      word: {
        topic: {
          languageSource: lang,
        },
      },
    },
    include: {
      word: {
        include: {
          topic: true,
        },
      },
    },
  });

  // prepare WordWithProgress objects
  const wordsWithProgress = words.map((wordProgress) => ({
    id: wordProgress.word.id,
    word: !wordProgress.isReversed ? wordProgress.word.word : wordProgress.word.translation,
    translation: !wordProgress.isReversed ? wordProgress.word.translation : wordProgress.word.word,
    topic: wordProgress.word.topic,
    isReversed: wordProgress.isReversed,
    level: wordProgress.level,
    wrong: wordProgress.wrong,
  }));

  const totalWords = wordsWithProgress.length;

  // randomize words
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

import { Box, LinearProgress } from '@mui/material';
import type { LoaderArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { db } from '~/utils/db.server';
import { invariant } from '@remix-run/router';
import { getLanguageLabel } from '~/utils/strings';
import { useState } from 'react';
import type { Word } from '~/models/words.server';
import { getWordForStudying } from '~/models/words.server';
import { WordCard } from '~/components/WordCard';

function arrayMoveMutable(arr: any[], from: number, to: number) {
  const startIndex = to < 0 ? arr.length + to : to;
  const item = arr.splice(from, 1)[0];
  arr.splice(startIndex, 0, item);
}

export async function loader({ request, params }: LoaderArgs) {
  const { topicId } = params;

  invariant(topicId, 'Topic ID is required');

  const topic = await db.topic.findUnique({
    where: { id: Number(topicId) },
  });

  invariant(topic, 'Topic not found');

  const words = await getWordForStudying(topic.id);

  invariant(words.length > 0, 'No words to study');

  return {
    topic,
    words,
  };
}

export default function StudyingTopic() {
  const { topic, words } = useLoaderData<typeof loader>();

  const [currentWord, setCurrentWord] = useState<Word>(words[0]);
  const [wordsArray, setWordsArray] = useState<Word[]>(words);

  function userAnswerHandler(correct: boolean) {
    if (correct) {
      // increase word level
      currentWord.level++;

      if (currentWord.level >= 5) {
        // remove word from words array
        wordsArray.splice(0, 1);
      } else {
        const step = (currentWord.level + 1) ** 2;
        // move word forward depending on level
        arrayMoveMutable(wordsArray, 0, step);
        console.log(wordsArray);
      }
    } else {
      // decrease word level
      if (currentWord.level > 0) currentWord.level--;
      // move forward to show after 1 step
      arrayMoveMutable(wordsArray, 0, 1);
    }

    // TODO: if left less than 3 words finish studying

    // save new order
    setWordsArray(wordsArray);
    // set new word
    setCurrentWord(wordsArray[0]);

    // TODO: update word in db
  }

  // summ of all levels
  const totalLevel = words.reduce((acc, word) => acc + word.level, 0);

  const progress = totalLevel / (words.length * 5);

  return (
    <Box>
      <h1>{topic.name}</h1>
      <h2>
        {getLanguageLabel(topic.languageSource)} - {getLanguageLabel(topic.languageTarget)}
      </h2>
      <LinearProgress variant="determinate" value={progress * 100} />
      <WordCard word={currentWord} userAnswerHandler={userAnswerHandler} />
    </Box>
  );
}

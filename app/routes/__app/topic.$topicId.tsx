import axios from 'axios';
import type { LoaderArgs, SerializeFrom } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { db } from '~/utils/db.server';
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
import { sortRandom } from '~/utils/arrays';
import { WordService } from '~/services/word.service.server';
import { ListCompleted } from '~/components/ListCompleted';
export { ErrorBoundary } from '~/components/ErrorBoundary';

export const handle = {
  title: 'Study',
  simpleBackground: true,
};

type Word = SerializeFrom<WordWithProgress>;

export async function loader({ request, params }: LoaderArgs) {
  const user = await requireUser(request);

  invariant(params.topicId, 'Topic ID is required');
  const topicId = parseInt(params.topicId);

  const topic = await db.topic.findUnique({
    where: { id: Number(topicId) },
  });
  invariant(topic, 'Topic not found');

  let topicWords = await WordService.getWordsByTopicId(topicId);
  invariant(topicWords.length > 0, 'No words in topic');

  let words = await WordProgressService.getWordsProgress(topicWords, user.id, user.learningMode);
  invariant(words.length > 0, 'No words to study');

  // save total words count including words with level 5 and higher
  const totalWords = words;

  // remove words with level 5 and higher, not need to study them anymore
  words = words.filter((word) => word.level < 5);

  // sort words randomly
  words = sortRandom(words);

  return {
    totalWords,
    topic,
    words,
    user,
  };
}

export default function StudyingTopic() {
  const { topic, words, totalWords, user } = useLoaderData<typeof loader>();

  const [currentWord, setCurrentWord] = useState<Word>(words[0]);
  const [wordsArray, setWordsArray] = useState<Word[]>(words);

  function userAnswerHandler(correct: boolean) {
    if (correct) {
      if (currentWord.wrong === 0 && currentWord.level === 0) {
        currentWord.level = 4;
      } else {
        // just increase word level
        currentWord.level++;
      }

      if (currentWord.level >= 5) {
        // remove word from words array
        wordsArray.splice(0, 1);
      } else {
        const step = Math.floor(currentWord.level ** 1.8);
        // move word forward depending on level
        arrayMoveMutable(wordsArray, 0, step);
      }
      if (wordsArray.length < 3 && topic) {
        axios
          .post(`/progress/topic/${topic.id}`, {
            completed: true,
          })
          .then(() => {
            console.log('Topic mark as completed');
          });
      }
    } else {
      // decrease word level by 2
      currentWord.level -= 2;
      if (currentWord.level < 0) {
        currentWord.level = 0;
      }
      // move forward to show after 1 step
      arrayMoveMutable(wordsArray, 0, 1);
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

  // summ of all levels
  let totalLevel = words.reduce((acc, word) => acc + word.level, 0);

  // add to total level 5 points for each finished word
  const finishedWords = totalWords.length - wordsArray.length;
  totalLevel += finishedWords * 5;

  const progress = totalLevel / (totalWords.length * 5);
  const completed = wordsArray.length < 3;

  return (
    <Box>
      <h2>{topic.name}</h2>
      <h3>
        {getLanguageLabel(topic.languageSource)} - {getLanguageLabel(topic.languageTarget)}
      </h3>

      {completed ? (
        <>
          <Completed />
          <ListCompleted words={totalWords} />
        </>
      ) : (
        <>
          <LinearProgress variant="determinate" value={progress * 100} />
          <WordCard word={currentWord} userAnswerHandler={userAnswerHandler} user={user} />
        </>
      )}
    </Box>
  );
}

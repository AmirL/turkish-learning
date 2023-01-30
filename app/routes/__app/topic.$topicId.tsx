import { Box, Button, LinearProgress } from '@mui/material';
import type { LoaderArgs, SerializeFrom } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';
import { db } from '~/utils/db.server';
import { invariant } from '@remix-run/router';
import { getLanguageLabel } from '~/utils/strings';
import { useState } from 'react';
import type { WordWithProgress } from '~/models/words.server';
import { getWordForStudying } from '~/models/words.server';
import { WordCard } from '~/components/WordCard';
import { requireUser } from '~/utils/auth.server';
import styled from '@emotion/styled';
import axios from 'axios';

type Word = SerializeFrom<WordWithProgress>;

export async function loader({ request, params }: LoaderArgs) {
  const user = await requireUser(request);

  const { topicId } = params;

  invariant(topicId, 'Topic ID is required');

  const topic = await db.topic.findUnique({
    where: { id: Number(topicId) },
  });

  invariant(topic, 'Topic not found');

  const words = await getWordForStudying(topic.id, user.id);

  invariant(words.length > 0, 'No words to study');

  const totalWords = words.length;

  // remove words with level 5 and higher
  const wordToStudy = words.filter((word) => word.level < 5);

  return {
    user,
    totalWords,
    topic,
    words: wordToStudy,
  };
}

const H1Styled = styled.h1`
  font-size: 3rem;
`;

export default function StudyingTopic() {
  const { topic, words, totalWords } = useLoaderData<typeof loader>();

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
        // TODO recheck this, something goes wrong here
        const step = Math.floor(currentWord.level ** 1.8);
        // move word forward depending on level
        arrayMoveMutable(wordsArray, 0, step);
      }
      if (wordsArray.length < 3) {
        axios
          .post(`/progress/topic/${topic.id}`, {
            completed: true,
          })
          .then(() => {
            console.log('Topic mark as completed');
          });
      }
    } else {
      // decrease word level
      if (currentWord.level > 0) currentWord.level--;
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
  const finishedWords = totalWords - wordsArray.length;
  totalLevel += finishedWords * 5;

  const progress = totalLevel / (totalWords * 5);
  const completed = wordsArray.length < 3;

  const wordLanguageSource = !currentWord.isReversed ? topic.languageSource : topic.languageTarget;
  const wordLanguageTarget = !currentWord.isReversed ? topic.languageTarget : topic.languageSource;

  return (
    <Box>
      <h1>{topic.name}</h1>
      <h2>
        {getLanguageLabel(topic.languageSource)} - {getLanguageLabel(topic.languageTarget)}
      </h2>
      {completed ? (
        // big congrats in justifying center
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <H1Styled>Completed!</H1Styled>
          <Link to="/">
            <Button variant="contained">Go back</Button>
          </Link>
        </Box>
      ) : (
        <>
          <LinearProgress variant="determinate" value={progress * 100} />
          <WordCard
            word={currentWord}
            userAnswerHandler={userAnswerHandler}
            languageSource={wordLanguageSource}
            languageTarget={wordLanguageTarget}
          />
        </>
      )}
    </Box>
  );
}

function arrayMoveMutable(arr: any[], from: number, to: number) {
  const startIndex = to < 0 ? arr.length + to : to;
  const item = arr.splice(from, 1)[0];
  arr.splice(startIndex, 0, item);
}

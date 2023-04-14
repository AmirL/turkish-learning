import type { SerializeFrom } from '@remix-run/node';

import { LinearProgress } from '@mui/material';
import { WordCard } from '~/components/WordCard';
import { useContext, useState } from 'react';
import { Completed } from '~/components/Completed';
import type { WordWithProgress } from '~/services/word-progress.service.server';
import { ListCompleted } from '~/components/ListCompleted';
import { AppContext } from './AppContext';
import type { Topic } from '@prisma/client';
import { StudyingService } from '~/services/studying-service';
export { ErrorBoundary } from '~/components/ErrorBoundary';

type Word = SerializeFrom<WordWithProgress>;

type StudyingProps = {
  topic: SerializeFrom<Topic>;
  words: Word[];
  totalWords: Word[];
};

export function StudyingTopic({ topic, words, totalWords }: StudyingProps) {
  const [currentWord, setCurrentWord] = useState<Word>(words[0]);
  const [wordsArray, setWordsArray] = useState<Word[]>(words);

  const { user } = useContext(AppContext);

  function userAnswerHandler(correct: boolean) {
    if (correct && wordsArray.length < 3 && topic) {
      StudyingService.markTopicAsCompleted(topic.id);
    }

    StudyingService.updateCurrentWord(correct, currentWord);
    StudyingService.saveWordProgress({ ...currentWord, correct });

    StudyingService.updateWordsArray(correct, currentWord.level, wordsArray);

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
    <>
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
    </>
  );
}

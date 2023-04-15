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
};

export function StudyingTopic({ topic, words }: StudyingProps) {
  const [wordsState, setWordsState] = useState(words.filter((word) => word.level < 5));
  const [currentWord, setCurrentWord] = useState(wordsState[0]);

  const { user } = useContext(AppContext);

  function userAnswerHandler(correct: boolean) {
    if (correct && wordsState.length < 3 && topic) {
      StudyingService.markTopicAsCompleted(topic.id);
    }

    StudyingService.updateWordLevel(correct, currentWord);
    StudyingService.saveWordProgress({ ...currentWord, correct });

    StudyingService.moveCurrentWord(correct, currentWord.level, wordsState);

    // save new order
    setWordsState(wordsState);
    // set new word
    setCurrentWord(wordsState[0]);
  }

  // summ of all levels
  const progress = StudyingService.getProgress(words);
  const completed = wordsState.length < 3;

  return (
    <>
      {completed ? (
        <>
          <Completed />
          <ListCompleted words={words} />
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

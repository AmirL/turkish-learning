import { LinearProgress } from '@mui/material';
import { WordCard } from '~/components/studying/WordCard';
import { useState } from 'react';
import { Completed } from '~/components/studying/Completed';

import { MuteButton } from '../MuteButton';
import type { WordWithProgress } from '~/services/word-progress.service.server';
import type { SerializeFrom } from '@remix-run/node';
import { ListCompleted } from './ListCompleted';
import { StudyingWordsStore } from '~/stores/words-store';
import { observer } from 'mobx-react-lite';
export { ErrorBoundary } from '~/components/ErrorBoundary';

type StudyingProps = {
  topic_id: number;
  words: SerializeFrom<WordWithProgress>[];
};

export const StudyingTopic = observer(({ topic_id, words }: StudyingProps) => {
  const [wordsStore] = useState(new StudyingWordsStore(words, topic_id));

  function userAnswerHandler(correct: boolean) {
    wordsStore.answer(correct);
  }

  return (
    <>
      {wordsStore.completed ? (
        <>
          <Completed />
          <ListCompleted words={wordsStore.baseWords} />
        </>
      ) : (
        <>
          <LinearProgress variant="determinate" value={wordsStore.progress} />
          <WordCard word={wordsStore.currentWord} userAnswerHandler={userAnswerHandler} />
          <MuteButton />
        </>
      )}
    </>
  );
});

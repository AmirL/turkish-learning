import { LinearProgress } from '@mui/material';
import { WordCard } from '~/components/studying/WordCard';
import { useContext, useState } from 'react';
import { Completed } from '~/components/studying/Completed';
import { AppContext } from '../AppContext';

import { StudyingService } from '~/services/studying-service';
import { MuteButton } from '../MuteButton';
import type { WordWithProgress } from '~/services/word-progress.service.server';
import type { SerializeFrom } from '@remix-run/node';
import { ListCompleted } from './ListCompleted';
export { ErrorBoundary } from '~/components/ErrorBoundary';

type StudyingProps = {
  topic_id: number;
  words: SerializeFrom<WordWithProgress>[];
};

export function StudyingTopic({ topic_id, words }: StudyingProps) {
  console.log(words);
  const [wordsState, setWordsState] = useState(words.filter((word) => word.level < 5));
  const [currentWord, setCurrentWord] = useState(wordsState[0]);

  const { user } = useContext(AppContext);
  const [isMuted, setIsMuted] = useState(user.muteSpeach);

  function userAnswerHandler(correct: boolean) {
    if (correct && wordsState.length < 3) {
      StudyingService.markTopicAsCompleted(topic_id);
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
          <WordCard word={currentWord} userAnswerHandler={userAnswerHandler} isMuted={isMuted} />
          <MuteButton muteSpeach={isMuted} setIsMuted={setIsMuted} />
        </>
      )}
    </>
  );
}

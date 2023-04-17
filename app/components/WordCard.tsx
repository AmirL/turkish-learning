import { Box, Button, Paper, Stack, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { styled } from '@mui/system';
import { SpeakText } from './SpeakText';

export type Word = {
  word: string;
  translation: string;
  isReversed: boolean;
  topic: {
    languageSource: string;
    languageTarget: string;
  };
};

type WordCardProps = {
  isMuted: boolean;
  word: Word;
  userAnswerHandler: (correct: boolean) => void;
  flipped?: boolean;
};

const CorrectButton = styled(Button)(({ theme }) => ({
  color: '#477464',
  fontSize: '1.5em',
  // disable uppercase
  textTransform: 'none',
}));

const RepeatButton = styled(Button)(({ theme }) => ({
  color: '#A74B4C',
  fontSize: '1.5em',
  // disable uppercase
  textTransform: 'none',
}));

const PaperStyled = styled(Paper)(({ theme }) => ({
  borderRadius: '16px',
  padding: 25,
  margin: 25,
  minHeight: 200,
  backgroundColor: '#7B7664',
  color: '#FFF',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  '&.flipped': {
    backgroundColor: '#527166',
  },
}));

export function WordCard({ word, userAnswerHandler, isMuted, ...rest }: WordCardProps) {
  const [flipped, setFlipped] = useState(rest.flipped ?? false);

  const languageSource = !word.isReversed ? word.topic.languageSource : word.topic.languageTarget;
  const languageTarget = !word.isReversed ? word.topic.languageTarget : word.topic.languageSource;

  const text = flipped ? word.translation : word.word;
  const language = flipped ? languageTarget : languageSource;

  function flip() {
    setFlipped((prev) => !prev);
  }

  function CorrectButtonClicked() {
    flip();
    userAnswerHandler(true);
  }

  function RepeatButtonClicked() {
    flip();
    userAnswerHandler(false);
  }

  useEffect(() => {
    if (!isMuted) {
      SpeakText(text, language);
    }
  }, [text, language, isMuted]);

  return (
    <Box>
      <PaperStyled elevation={3} className={flipped ? 'flipped' : ''} onClick={flip}>
        <Typography variant="h4" alignContent="center" textAlign="center">
          {text}
        </Typography>
      </PaperStyled>
      {flipped ? (
        <Stack spacing={5} direction="row" justifyContent="center">
          <CorrectButton onClick={CorrectButtonClicked}>Got it</CorrectButton>
          <RepeatButton onClick={RepeatButtonClicked}>Repeat</RepeatButton>
        </Stack>
      ) : null}
      <p style={{ textAlign: 'center' }}>*Click on the word to flip</p>
    </Box>
  );
}

import { Box, Button, Grid, Paper, Stack, Typography } from '@mui/material';
import type { SerializeFrom } from '@remix-run/node';
import { useEffect, useState } from 'react';
import { styled } from '@mui/system';
import type { WordWithProgress } from '~/models/words.server';
import { SpeakText } from './SpeakText';

type WordCardProps = {
  word: SerializeFrom<WordWithProgress>;
  languageSource: string;
  languageTarget: string;
  userAnswerHandler: (correct: boolean) => void;
};

const CorrectButton = styled(Button)(({ theme }) => ({
  color: theme.palette.primary.main,
  fontSize: '1.5em',
  // disable uppercase
  textTransform: 'none',
}));

const RepeatButton = styled(Button)(({ theme }) => ({
  color: theme.palette.error.main,
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
    // color: '#062E05',
  },
}));

export function WordCard({ word, userAnswerHandler, languageSource, languageTarget }: WordCardProps) {
  const [flipped, setFlipped] = useState(false);

  const text = flipped ? word.translation : word.word;
  const language = flipped ? languageTarget : languageSource;

  function flip() {
    setFlipped((prev) => !prev);
  }

  useEffect(() => {
    SpeakText(text, language);
  }, [text, language]);

  return (
    <Box>
      <PaperStyled
        elevation={3}
        className={flipped ? 'flipped' : ''}
        // sx={{ borderRadius: '16px', p: 5, m: 5, bgcolor: flipped ? '#6B4E90' : '#FFF' }}
        onClick={flip}
      >
        <Typography variant="h4" alignContent="center" textAlign="center">
          {text}
        </Typography>
      </PaperStyled>
      {flipped ? (
        <Stack spacing={5} direction="row" justifyContent="center">
          <CorrectButton
            onClick={() => {
              flip();
              userAnswerHandler(true);
            }}
          >
            Got it
          </CorrectButton>
          <RepeatButton
            onClick={() => {
              flip();
              userAnswerHandler(false);
            }}
          >
            Repeat
          </RepeatButton>
        </Stack>
      ) : null}
      <p style={{ textAlign: 'center' }}>*Click on the word to flip</p>
    </Box>
  );
}

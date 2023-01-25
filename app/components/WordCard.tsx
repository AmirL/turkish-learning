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
  color: theme.palette.success.main,
  fontSize: '1.5em',
  // disable uppercase
  textTransform: 'none',
}));

const RepeatButton = styled(Button)(({ theme }) => ({
  color: '#d32f2f',
  fontSize: '1.5em',
  // disable uppercase
  textTransform: 'none',
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
      <Paper elevation={3} sx={{ p: 5, m: 5, bgcolor: flipped ? '#6B4E90' : '#427A82' }} onClick={flip}>
        <Grid container justifyContent="center">
          <Typography variant="h4" alignContent="center" textAlign="center" color="white">
            {text}
          </Typography>
        </Grid>
      </Paper>
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

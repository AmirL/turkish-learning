import { Box, Button, Grid, Stack, Typography } from '@mui/material';
import type { SerializeFrom } from '@remix-run/node';
import { useState } from 'react';
import { styled } from '@mui/system';
import type { Word } from '~/models/words.server';

type WordCardProps = {
  word: SerializeFrom<Word>;
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

export function WordCard({ word, userAnswerHandler }: WordCardProps) {
  const [flipped, setFlipped] = useState(false);

  const text = flipped ? word.translation : word.word;

  function flip() {
    setFlipped((prev) => !prev);
  }

  return (
    <Box>
      <Grid
        onClick={flip}
        sx={{ p: 10 }}
        container
        spacing={0}
        direction="column"
        alignItems="center"
        justifyContent="center"
      >
        <Typography variant="h2">{text}</Typography>
      </Grid>
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

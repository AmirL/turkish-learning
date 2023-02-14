import { Box, Button, Paper, Stack, Typography } from '@mui/material';
import type { SerializeFrom } from '@remix-run/node';
import { useEffect, useState } from 'react';
import { styled } from '@mui/system';
import type { WordWithProgress } from '~/models/words.server';
import { SpeakText } from './SpeakText';
import type { User } from '@prisma/client';
import axios from 'axios';

type WordCardProps = {
  word: SerializeFrom<WordWithProgress>;
  userAnswerHandler: (correct: boolean) => void;
  user: SerializeFrom<User>;
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

export function WordCard({ word, userAnswerHandler, user }: WordCardProps) {
  const [flipped, setFlipped] = useState(false);

  const languageSource = !word.isReversed ? word.topic.languageSource : word.topic.languageTarget;
  const languageTarget = !word.isReversed ? word.topic.languageTarget : word.topic.languageSource;

  const text = flipped ? word.translation : word.word;
  const language = flipped ? languageTarget : languageSource;

  const [isMuted, setIsMuted] = useState(user.muteSpeach);

  const switchMute = () => {
    setIsMuted((prev) => !prev);
    // send by axios to /user/mute
    axios.post('/user/mute', { muteSpeach: !isMuted });
  };

  function flip() {
    setFlipped((prev) => !prev);
  }

  useEffect(() => {
    if (!isMuted) {
      SpeakText(text, language);
    }
  }, [text, language, isMuted]);

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
      <Box sx={{ textAlign: 'center' }}>
        <Button onClick={switchMute} variant="outlined">
          {isMuted ? 'Unmute' : 'Mute'} speach
        </Button>
      </Box>
    </Box>
  );
}

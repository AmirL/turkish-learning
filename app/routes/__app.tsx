import { Outlet, useLoaderData, useMatches } from '@remix-run/react';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import { CircularProgress, Stack } from '@mui/material';
import { useTransition } from '@remix-run/react';
import type { LoaderArgs } from '@remix-run/node';
import { requireUser } from '~/utils/auth.server';
import UserAvatar from '~/components/UserAvatar';
import NavBar from '~/components/NavBar';
import { styled } from '@mui/system';
import { useState } from 'react';
import { AppContext } from '~/components/AppContext';
import { WordProgressService } from '~/services/word-progress.service.server';
export { ErrorBoundary } from '~/components/ErrorBoundary';

export async function loader({ request }: LoaderArgs) {
  const user = await requireUser(request);

  const repeatLanguages = await WordProgressService.languagesToRepeat(user);
  // summ languages count
  const repeatCount = repeatLanguages.reduce((acc, lang) => acc + parseInt(lang.count, 10), 0);

  return { user, repeatCount };
}

const TopBarStyled = styled(Box)({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  backgroundColor: '#fbf5e3',
  zIndex: 100,
  '&.simpleBackground': {
    backgroundColor: '#e8edf1',
  },
});

export default function AppLayout() {
  const { user, repeatCount } = useLoaderData<typeof loader>();

  const matches = useMatches();
  // find match with title in handle property
  const match = matches.find((match) => match.handle?.title ?? false);
  const title = match?.handle?.title ?? false;

  const transtion = useTransition();

  const loading = transtion.state === 'loading' || transtion.state === 'submitting';
  const simpleBackground = matches.some((match) => match.handle?.simpleBackground);

  const [repeatBadge, setRepeatBadge] = useState(repeatCount);

  return (
    <AppContext.Provider value={{ repeatCount: repeatBadge, setRepeatCount: setRepeatBadge }}>
      <Container maxWidth="sm">
        <TopBarStyled className={simpleBackground ? 'simpleBackground' : ''}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              p: 2,
              pb: 0,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <img src="/logo.png" alt="logo" width="50" height="50" />
              <Box sx={{ ml: 2 }}>{title ? <h1>{title}</h1> : null}</Box>
            </Box>
            {loading ? <CircularProgress /> : null}
            <Stack direction="row" spacing={2} alignItems="center">
              <h4>{user.name}</h4>
              <UserAvatar user={user} />
            </Stack>
          </Box>
        </TopBarStyled>
        <Box sx={{ mb: 15, mt: 14 }}>
          <Outlet />
        </Box>
        <NavBar user={user} />
      </Container>
    </AppContext.Provider>
  );
}

import { Outlet, useLoaderData, useMatches } from '@remix-run/react';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import { CircularProgress, Paper, Stack } from '@mui/material';
import { useTransition } from '@remix-run/react';
import type { LoaderArgs } from '@remix-run/node';
import { requireUser } from '~/utils/auth.server';
import UserAvatar from '~/components/UserAvatar';
import NavBar from '~/components/NavBar';

export async function loader({ request }: LoaderArgs) {
  const user = await requireUser(request);
  return { user };
}

export default function AppLayout() {
  const { user } = useLoaderData<typeof loader>();

  const matches = useMatches();
  // find match with title in handle property
  const match = matches.find((match) => match.handle?.title ?? false);
  const title = match?.handle?.title ?? false;

  const transtion = useTransition();

  const loading = transtion.state === 'loading' || transtion.state === 'submitting';

  return (
    <>
      <Container maxWidth="sm">
        <Paper
          sx={{ position: 'fixed', top: 0, left: 0, right: 0, backgroundColor: 'white', zIndex: 100 }}
          elevation={3}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, pb: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <img src="/logo.png" alt="logo" width="50" height="50" />
              <Box sx={{ ml: 2 }}>
                <h2>MemoLang</h2>
              </Box>
            </Box>
            {loading ? <CircularProgress /> : null}
            <Stack direction="row" spacing={2} alignItems="center">
              <h4>{user.name}</h4>
              <UserAvatar user={user} />
            </Stack>
          </Box>
        </Paper>
        <Box sx={{ my: 4, mt: 13, mb: 15 }}>
          {title ? <h1>{title}</h1> : null}
          <Outlet />
        </Box>
        <NavBar user={user} />
      </Container>
    </>
  );
}

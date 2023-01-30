import { Box, Stack } from '@mui/material';
import { Outlet, useMatches } from '@remix-run/react';

export default function AuthLayout() {
  const matches = useMatches();
  // find match with title in handle property
  const match = matches.find((match) => match.handle?.title ?? false);
  const title = match?.handle?.title ?? 'Auth';

  return (
    // align items center to center the content
    <Box alignItems="center" display="flex" justifyContent="center" minHeight="100vh">
      <Stack alignItems="center" maxWidth={350}>
        <h1>{title}</h1>
        <Outlet />
      </Stack>
    </Box>
  );
}

import { Box, Stack } from '@mui/material';
import { Outlet, useMatches } from '@remix-run/react';
export { ErrorBoundary } from '~/components/ErrorBoundary';

export default function AuthLayout() {
  const matches = useMatches();
  // find match with title in handle property
  const match = matches.find((match) => match.handle?.title ?? false);
  const title = match?.handle?.title ?? 'Auth';

  return (
    // align items center to center the content
    <Box alignItems="center" display="flex" justifyContent="center" minHeight="100vh">
      <Stack
        alignItems="center"
        maxWidth={400}
        sx={{
          backgroundColor: '#fff',
          pl: 6,
          pr: 6,
          pt: 2,
          pb: 2,
          minWidth: 350,
          borderRadius: '16px',
          boxShadow: '0 0 10px 0 rgba(0, 0, 0, 0.1)',
        }}
      >
        <h1>{title}</h1>
        <Outlet />
      </Stack>
    </Box>
  );
}

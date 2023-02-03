import { Alert, AlertTitle } from '@mui/material';

export function ErrorBoundary({ error }: { error: Error }) {
  return (
    <Alert severity="error" sx={{ width: '100%', height: '100%' }}>
      <AlertTitle>Error</AlertTitle>
      {error.message}
    </Alert>
  );
}

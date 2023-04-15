import { Alert, AlertTitle } from '@mui/material';

/**
 * Shows erorr message to the user
 */
export function ErrorBoundary({ error }: { error: Error }) {
  return (
    <Alert severity="error" sx={{ width: '100%', height: '100%' }}>
      <AlertTitle>Error</AlertTitle>
      {error.message}
    </Alert>
  );
}

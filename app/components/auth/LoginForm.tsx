import { Button, Grid, TextField, Typography } from '@mui/material';

interface LoginProps {
  actionData?: {
    formError?: string;
    fields?: {
      email?: string;
    };
  };
  transtionState: string;
}

export function LoginForm({ actionData, transtionState }: LoginProps) {
  const submitText = transtionState === 'idle' ? 'Login' : 'Logging in...';

  return (
    <>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12}>
          {actionData?.formError ? (
            <Typography color="error" sx={{ textAlign: 'left' }}>
              {actionData.formError}
            </Typography>
          ) : null}
        </Grid>
        <Grid item xs={12}>
          <TextField
            id="email"
            variant="outlined"
            label="Email"
            name="email"
            required
            fullWidth
            autoComplete="email"
            defaultValue={actionData?.fields?.email}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            id="password"
            variant="outlined"
            label="Password"
            name="password"
            type={'password'}
            required
            fullWidth
            autoComplete="current-password"
          />
        </Grid>
        <Grid item xs={12} justifyContent="center" display="flex">
          <Button type="submit" variant="contained" color="primary" disabled={transtionState !== 'idle'}>
            {submitText}
          </Button>
        </Grid>
      </Grid>
    </>
  );
}

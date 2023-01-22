import type { LoaderFunction, ActionFunction } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import authenticator, { login } from '~/utils/auth.server';
import { json } from '@remix-run/node';
import { Form, Link, useActionData, useTransition } from '@remix-run/react';
import { Box } from '@mui/system';
import { Button, Grid, TextField, Typography } from '@mui/material';
import { badRequest } from '~/utils/request.server';

export const loader: LoaderFunction = async ({ request }) => {
  const user = await authenticator.isAuthenticated(request);
  if (user !== null && user instanceof Error === false) {
    return redirect('/');
  }

  return json({});
};

export const action: ActionFunction = async ({ request, context }) => {
  const formData = await request.clone().formData();
  const email = formData.get('email');
  const password = formData.get('password');
  const redirectTo = formData.get('redirectTo');

  if (typeof email !== 'string' || typeof password !== 'string') {
    return badRequest({
      fields: null,
      formError: 'Invalid form data',
    });
  }

  const fields = { email };

  let user;

  try {
    user = await authenticator.authenticate('form', request, {
      throwOnError: true,
    });
  } catch (error) {
    return badRequest({
      fields,
      formError: 'Invalid email or password',
    });
  }

  if (user instanceof Error || user === null) {
    return badRequest({
      fields,
      formError: 'Something went wrong',
    });
  }

  return await login(user, request, redirectTo);
};

export default function Login() {
  const actionData = useActionData<typeof action>();
  const transtion = useTransition();

  const submitText = transtion.state === 'idle' ? 'Login' : 'Logging in...';

  return (
    <Box sx={{ textAlign: 'center' }} maxWidth="xs">
      <h1>Login</h1>
      <Form method="post">
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
          <Grid item xs={12}>
            <Button type="submit" variant="contained" color="primary" fullWidth disabled={transtion.state !== 'idle'}>
              {submitText}
            </Button>
          </Grid>
        </Grid>
      </Form>
      <Typography sx={{ mt: 2 }}>
        Don't have an account?{' '}
        <Link to="/signup" replace>
          Sign up
        </Link>
      </Typography>
    </Box>
  );
}

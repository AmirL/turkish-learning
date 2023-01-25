import type { ActionFunction, LoaderFunction } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';

import { Form, Link, useSearchParams, useActionData, useTransition } from '@remix-run/react';

import { createUser, getUserByEmail } from '~/models/user.server';
import { Box, Button, Grid, TextField, Typography } from '@mui/material';
import { badRequest } from '~/utils/request.server';
import { getLoggedUser, login } from '~/utils/auth.server';

export const loader: LoaderFunction = async ({ request }) => {
  const user = await getLoggedUser(request);
  if (user) return redirect('/');
  return json({});
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const name = formData.get('name');
  const email = formData.get('email');
  const password = formData.get('password');
  const confirmPassword = formData.get('confirmPassword');
  const redirectTo = formData.get('redirectTo');

  if (
    typeof email !== 'string' ||
    typeof password !== 'string' ||
    typeof confirmPassword !== 'string' ||
    typeof name !== 'string'
  ) {
    return badRequest({
      fieldErrors: null,
      fields: null,
      formError: 'Invalid form data',
    });
  }

  const fields = { email };
  const fieldErrors = {
    email: validateEmail(email),
    password: validatePassword(password),
    confirmPassword: validateConfirmPassword(password, confirmPassword),
    name: validateName(name),
  };

  if (Object.values(fieldErrors).some((error) => error)) {
    return badRequest({ fieldErrors, fields, formError: null });
  }

  const existingUser = await getUserByEmail(email);
  if (existingUser) {
    return badRequest({
      fieldErrors: null,
      fields,
      formError: 'A user already exists with this email',
    });
  }

  const user = await createUser(email, password, name);
  return await login(user, request, redirectTo);
};

export default function Signup() {
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') ?? undefined;
  const data = useActionData<typeof action>();
  const transition = useTransition();

  const submitText = transition.state !== 'idle' ? 'Signing up...' : 'Sign Up';

  return (
    <Box sx={{ textAlign: 'center' }} maxWidth="xs">
      <h1>Sign Up</h1>
      <Form method="post">
        {/* Grid to style signup form */}
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12}>
            {data?.formError ? (
              <Typography color="error" sx={{ textAlign: 'left' }}>
                {data.formError}
              </Typography>
            ) : null}
          </Grid>
          <Grid item xs={12}>
            <TextField
              id="name"
              variant="outlined"
              label="Student name"
              name="name"
              required
              fullWidth
              autoComplete="name"
              defaultValue={data?.fields?.name}
              error={!!data?.fieldErrors?.name}
              helperText={data?.fieldErrors?.name}
            />
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
              defaultValue={data?.fields?.email}
              error={!!data?.fieldErrors?.email}
              helperText={data?.fieldErrors?.email}
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
              error={!!data?.fieldErrors?.password}
              helperText={data?.fieldErrors?.password}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              id="confirmPassword"
              variant="outlined"
              label="Confirm Password"
              name="confirmPassword"
              type={'password'}
              required
              fullWidth
              autoComplete="current-password"
              error={!!data?.fieldErrors?.confirmPassword}
              helperText={data?.fieldErrors?.confirmPassword}
            />
          </Grid>
          <Grid item xs={12}>
            <Button type="submit" variant="contained" disabled={transition.state !== 'idle'}>
              {submitText}
            </Button>
          </Grid>
        </Grid>
        <input type="hidden" name="redirectTo" defaultValue={redirectTo} />
      </Form>
      <p>
        <Link to="/login">Already have an account?</Link>
      </p>
    </Box>
  );
}

function validateEmail(email: unknown) {
  if (typeof email !== 'string') return 'Email is required';
  const regex =
    /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;
  if (!String(email).match(regex)) return 'Email is invalid';
}

function validatePassword(password: unknown) {
  if (typeof password !== 'string') return 'Password is required';
  if (password.length < 6) return 'Password is too short';
}

function validateConfirmPassword(password: unknown, confirmPassword: unknown) {
  if (typeof confirmPassword !== 'string') return 'Confirm password is required';
  if (password !== confirmPassword) return 'Passwords do not match';
}

function validateName(name: unknown) {
  if (typeof name !== 'string') return 'Name is required';
  if (name.length < 2) return 'Name is too short';
}

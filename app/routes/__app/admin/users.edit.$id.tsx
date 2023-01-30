// @file edit user form by admin

import { Alert, Box, Button, Grid, TextField } from '@mui/material';
import { json } from '@remix-run/node';
import { Form, Link, useActionData, useLoaderData } from '@remix-run/react';
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/router';
import { invariant } from '@remix-run/router';
import UserAvatar from '~/components/UserAvatar';
import { hashPassword } from '~/models/user.server';

import { requireUser } from '~/utils/auth.server';
import { db } from '~/utils/db.server';
import { badRequest } from '~/utils/request.server';

export async function loader({ request, params }: LoaderFunctionArgs) {
  const userData = await db.user.findUnique({
    where: { id: Number(params.id) },
  });

  invariant(userData, 'User not found');

  return { status: 200, userData };
}

export async function action({ request, params }: ActionFunctionArgs) {
  const user = await requireUser(request);

  if (!user.isAdmin) {
    return badRequest({ error: 'You must be an admin to access this page', success: false });
  }

  const userData = await db.user.findUnique({
    where: { id: Number(params.id) },
  });

  if (!userData) {
    return badRequest({ error: 'User not found', success: false });
  }

  const formData = await request.formData();

  const name = formData.get('name');
  const email = formData.get('email');
  const password = formData.get('password');
  const passwordConfirm = formData.get('passwordConfirm');

  if (typeof name !== 'string' || typeof email !== 'string') {
    return badRequest({ error: 'Invalid form data', success: false });
  }

  interface Data {
    name: string;
    email: string;
    password?: string;
  }

  let data: Data = {
    name,
    email,
  };

  if (typeof password === 'string' && password.length > 0) {
    if (typeof passwordConfirm !== 'string') {
      return badRequest({ error: 'Invalid form data', success: false });
    }

    if (password !== passwordConfirm) {
      return badRequest({ error: 'Passwords do not match', success: false });
    }
    data.password = await hashPassword(password);
  }

  await db.user.update({
    where: { id: Number(params.id) },
    data,
  });

  return json({ error: null, success: true });
}

export default function EditUser() {
  const { userData } = useLoaderData<typeof loader>();
  const data = useActionData<typeof action>();

  return (
    <Box sx={{ textAlign: 'center' }} maxWidth="xs">
      <h1>Edit User {userData.name}</h1>
      <Form method="post">
        <Grid container spacing={2}>
          <Grid item xs={12} justifyContent="center" display="flex">
            <UserAvatar user={userData} sx={{ width: 100, height: 100 }} />
          </Grid>
          <Grid item xs={12}>
            {data?.success ? <Alert severity="success">User updated successfully</Alert> : null}
            {data?.error ? <Alert severity="error">{data.error}</Alert> : null}
          </Grid>
          <Grid item xs={12}>
            <TextField label="name" name="name" defaultValue={userData.name} fullWidth />
          </Grid>
          <Grid item xs={12}>
            <TextField label="email" name="email" defaultValue={userData.email} fullWidth />
          </Grid>
          <Grid item xs={12}>
            <TextField label="password" name="password" type="password" fullWidth />
          </Grid>
          <Grid item xs={12}>
            <TextField label="password confirmation" name="passwordConfirm" type="password" fullWidth />
          </Grid>
          <Grid item xs={12}>
            <Button variant="contained" type="submit">
              Update
            </Button>
          </Grid>
        </Grid>
      </Form>
      <Link to="/admin/users">
        <Button variant="contained" sx={{ mt: 10 }} color="secondary">
          Back to users
        </Button>
      </Link>
    </Box>
  );
}

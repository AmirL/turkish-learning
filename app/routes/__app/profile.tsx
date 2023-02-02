import { Box, Button, Typography } from '@mui/material';
import { Container } from '@mui/system';
import type { ActionFunction, LoaderFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Form, useLoaderData, useTransition } from '@remix-run/react';
import UserAvatar from '~/components/UserAvatar';
import { changeUserAvatar } from '~/models/user.server';
import { requireUser } from '~/utils/auth.server';

export const handle = {
  title: 'Profile',
};

export const loader: LoaderFunction = async ({ request }) => {
  const user = await requireUser(request);

  return { user };
};

export const action: ActionFunction = async ({ request }) => {
  const user = await requireUser(request);

  // generate new avatar
  await changeUserAvatar(user.id);

  return json({}, 200);
};

export default function UserProfile() {
  const data = useLoaderData<typeof loader>();
  const avatarSize = 100;
  const transition = useTransition();

  const loading = transition.state === 'loading' || transition.state === 'submitting';

  return (
    <>
      <Container sx={{ mt: 5 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
          <UserAvatar user={data.user} sx={{ width: avatarSize, height: avatarSize, mb: 2 }} />
          <Form method="post">
            <Button variant="contained" type="submit" color="primary" disabled={loading}>
              Generate new avatar
            </Button>
          </Form>
        </Box>
        <Typography variant="subtitle1">Name: {data.user.name}</Typography>
        <Typography variant="subtitle1">Email: {data.user.email}</Typography>
      </Container>

      <Container sx={{ mt: 15 }}>
        <Form action="/logout" method="post">
          <Button variant="contained" type="submit" color="error">
            Logout
          </Button>
        </Form>
      </Container>
    </>
  );
}

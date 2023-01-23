import { Button, Typography } from '@mui/material';
import { Container } from '@mui/system';
import type { LoaderFunction } from '@remix-run/node';
import { Form, useLoaderData } from '@remix-run/react';
import { requireUser } from '~/utils/auth.server';

export const loader: LoaderFunction = async ({ request }) => {
  const user = await requireUser(request);

  return { email: user.email };
};

export default function UserProfile() {
  const data = useLoaderData<typeof loader>();
  return (
    <div>
      <h1>User Profile</h1>
      You are logged in as:
      <Typography variant="h4">{data?.email}</Typography>
      <Container sx={{ mt: 5 }}>
        <Form action="/logout" method="post">
          <Button variant="contained" type="submit" color="error">
            Logout
          </Button>
        </Form>
      </Container>
    </div>
  );
}

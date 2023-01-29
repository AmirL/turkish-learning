import { Button } from '@mui/material';
import { Stack } from '@mui/system';
import { LoaderArgs } from '@remix-run/node';
import { Link } from '@remix-run/react';
import { invariant } from '@remix-run/router';
import { requireUser } from '~/utils/auth.server';

export async function loader({ request }: LoaderArgs) {
  const user = await requireUser(request);

  invariant(user.isAdmin, 'You must be an admin to access this page');

  return { status: 200 };
}

export default function AdminActions() {
  const links = [
    { label: 'Users', link: '/admin/users' },
    { label: 'Import', link: '/import' },
  ];
  return (
    <>
      <h1>Admin Actions</h1>
      <Stack spacing={2} direction="column" sx={{ width: '100%' }}>
        {links.map((link) => (
          <Link to={link.link} key={link.link}>
            <Button variant="contained">{link.label}</Button>
          </Link>
        ))}
      </Stack>
    </>
  );
}

import { Box, Tab, Tabs } from '@mui/material';
import type { LoaderArgs } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { Link, Outlet, useLocation } from '@remix-run/react';
import { requireUser } from '~/utils/auth.server';
export { ErrorBoundary } from '~/components/ErrorBoundary';

export const handle = {
  title: 'Admin Panel',
  simpleBackground: true,
};

export async function loader({ request }: LoaderArgs) {
  const user = await requireUser(request);

  if (!user.isAdmin) {
    return redirect('/');
  }

  return { status: 200 };
}

export default function AdminActions() {
  const links = [
    { label: 'Users', link: '/admin/users' },
    { label: 'Topics', link: '/admin/topics' },
    { label: 'Words', link: '/admin/words' },
    { label: 'Import', link: '/admin/import' },
  ];

  const location = useLocation();

  // find of location contains link
  const value = links.findIndex((link) => location.pathname.includes(link.link));

  return (
    <>
      <Tabs value={value}>
        {links.map((link) => (
          <Tab label={link.label} component={Link} to={link.link} key={link.link} />
        ))}
      </Tabs>
      <Box sx={{ pt: 2 }}>
        <Outlet />
      </Box>
    </>
  );
}

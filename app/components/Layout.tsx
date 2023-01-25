import * as React from 'react';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import { Avatar, BottomNavigation, BottomNavigationAction, CircularProgress, Paper, Stack } from '@mui/material';
import { Link, useLocation, useTransition } from '@remix-run/react';
import HomeIcon from '@mui/icons-material/Home';
import ImportExportIcon from '@mui/icons-material/ImportExport';
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import type { User } from '~/models/user.server';
import UserAvatar from './UserAvatar';

export default function Layout({
  children,
  user = null,
  avatar = null,
}: {
  children: React.ReactNode;
  user?: User | null;
  avatar?: string | null;
}) {
  const location = useLocation();
  const transtion = useTransition();

  const loading = transtion.state === 'loading' || transtion.state === 'submitting';

  const navBar = [
    { label: 'Home', icon: <HomeIcon />, link: '/' },
    { label: 'Import', icon: <ImportExportIcon />, link: '/import' },
    { label: 'Profile', icon: <AccountBoxIcon />, link: '/profile' },
  ];

  // remove import tab for non editors
  if (user && user.isEditor === false) {
    navBar.splice(1, 1);
  }

  return (
    <Container maxWidth="sm">
      <Paper sx={{ position: 'fixed', top: 0, left: 0, right: 0 }} elevation={3}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, pb: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <img src="/logo.png" alt="logo" width="50" height="50" />
            <Box sx={{ ml: 2 }}>
              <h2>Wordbook</h2>
            </Box>
          </Box>
          {loading ? <CircularProgress /> : null}
          {user ? (
            <Stack direction="row" spacing={2} alignItems="center">
              <h4>{user.name}</h4>
              <UserAvatar user={user} />
            </Stack>
          ) : null}
        </Box>
      </Paper>
      <Box sx={{ my: 4, mt: 13 }}>{children}</Box>
      {user ? (
        <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }} elevation={3}>
          <BottomNavigation value={location.pathname}>
            {navBar.map((item) => (
              <BottomNavigationAction
                component={Link}
                to={item.link}
                showLabel
                label={item.label}
                icon={item.icon}
                key={item.link}
                value={item.link}
              />
            ))}
          </BottomNavigation>
        </Paper>
      ) : null}
    </Container>
  );
}

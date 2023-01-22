import * as React from 'react';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import { BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import { Link, useLocation } from '@remix-run/react';
import HomeIcon from '@mui/icons-material/Home';
import ImportExportIcon from '@mui/icons-material/ImportExport';
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import type { User } from '~/models/user.server';

export default function Layout({ children, user = null }: { children: React.ReactNode; user?: User | null }) {
  const location = useLocation();
  console.log(location);

  const navBar = [
    { label: 'Home', icon: <HomeIcon />, link: '/' },
    { label: 'Import', icon: <ImportExportIcon />, link: '/import' },
    { label: 'User', icon: <AccountBoxIcon />, link: '/user' },
  ];

  const [activeButton, setActiveButton] = React.useState(location.pathname);

  // remove import tab for non editors
  if (user && user.editor === false) {
    navBar.splice(1, 1);
  }

  return (
    <Container maxWidth="sm">
      <Box sx={{ my: 4 }}>{children}</Box>
      {user ? (
        <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }} elevation={3}>
          <BottomNavigation
            value={activeButton}
            onChange={(event, newValue) => {
              setActiveButton(newValue);
            }}
          >
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

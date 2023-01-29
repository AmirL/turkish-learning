import { BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import { Link, useLocation } from '@remix-run/react';
import HomeIcon from '@mui/icons-material/Home';
import ImportExportIcon from '@mui/icons-material/ImportExport';
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import type { User } from '~/models/user.server';

import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';

export default function NavBar({ user }: { user: User }) {
  const location = useLocation();

  const navBar = [
    { label: 'Home', icon: <HomeIcon />, link: '/' },
    { label: 'Profile', icon: <AccountBoxIcon />, link: '/profile' },
  ];

  // remove import tab for non editors
  if (user && user.isAdmin) {
    // add admin tab for admins
    navBar.push({ label: 'Admin', icon: <AdminPanelSettingsIcon />, link: '/admin' });
  }

  return (
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
  );
}

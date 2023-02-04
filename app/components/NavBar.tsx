import { Badge, BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import { Link, useLocation } from '@remix-run/react';
import HomeIcon from '@mui/icons-material/Home';
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import type { User } from '~/models/user.server';

import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import type { SerializeFrom } from '@remix-run/node';
import LeaderboardIcon from '@mui/icons-material/Leaderboard';
import LoopIcon from '@mui/icons-material/Loop';
import { useContext } from 'react';
import { AppContext } from './AppContext';

export default function NavBar({ user }: { user: SerializeFrom<User> }) {
  const location = useLocation();

  const appContext = useContext(AppContext);
  const repeatCount = appContext.repeatCount ?? 0;

  const navBar = [
    { label: 'Home', icon: <HomeIcon />, link: '/' },
    // show repeat count on the icon badge
    {
      label: 'Repeat',
      icon: (
        <Badge badgeContent={repeatCount} color="error" anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
          <LoopIcon />
        </Badge>
      ),
      link: '/repeat',
    },

    { label: 'Charts', icon: <LeaderboardIcon />, link: '/charts' },
    { label: 'Profile', icon: <AccountBoxIcon />, link: '/profile' },
  ];

  // remove import tab for non editors
  if (user.isAdmin) {
    // add admin tab for admins only
    navBar.push({ label: 'Admin', icon: <AdminPanelSettingsIcon />, link: '/admin/import' });
  }

  return (
    <Paper
      sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, height: 80, backgroundColor: '#E8EDF1' }}
      elevation={3}
    >
      <BottomNavigation value={location.pathname} sx={{ backgroundColor: '#E8EDF1' }}>
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

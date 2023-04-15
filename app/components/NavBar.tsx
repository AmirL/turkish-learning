import { Badge, BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import { Link } from '@remix-run/react';
import HomeIcon from '@mui/icons-material/Home';
import AccountBoxIcon from '@mui/icons-material/AccountBox';

import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';

import LeaderboardIcon from '@mui/icons-material/Leaderboard';
import LoopIcon from '@mui/icons-material/Loop';

type NavBarItem = {
  label: string;
  icon: JSX.Element;
  link: string;
};

export type NavBarProps = {
  isAdmin: boolean;
  repeatCount: number;
  // can be one of [/, /repeat, /charts, /profile, /admin/import]
  pathname: string;
} & Record<string, unknown>;

export default function NavBar({ isAdmin, repeatCount, pathname = '/', ...rest }: NavBarProps) {
  const navBar: NavBarItem[] = [
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
  if (isAdmin) {
    // add admin tab for admins only
    navBar.push({ label: 'Admin', icon: <AdminPanelSettingsIcon />, link: '/admin/import' });
  }

  return (
    <Paper
      sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, height: 80, backgroundColor: '#E8EDF1' }}
      elevation={3}
      {...rest}
    >
      <BottomNavigation value={pathname} sx={{ backgroundColor: '#E8EDF1' }}>
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

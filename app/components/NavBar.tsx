import { Badge, BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import { Link } from '@remix-run/react';
import HomeIcon from '@mui/icons-material/Home';
import AccountBoxIcon from '@mui/icons-material/AccountBox';

import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';

import LeaderboardIcon from '@mui/icons-material/Leaderboard';
import LoopIcon from '@mui/icons-material/Loop';
import { useTranslation } from '~/utils/useTranslation';
import { observer } from 'mobx-react-lite';
import { userStore } from '~/routes/__app';

type NavBarItem = {
  label: string;
  icon: JSX.Element;
  link: string;
};

export type NavBarProps = {
  isAdmin: boolean;
  // can be one of [/, /repeat, /charts, /profile, /admin/import]
  pathname: string;
} & Record<string, unknown>;

export default observer(({ isAdmin, pathname = '/', ...rest }: NavBarProps) => {
  const t = useTranslation();

  const navBar: NavBarItem[] = [
    { label: t('Home'), icon: <HomeIcon />, link: '/' },
    // show repeat count on the icon badge
    {
      label: t('Repeat'),
      icon: (
        <Badge
          badgeContent={userStore.repeatCount}
          color="error"
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <LoopIcon />
        </Badge>
      ),
      link: '/repeat',
    },

    { label: t('Charts'), icon: <LeaderboardIcon />, link: '/charts' },
    { label: t('Profile'), icon: <AccountBoxIcon />, link: '/profile' },
  ];

  if (userStore.repeatCount === 0) {
    navBar.splice(1, 1);
  }

  // remove import tab for non editors
  if (isAdmin) {
    // add admin tab for admins only
    navBar.push({ label: t('Admin'), icon: <AdminPanelSettingsIcon />, link: '/admin/import' });
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
});

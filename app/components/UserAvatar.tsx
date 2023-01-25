import type { AvatarProps } from '@mui/material';
import { Avatar } from '@mui/material';
import type { User } from '~/models/user.server';

interface Props {
  user: User;
}

export default function UserAvatar({ user, ...rest }: Props & AvatarProps) {
  return (
    <Avatar {...rest}>
      <img alt="User avatar" src={`data:image/svg+xml;utf8,${encodeURIComponent(user.avatar)}`} />
    </Avatar>
  );
}

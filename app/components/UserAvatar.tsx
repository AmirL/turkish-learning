import { Avatar } from '@mui/material';
import type { User } from '~/models/user.server';

interface Props {
  user: User;
}

export default function UserAvatar({ user, ...rest }: Props & any) {
  const width = rest?.sx?.width ?? 40;
  return (
    <Avatar {...rest}>
      <img width={width} alt="User avatar" src={`data:image/svg+xml;utf8,${encodeURIComponent(user.avatar)}`} />
    </Avatar>
  );
}

import { Avatar } from '@mui/material';

interface Props {
  avatar: string;
}

export default function UserAvatar({ avatar, ...rest }: Props & any) {
  const width = rest?.sx?.width ?? 40;
  return (
    <Avatar {...rest}>
      <img width={width} alt="User avatar" src={`data:image/svg+xml;utf8,${encodeURIComponent(avatar)}`} />
    </Avatar>
  );
}

import { Box, Button } from '@mui/material';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import { userStore } from '~/routes/__app';
import { observer } from 'mobx-react-lite';

export const MuteButton = observer(() => {
  return (
    <Box sx={{ textAlign: 'center' }}>
      <Button onClick={() => userStore.toggleMuteSpeach()} variant="outlined">
        {userStore.user.muteSpeach ? <VolumeOffIcon /> : <VolumeUpIcon />}
      </Button>
    </Box>
  );
});

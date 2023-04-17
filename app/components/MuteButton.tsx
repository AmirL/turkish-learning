import { Box, Button } from '@mui/material';
import axios from 'axios';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';

export function MuteButton({ muteSpeach, setIsMuted }: { muteSpeach: boolean; setIsMuted: (value: boolean) => void }) {
  function switchMute() {
    setIsMuted(!muteSpeach);
    axios.post('/user/mute', { muteSpeach: !muteSpeach });
  }

  return (
    <Box sx={{ textAlign: 'center' }}>
      <Button onClick={switchMute} variant="outlined">
        {muteSpeach ? <VolumeOffIcon /> : <VolumeUpIcon />}
      </Button>
    </Box>
  );
}

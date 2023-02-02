import { createTheme } from '@mui/material/styles';
import { red } from '@mui/material/colors';

// Create a theme instance.
const theme = createTheme({
  palette: {
    primary: {
      main: '#477464',
      dark: '#062E05',
    },
    secondary: {
      main: '#19857b',
    },
    error: {
      main: '#A74B4C',
    },
  },
});

export default theme;

import { createTheme } from '@mui/material/styles';


const lightTheme = createTheme({
  typography: {
    fontFamily: 'Pretendard, sans-serif',
  },
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f4f6f8',
      paper: '#ffffff',
    },
  },
});

const darkTheme = createTheme({
  typography: {
    fontFamily: 'Pretendard, sans-serif',
  },
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
    },
    secondary: {
      main: '#f48fb1',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
  },
});

export { lightTheme, darkTheme };
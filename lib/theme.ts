import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#FB8500',
    },
    secondary: {
      main: '#1B4332',
    },
    background: {
      default: '#003566',
      paper: '#004080',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#F1F1F1',
    },
  },
  shape: {
    borderRadius: 12,
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      'Oxygen',
      'Ubuntu',
      'Cantarell',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: { fontWeight: 700, lineHeight: 1.3 },
    h2: { fontWeight: 700, lineHeight: 1.3 },
    h3: { fontWeight: 700, lineHeight: 1.3 },
    h4: { fontWeight: 700, lineHeight: 1.3 },
    h5: { fontWeight: 700, lineHeight: 1.3 },
    h6: { fontWeight: 700, lineHeight: 1.3 },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          minHeight: 48,
          padding: '12px 24px',
          textTransform: 'none',
          fontWeight: 700,
          fontSize: '1rem',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: 'rgba(255, 255, 255, 0.4)',
            },
            '&:hover fieldset': {
              borderColor: '#FB8500',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#FB8500',
              borderWidth: 2,
            },
          },
        },
      },
    },
    MuiBottomNavigation: {
      styleOverrides: {
        root: {
          backgroundColor: '#1B4332',
        },
      },
    },
  },
});

export default theme;

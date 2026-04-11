import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#FB8500',
    },
    secondary: {
      main: '#1B4332',
    },
    background: {
      default: '#003566',
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
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 700 },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          minHeight: 48,
          padding: '12px 24px',
          textTransform: 'none',
          fontWeight: 700,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '&.Mui-focused fieldset': {
              borderColor: '#FB8500',
              borderWidth: 2,
            },
          },
        },
      },
    },
  },
});

export default theme;

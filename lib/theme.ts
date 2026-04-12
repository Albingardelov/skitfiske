import { createTheme } from '@mui/material/styles';

/** Nordisk vattenpalett: kall teal som UI-accent, mässing endast på primära CTA (knappar/FAB). */
const brass = '#c4a667';
const brassText = '#12151a';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#5a9e98',
      dark: '#3f7a75',
      light: '#7ec4bd',
      contrastText: '#061012',
    },
    secondary: {
      main: '#152022',
      contrastText: 'rgba(230,232,234,0.92)',
    },
    background: {
      default: '#0a0f11',
      paper: '#121a1c',
    },
    text: {
      primary: '#e8eaec',
      secondary: 'rgba(232,234,236,0.58)',
    },
    divider: 'rgba(255,255,255,0.08)',
    action: {
      hover: 'rgba(255,255,255,0.06)',
      selected: 'rgba(90, 158, 152, 0.16)',
    },
  },
  shape: {
    borderRadius: 12,
  },
  typography: {
    fontFamily: [
      'var(--font-sans)',
      'system-ui',
      'Segoe UI',
      'sans-serif',
    ].join(','),
    h1: { fontFamily: 'var(--font-serif), Georgia, serif', fontWeight: 600, letterSpacing: '-0.02em' },
    h2: { fontFamily: 'var(--font-serif), Georgia, serif', fontWeight: 600, letterSpacing: '-0.02em' },
    h3: { fontFamily: 'var(--font-serif), Georgia, serif', fontWeight: 600, letterSpacing: '-0.02em' },
    h4: { fontFamily: 'var(--font-serif), Georgia, serif', fontWeight: 600, letterSpacing: '-0.02em' },
    h5: { fontFamily: 'var(--font-serif), Georgia, serif', fontWeight: 600, letterSpacing: '-0.02em' },
    h6: { fontFamily: 'var(--font-serif), Georgia, serif', fontWeight: 600, letterSpacing: '-0.02em' },
    subtitle1: { fontWeight: 500, letterSpacing: '0.01em' },
    subtitle2: { fontWeight: 500 },
    body1: { fontWeight: 400 },
    body2: { fontWeight: 400 },
    button: { fontWeight: 600, letterSpacing: '0.02em' },
    caption: { letterSpacing: '0.03em' },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#0a0f11',
          backgroundImage: `
            radial-gradient(ellipse 90% 55% at 50% -12%, rgba(90, 158, 152, 0.09), transparent 52%),
            radial-gradient(ellipse 70% 45% at 100% 40%, rgba(60, 100, 120, 0.06), transparent 48%)
          `,
          backgroundAttachment: 'fixed',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          minHeight: 48,
          padding: '12px 24px',
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '0.9375rem',
          borderRadius: 14,
          boxShadow: 'none',
          '&:hover': { boxShadow: 'none' },
          '&.MuiButton-containedPrimary': {
            backgroundColor: brass,
            color: brassText,
            '&:hover': {
              backgroundColor: '#d4bc85',
            },
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 14,
            '& fieldset': {
              borderColor: 'rgba(255, 255, 255, 0.12)',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(90, 158, 152, 0.45)',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#5a9e98',
              borderWidth: 1,
            },
          },
        },
      },
    },
    MuiFilledInput: {
      styleOverrides: {
        root: {
          borderRadius: 14,
          backgroundColor: 'rgba(255,255,255,0.06)',
          '&:hover': {
            backgroundColor: 'rgba(255,255,255,0.09)',
          },
          '&.Mui-focused': {
            backgroundColor: 'rgba(255,255,255,0.08)',
          },
          '&::before': { display: 'none' },
          '&::after': { display: 'none' },
        },
      },
    },
    MuiBottomNavigation: {
      styleOverrides: {
        root: {
          backgroundColor: 'transparent',
          borderTop: 'none',
          height: 'auto',
          minHeight: 56,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          border: 'none',
          boxShadow: '0 4px 24px rgba(0,0,0,0.28)',
          borderRadius: 18,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          fontSize: '0.8125rem',
          textTransform: 'none',
          letterSpacing: '0.02em',
          color: 'text.secondary',
          '&.Mui-selected': {
            color: 'primary.light',
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          minHeight: 48,
        },
        indicator: {
          backgroundColor: '#5a9e98',
          height: 2,
        },
      },
    },
    MuiToggleButtonGroup: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(18, 26, 28, 0.9)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 12,
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
        },
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '0.8125rem',
          color: 'text.secondary',
          '&.Mui-selected': {
            color: 'primary.light',
            backgroundColor: 'rgba(90, 158, 152, 0.18)',
            '&:hover': {
              backgroundColor: 'rgba(90, 158, 152, 0.22)',
            },
          },
        },
      },
    },
    MuiFab: {
      styleOverrides: {
        root: {
          boxShadow: '0 8px 28px rgba(0,0,0,0.45)',
          '&.MuiFab-primary': {
            backgroundColor: brass,
            color: brassText,
            '&:hover': {
              backgroundColor: '#d4bc85',
            },
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          color: 'text.secondary',
          '&:hover': {
            color: 'primary.light',
            backgroundColor: 'action.hover',
          },
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 14,
          border: '1px solid',
          backgroundImage: 'none',
          '&.MuiAlert-standardError': {
            borderColor: 'rgba(239, 83, 80, 0.35)',
          },
          '&.MuiAlert-standardSuccess': {
            borderColor: 'rgba(102, 187, 106, 0.35)',
          },
        },
      },
    },
    MuiLink: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          textUnderlineOffset: 3,
        },
      },
    },
  },
});

export default theme;

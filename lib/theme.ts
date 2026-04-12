import { createTheme } from '@mui/material/styles';

/** Mogen, dämpad palett: kol/slate med mässingsaccent — undviker leksaksblå + kraftorange. */
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#c4a667',
      dark: '#9a7f4a',
      light: '#d4bc85',
      contrastText: '#12151a',
    },
    secondary: {
      main: '#1e2a2e',
      contrastText: 'rgba(230,232,234,0.92)',
    },
    background: {
      default: '#0c0f14',
      paper: '#131820',
    },
    text: {
      primary: '#e6e8ea',
      secondary: 'rgba(230,232,234,0.62)',
    },
    divider: 'rgba(255,255,255,0.09)',
    action: {
      hover: 'rgba(255,255,255,0.05)',
      selected: 'rgba(196, 166, 103, 0.14)',
    },
  },
  shape: {
    borderRadius: 6,
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
    subtitle1: { fontWeight: 600, letterSpacing: '0.01em' },
    subtitle2: { fontWeight: 600 },
    button: { fontWeight: 600, letterSpacing: '0.02em' },
    caption: { letterSpacing: '0.04em' },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#0c0f14',
          backgroundImage: `
            radial-gradient(ellipse 100% 60% at 50% -15%, rgba(196, 166, 103, 0.07), transparent 55%),
            radial-gradient(ellipse 80% 50% at 100% 50%, rgba(80, 120, 140, 0.04), transparent 45%)
          `,
          backgroundAttachment: 'fixed',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          minHeight: 44,
          padding: '10px 22px',
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '0.9375rem',
          borderRadius: 6,
          boxShadow: 'none',
          '&:hover': { boxShadow: 'none' },
        },
        containedPrimary: {
          '&:hover': { backgroundColor: '#d4bc85' },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 6,
            '& fieldset': {
              borderColor: 'rgba(255, 255, 255, 0.14)',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(196, 166, 103, 0.45)',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#c4a667',
              borderWidth: 1,
            },
          },
        },
      },
    },
    MuiBottomNavigation: {
      styleOverrides: {
        root: {
          backgroundColor: '#131820',
          borderTop: '1px solid rgba(255,255,255,0.09)',
          height: 64,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          boxShadow: 'none',
          border: '1px solid',
          borderColor: 'rgba(255,255,255,0.09)',
          borderRadius: 8,
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
          backgroundColor: '#c4a667',
          height: 2,
        },
      },
    },
    MuiToggleButtonGroup: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(19, 24, 32, 0.85)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 6,
          boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
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
            backgroundColor: 'action.selected',
            '&:hover': {
              backgroundColor: 'action.selected',
            },
          },
        },
      },
    },
    MuiFab: {
      styleOverrides: {
        root: {
          boxShadow: '0 6px 24px rgba(0,0,0,0.4)',
        },
        primary: {
          '&:hover': {
            backgroundColor: '#d4bc85',
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
          borderRadius: 8,
          border: '1px solid',
          backgroundImage: 'none',
        },
        standardError: {
          borderColor: 'rgba(239, 83, 80, 0.35)',
        },
        standardSuccess: {
          borderColor: 'rgba(102, 187, 106, 0.35)',
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

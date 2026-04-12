import { createTheme, type Theme } from '@mui/material/styles';
import type { ColorScheme } from './designTokens';
import { darkPalette, lightPalette } from './palettes';

const sharedShape = { borderRadius: 12 };

const sharedTypography = {
  fontFamily: ['var(--font-sans)', 'system-ui', 'Segoe UI', 'sans-serif'].join(','),
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
};

export function createAppTheme(mode: ColorScheme) {
  const palette = mode === 'light' ? lightPalette : darkPalette;

  return createTheme({
    palette,
    shape: sharedShape,
    typography: sharedTypography,
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: ({ theme }: { theme: Theme }) => ({
            backgroundColor: theme.palette.background.default,
            backgroundImage:
              theme.palette.mode === 'light'
                ? `radial-gradient(ellipse 90% 55% at 50% -12%, rgba(24, 48, 29, 0.06), transparent 52%),
                   radial-gradient(ellipse 70% 45% at 100% 40%, rgba(159, 65, 21, 0.04), transparent 48%)`
                : `radial-gradient(ellipse 90% 55% at 50% -12%, rgba(169, 208, 175, 0.08), transparent 52%),
                   radial-gradient(ellipse 70% 45% at 100% 40%, rgba(38, 72, 47, 0.35), transparent 48%)`,
            backgroundAttachment: 'fixed',
          }),
        },
      },
      MuiButton: {
        styleOverrides: {
          root: ({ theme }: { theme: Theme }) => ({
            minHeight: 48,
            padding: '12px 24px',
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '0.9375rem',
            borderRadius: 14,
            boxShadow: 'none',
            '&:hover': { boxShadow: 'none' },
            '&.MuiButton-containedPrimary': {
              backgroundColor: theme.palette.primary.main,
              color: theme.palette.primary.contrastText,
              '&:hover': {
                backgroundColor: theme.palette.primary.light,
              },
            },
          }),
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: ({ theme }: { theme: Theme }) => ({
            '& .MuiOutlinedInput-root': {
              borderRadius: 14,
              '& fieldset': {
                borderColor:
                  theme.palette.mode === 'light'
                    ? 'rgba(27, 28, 28, 0.18)'
                    : 'rgba(255, 255, 255, 0.14)',
              },
              '&:hover fieldset': {
                borderColor: theme.palette.primary.light,
              },
              '&.Mui-focused fieldset': {
                borderColor: theme.palette.primary.main,
                borderWidth: 1,
              },
            },
          }),
        },
      },
      MuiFilledInput: {
        styleOverrides: {
          root: ({ theme }: { theme: Theme }) => ({
            borderRadius: 14,
            backgroundColor:
              theme.palette.mode === 'light' ? 'rgba(27, 28, 28, 0.05)' : 'rgba(255,255,255,0.06)',
            '&:hover': {
              backgroundColor:
                theme.palette.mode === 'light' ? 'rgba(27, 28, 28, 0.08)' : 'rgba(255,255,255,0.09)',
            },
            '&.Mui-focused': {
              backgroundColor:
                theme.palette.mode === 'light' ? 'rgba(27, 28, 28, 0.06)' : 'rgba(255,255,255,0.08)',
            },
            '&::before': { display: 'none' },
            '&::after': { display: 'none' },
          }),
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
          root: ({ theme }: { theme: Theme }) => ({
            backgroundImage: 'none',
            border: 'none',
            boxShadow:
              theme.palette.mode === 'light'
                ? '0 4px 24px rgba(27, 28, 28, 0.08)'
                : '0 4px 24px rgba(0,0,0,0.28)',
            borderRadius: 18,
          }),
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
              color: 'primary.main',
            },
          },
        },
      },
      MuiTabs: {
        styleOverrides: {
          root: {
            minHeight: 48,
          },
          indicator: ({ theme }: { theme: Theme }) => ({
            backgroundColor: theme.palette.primary.main,
            height: 2,
          }),
        },
      },
      MuiToggleButtonGroup: {
        styleOverrides: {
          root: ({ theme }: { theme: Theme }) => ({
            backgroundColor:
              theme.palette.mode === 'light'
                ? 'rgba(255, 255, 255, 0.85)'
                : 'rgba(31, 32, 32, 0.92)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 12,
            boxShadow:
              theme.palette.mode === 'light'
                ? '0 4px 20px rgba(27, 28, 28, 0.08)'
                : '0 4px 20px rgba(0,0,0,0.3)',
          }),
        },
      },
      MuiToggleButton: {
        styleOverrides: {
          root: ({ theme }: { theme: Theme }) => ({
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '0.8125rem',
            color: 'text.secondary',
            '&.Mui-selected': {
              color: theme.palette.primary.main,
              backgroundColor:
                theme.palette.mode === 'light'
                  ? 'rgba(24, 48, 29, 0.1)'
                  : 'rgba(169, 208, 175, 0.14)',
              '&:hover': {
                backgroundColor:
                  theme.palette.mode === 'light'
                    ? 'rgba(24, 48, 29, 0.14)'
                    : 'rgba(169, 208, 175, 0.2)',
              },
            },
          }),
        },
      },
      MuiFab: {
        styleOverrides: {
          root: ({ theme }: { theme: Theme }) => ({
            boxShadow: '0 8px 28px rgba(0,0,0,0.35)',
            '&.MuiFab-primary': {
              backgroundColor: theme.palette.primary.main,
              color: theme.palette.primary.contrastText,
              '&:hover': {
                backgroundColor: theme.palette.primary.light,
              },
            },
          }),
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            color: 'text.secondary',
            '&:hover': {
              color: 'primary.main',
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
}

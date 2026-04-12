import type { PaletteOptions } from '@mui/material/styles';

/** Ljust läge — “Refined Expedition” / fine paper (LightMode.md). */
export const lightPalette: PaletteOptions = {
  mode: 'light',
  primary: {
    main: '#18301d',
    light: '#2e4632',
    dark: '#0f1f14',
    contrastText: '#fcf9f8',
  },
  secondary: {
    main: '#9f4215',
    light: '#c45a24',
    dark: '#6d2c0e',
    contrastText: '#fcf9f8',
  },
  background: {
    default: '#fcf9f8',
    paper: '#ffffff',
  },
  text: {
    primary: '#1b1c1c',
    secondary: 'rgba(27, 28, 28, 0.62)',
  },
  divider: 'rgba(195, 200, 192, 0.22)',
  error: {
    main: '#ba1a1a',
  },
  action: {
    hover: 'rgba(24, 48, 29, 0.06)',
    selected: 'rgba(24, 48, 29, 0.1)',
  },
};

/** Mörkt läge — “Digital Field Journal” (DarkMode.md). */
export const darkPalette: PaletteOptions = {
  mode: 'dark',
  primary: {
    main: '#a9d0af',
    light: '#c5e8ca',
    dark: '#26482f',
    contrastText: '#121414',
  },
  secondary: {
    main: '#e8a066',
    light: '#ffc896',
    dark: '#9f4215',
    contrastText: '#121414',
  },
  background: {
    default: '#121414',
    paper: '#1f2020',
  },
  text: {
    primary: '#e8e7e7',
    secondary: 'rgba(232, 231, 231, 0.62)',
  },
  divider: 'rgba(232, 231, 231, 0.1)',
  error: {
    main: '#ffb4ab',
  },
  action: {
    hover: 'rgba(169, 208, 175, 0.08)',
    selected: 'rgba(169, 208, 175, 0.16)',
  },
};

/**
 * Design tokens — speglar assets/LightMode.md & assets/DarkMode.md.
 * MUI-paletter + samma värden som CSS-variabler i app/globals.css.
 */
export type ColorScheme = 'light' | 'dark';

/** Namn på data-attribut på <html> (sätts av ColorModeProvider). */
export const COLOR_SCHEME_ATTR = 'data-color-scheme' as const;

export const storageKeys = {
  colorPreference: 'skitfiske-color-preference',
} as const;

export type ColorPreference = ColorScheme | 'system';

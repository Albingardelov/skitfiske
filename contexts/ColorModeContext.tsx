'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { createAppTheme } from '@/lib/theme/createAppTheme';
import {
  type ColorPreference,
  type ColorScheme,
  COLOR_SCHEME_ATTR,
  storageKeys,
} from '@/lib/theme/designTokens';

interface ColorModeContextValue {
  preference: ColorPreference;
  resolvedScheme: ColorScheme;
  setPreference: (p: ColorPreference) => void;
}

const ColorModeContext = createContext<ColorModeContextValue | null>(null);

export function useColorMode() {
  const ctx = useContext(ColorModeContext);
  if (!ctx) {
    throw new Error('useColorMode måste användas inom ColorModeProvider');
  }
  return ctx;
}

interface Props {
  children: React.ReactNode;
}

export function ColorModeProvider({ children }: Props) {
  const [preference, setPreferenceState] = useState<ColorPreference>('system');
  const [systemPrefersDark, setSystemPrefersDark] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKeys.colorPreference);
      if (raw === 'light' || raw === 'dark' || raw === 'system') {
        setPreferenceState(raw);
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    setSystemPrefersDark(mq.matches);
    const fn = () => setSystemPrefersDark(mq.matches);
    mq.addEventListener('change', fn);
    return () => mq.removeEventListener('change', fn);
  }, []);

  const resolvedScheme: ColorScheme = useMemo(() => {
    if (preference === 'light' || preference === 'dark') return preference;
    return systemPrefersDark ? 'dark' : 'light';
  }, [preference, systemPrefersDark]);

  useEffect(() => {
    document.documentElement.setAttribute(COLOR_SCHEME_ATTR, resolvedScheme);
  }, [resolvedScheme]);

  const setPreference = useCallback((p: ColorPreference) => {
    setPreferenceState(p);
    try {
      localStorage.setItem(storageKeys.colorPreference, p);
    } catch {
      /* ignore */
    }
  }, []);

  const theme = useMemo(() => createAppTheme(resolvedScheme), [resolvedScheme]);

  const value = useMemo(
    () => ({
      preference,
      resolvedScheme,
      setPreference,
    }),
    [preference, resolvedScheme, setPreference],
  );

  return (
    <ColorModeContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

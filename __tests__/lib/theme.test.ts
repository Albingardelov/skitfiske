import type { Theme } from '@mui/material/styles';
import { createAppTheme } from '@/lib/theme/createAppTheme';
import theme from '@/lib/theme';

describe('MUI theme', () => {
  it('default export är mörkt läge', () => {
    expect(theme.palette.mode).toBe('dark');
    expect(theme.palette.primary.main).toBe('#a9d0af');
  });

  it('mörkt läge har journal-ytor och sage primary', () => {
    const dark = createAppTheme('dark');
    expect(dark.palette.background.default).toBe('#121414');
    expect(dark.palette.secondary.main).toBe('#e8a066');
    expect(dark.palette.text.primary).toBe('#e8e7e7');
  });

  it('ljust läge har fine paper och skogsgrön primary', () => {
    const light = createAppTheme('light');
    expect(light.palette.mode).toBe('light');
    expect(light.palette.background.default).toBe('#fcf9f8');
    expect(light.palette.primary.main).toBe('#18301d');
    expect(light.palette.secondary.main).toBe('#9f4215');
  });

  it('har större bas-border-radius', () => {
    expect(theme.shape.borderRadius).toBe(12);
  });

  it('Button har bekväm minHeight', () => {
    const buttonRoot = theme.components?.MuiButton?.styleOverrides?.root as (a: {
      theme: Theme;
    }) => Record<string, unknown>;
    const styles = buttonRoot({ theme });
    expect(styles.minHeight).toBe(48);
  });
});

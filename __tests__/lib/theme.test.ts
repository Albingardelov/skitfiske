import theme from '@/lib/theme';

describe('MUI theme', () => {
  it('has muted brass as primary accent', () => {
    expect(theme.palette.primary.main).toBe('#c4a667');
  });

  it('has deep slate secondary for surfaces', () => {
    expect(theme.palette.secondary.main).toBe('#1e2a2e');
  });

  it('has charcoal background default', () => {
    expect(theme.palette.background.default).toBe('#0c0f14');
  });

  it('has soft off-white primary text', () => {
    expect(theme.palette.text.primary).toBe('#e6e8ea');
  });

  it('has tighter border radius', () => {
    expect(theme.shape.borderRadius).toBe(6);
  });

  it('Button has restrained minHeight', () => {
    const buttonRoot = theme.components?.MuiButton?.styleOverrides?.root as Record<string, unknown>;
    expect(buttonRoot.minHeight).toBe(44);
  });
});

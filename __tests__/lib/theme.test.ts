import theme from '@/lib/theme';

describe('MUI theme', () => {
  it('has Safety Orange as primary color', () => {
    expect(theme.palette.primary.main).toBe('#FB8500');
  });

  it('has Deep Forest Green as secondary color', () => {
    expect(theme.palette.secondary.main).toBe('#1B4332');
  });

  it('has Lake Blue as background default', () => {
    expect(theme.palette.background.default).toBe('#003566');
  });

  it('has white as primary text color', () => {
    expect(theme.palette.text.primary).toBe('#FFFFFF');
  });

  it('has borderRadius 12', () => {
    expect(theme.shape.borderRadius).toBe(12);
  });

  it('Button has minHeight 48', () => {
    const buttonRoot = theme.components?.MuiButton?.styleOverrides?.root as Record<string, unknown>;
    expect(buttonRoot.minHeight).toBe(48);
  });
});

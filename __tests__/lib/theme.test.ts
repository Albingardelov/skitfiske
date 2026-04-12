import theme from '@/lib/theme';

describe('MUI theme', () => {
  it('has teal primary UI accent', () => {
    expect(theme.palette.primary.main).toBe('#5a9e98');
  });

  it('has deep surface secondary', () => {
    expect(theme.palette.secondary.main).toBe('#152022');
  });

  it('has cool charcoal background default', () => {
    expect(theme.palette.background.default).toBe('#0a0f11');
  });

  it('has soft off-white primary text', () => {
    expect(theme.palette.text.primary).toBe('#e8eaec');
  });

  it('has larger base border radius', () => {
    expect(theme.shape.borderRadius).toBe(12);
  });

  it('Button has comfortable minHeight', () => {
    const buttonRoot = theme.components?.MuiButton?.styleOverrides?.root as Record<string, unknown>;
    expect(buttonRoot.minHeight).toBe(48);
  });
});

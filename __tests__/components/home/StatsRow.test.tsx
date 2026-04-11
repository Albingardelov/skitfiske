import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import StatsRow from '@/components/home/StatsRow';
import theme from '@/lib/theme';

function renderWithTheme(ui: React.ReactElement) {
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
}

describe('StatsRow', () => {
  it('renderar antal fångster', () => {
    renderWithTheme(<StatsRow count={5} heaviestKg={2.4} longestCm={58} />);
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('renderar tyngsta fisk i kg', () => {
    renderWithTheme(<StatsRow count={5} heaviestKg={2.4} longestCm={58} />);
    expect(screen.getByText('2.4 kg')).toBeInTheDocument();
  });

  it('renderar längsta fisk i cm', () => {
    renderWithTheme(<StatsRow count={5} heaviestKg={2.4} longestCm={58} />);
    expect(screen.getByText('58 cm')).toBeInTheDocument();
  });

  it('visar – för tyngsta och längsta när inga fångster', () => {
    renderWithTheme(<StatsRow count={0} heaviestKg={null} longestCm={null} />);
    expect(screen.getAllByText('–')).toHaveLength(2);
  });

  it('renderar labels', () => {
    renderWithTheme(<StatsRow count={0} heaviestKg={null} longestCm={null} />);
    expect(screen.getByText('Fångster')).toBeInTheDocument();
    expect(screen.getByText('Tyngsta')).toBeInTheDocument();
    expect(screen.getByText('Längsta')).toBeInTheDocument();
  });
});

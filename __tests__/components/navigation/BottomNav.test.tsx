import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import BottomNav from '@/components/navigation/BottomNav';
import theme from '@/lib/theme';
import { useRouter } from 'next/navigation';

jest.mock('next/navigation', () => ({
  usePathname: jest.fn().mockReturnValue('/hem'),
  useRouter: jest.fn().mockReturnValue({ push: jest.fn() }),
}));

function renderWithTheme(ui: React.ReactElement) {
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
}

let mockPush: jest.Mock;

beforeEach(() => {
  mockPush = jest.fn();
  (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
});

describe('BottomNav', () => {
  it('renders all four navigation items', () => {
    renderWithTheme(<BottomNav />);
    expect(screen.getByText('Hem')).toBeInTheDocument();
    expect(screen.getByText('Chatt')).toBeInTheDocument();
    expect(screen.getByText('Karta')).toBeInTheDocument();
    expect(screen.getByText('Logbok')).toBeInTheDocument();
  });

  it('navigates to /chatt when Chatt tab is clicked', async () => {
    renderWithTheme(<BottomNav />);
    await userEvent.click(screen.getByText('Chatt'));
    expect(mockPush).toHaveBeenCalledWith('/chatt');
  });

  it('navigates to /karta when Karta tab is clicked', async () => {
    renderWithTheme(<BottomNav />);
    await userEvent.click(screen.getByText('Karta'));
    expect(mockPush).toHaveBeenCalledWith('/karta');
  });

  it('navigates to /logbok when Logbok tab is clicked', async () => {
    renderWithTheme(<BottomNav />);
    await userEvent.click(screen.getByText('Logbok'));
    expect(mockPush).toHaveBeenCalledWith('/logbok');
  });
});

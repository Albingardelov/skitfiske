import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import CatchCard from '@/components/catch/CatchCard';
import theme from '@/lib/theme';
import type { Catch } from '@/types/catch';

const baseCatch: Catch = {
  id: '1',
  user_id: 'user1',
  full_name: 'Erik Johansson',
  species: 'Gädda',
  weight_kg: 2.4,
  length_cm: 58,
  location_text: 'Mälaren',
  lat: 59.33,
  lng: 18.07,
  image_url: null,
  caught_at: '2026-04-11T10:23:00Z',
  created_at: '2026-04-11T10:23:00Z',
};

function renderWithTheme(ui: React.ReactElement) {
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
}

describe('CatchCard', () => {
  it('renderar fiskart', () => {
    renderWithTheme(<CatchCard catch={baseCatch} />);
    expect(screen.getByText('Gädda')).toBeInTheDocument();
  });

  it('renderar vikt och längd', () => {
    renderWithTheme(<CatchCard catch={baseCatch} />);
    expect(screen.getByText(/2\.4.*kg/)).toBeInTheDocument();
    expect(screen.getByText(/58.*cm/)).toBeInTheDocument();
  });

  it('renderar år från caught_at', () => {
    renderWithTheme(<CatchCard catch={baseCatch} />);
    expect(screen.getByText(/2026/)).toBeInTheDocument();
  });

  it('renderar plats när location_text är satt', () => {
    renderWithTheme(<CatchCard catch={baseCatch} />);
    expect(screen.getByText('Mälaren')).toBeInTheDocument();
  });

  it('renderar inte plats när location_text är null', () => {
    const c = { ...baseCatch, location_text: null };
    renderWithTheme(<CatchCard catch={c} />);
    expect(screen.queryByText('Mälaren')).not.toBeInTheDocument();
  });

  it('renderar bild när image_url är satt', () => {
    const c = { ...baseCatch, image_url: 'https://example.com/fish.jpg' };
    renderWithTheme(<CatchCard catch={c} />);
    expect(screen.getByAltText('Fångstbild')).toBeInTheDocument();
  });

  it('renderar inte bild när image_url är null', () => {
    renderWithTheme(<CatchCard catch={baseCatch} />);
    expect(screen.queryByAltText('Fångstbild')).not.toBeInTheDocument();
  });
});

import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import CatchList from '@/components/catch/CatchList';
import theme from '@/lib/theme';
import type { Catch } from '@/types/catch';

const makeCatch = (id: string, species: string): Catch => ({
  id,
  user_id: 'user1',
  full_name: 'Erik Johansson',
  species,
  weight_kg: 1.0,
  length_cm: 40,
  location_text: null,
  lat: null,
  lng: null,
  sea_surface_temp_c: null,
  air_temp_c: null,
  image_url: null,
  caught_at: '2026-04-11T10:00:00Z',
  created_at: '2026-04-11T10:00:00Z',
  bait: null,
  club_id: null,
});

function renderWithTheme(ui: React.ReactElement) {
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
}

describe('CatchList', () => {
  it('visar tom-state när listan är tom', () => {
    renderWithTheme(<CatchList catches={[]} isLoading={false} />);
    expect(screen.getByText(/Inga fångster registrerade än/)).toBeInTheDocument();
    expect(screen.getByText('Tomt just nu')).toBeInTheDocument();
  });

  it('renderar ett kort per fångst', () => {
    const catches = [makeCatch('1', 'Gädda'), makeCatch('2', 'Abborre')];
    renderWithTheme(<CatchList catches={catches} isLoading={false} />);
    expect(screen.getByText('Gädda')).toBeInTheDocument();
    expect(screen.getByText('Abborre')).toBeInTheDocument();
  });

  it('visar laddningsindikator när isLoading är true', () => {
    renderWithTheme(<CatchList catches={[]} isLoading={true} />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });
});

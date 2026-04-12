import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import CatchCard from '@/components/catch/CatchCard';
import type { Catch } from '@/types/catch';

interface Props {
  catches: Catch[];
  isLoading: boolean;
  cardVariant?: 'default' | 'light' | 'logbook';
}

export default function CatchList({ catches, isLoading, cardVariant = 'default' }: Props) {
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', pt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (catches.length === 0) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          pt: 6,
          px: 3,
          textAlign: 'center',
        }}
      >
        <Typography
          variant="overline"
          sx={{ color: 'text.secondary', fontWeight: 600, letterSpacing: '0.12em', mb: 1 }}
        >
          Tomt just nu
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Inga fångster registrerade än. Lägg till en med plusknappen.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ overflowY: 'auto', flex: 1, minHeight: 0, py: 1 }}>
      {catches.map((c) => (
        <CatchCard key={c.id} catch={c} variant={cardVariant} />
      ))}
    </Box>
  );
}

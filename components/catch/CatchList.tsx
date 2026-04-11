import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import CatchCard from '@/components/catch/CatchCard';
import type { Catch } from '@/types/catch';

interface Props {
  catches: Catch[];
  isLoading: boolean;
}

export default function CatchList({ catches, isLoading }: Props) {
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', pt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (catches.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', pt: 4 }}>
        <Typography color="text.secondary">Inga fångster registrerade än.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ overflowY: 'auto', flex: 1, py: 1 }}>
      {catches.map((c) => (
        <CatchCard key={c.id} catch={c} />
      ))}
    </Box>
  );
}

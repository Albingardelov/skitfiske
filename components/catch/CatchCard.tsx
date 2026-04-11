import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type { Catch } from '@/types/catch';

interface Props {
  catch: Catch;
}

export default function CatchCard({ catch: c }: Props) {
  const date = new Date(c.caught_at).toLocaleString('sv-SE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <Card sx={{ mb: 1.5, mx: 2, bgcolor: 'background.paper' }}>
      <CardContent sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle1" fontWeight={700}>
            {c.species}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {c.weight_kg} kg · {c.length_cm} cm
          </Typography>
          {c.location_text && (
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {c.location_text}
            </Typography>
          )}
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {date}
          </Typography>
        </Box>
        {c.image_url && (
          <Box
            component="img"
            src={c.image_url}
            alt="Fångstbild"
            sx={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 1 }}
          />
        )}
      </CardContent>
    </Card>
  );
}

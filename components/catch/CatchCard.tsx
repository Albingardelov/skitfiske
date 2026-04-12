import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import NextLink from 'next/link';
import { hemTheme } from '@/lib/hemTheme';
import type { Catch } from '@/types/catch';

interface Props {
  catch: Catch;
  variant?: 'default' | 'light';
}

export default function CatchCard({ catch: c, variant = 'default' }: Props) {
  const light = variant === 'light';

  const date = new Date(c.caught_at).toLocaleString('sv-SE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <Card
      sx={{
        mb: 2,
        mx: 2,
        bgcolor: light ? '#fff' : 'background.paper',
        overflow: 'hidden',
        borderRadius: light ? '18px' : undefined,
        boxShadow: light ? '0 4px 24px rgba(27, 48, 34, 0.08)' : undefined,
        color: light ? hemTheme.ink : 'inherit',
      }}
    >
      <CardActionArea component={NextLink} href={`/logbok/${c.id}`}>
        {c.image_url ? (
          <Box
            component="img"
            src={c.image_url}
            alt={`Fångst: ${c.species}`}
            sx={{
              width: '100%',
              aspectRatio: '16 / 9',
              objectFit: 'cover',
              display: 'block',
            }}
          />
        ) : (
          <Box
            sx={{
              width: '100%',
              aspectRatio: '16 / 9',
              bgcolor: light ? '#E8E4DC' : 'rgba(255,255,255,0.04)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderBottom: light ? 'none' : '1px solid',
              borderColor: 'divider',
            }}
          >
            <Typography
              variant="caption"
              sx={{
                fontWeight: 600,
                color: light ? hemTheme.muted : 'text.secondary',
              }}
            >
              Ingen bild
            </Typography>
          </Box>
        )}
        <CardContent sx={{ pt: 2, pb: 2, px: 2 }}>
          <Typography
            variant="h6"
            sx={{
              fontFamily: light
                ? 'var(--font-display-editorial), Georgia, serif'
                : 'var(--font-serif), Georgia, serif',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              lineHeight: 1.25,
              mb: 0.75,
              color: light ? hemTheme.ink : 'inherit',
            }}
          >
            {c.species}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: light ? hemTheme.muted : 'text.secondary',
              fontFeatureSettings: '"tnum"',
              fontWeight: 500,
              mb: 0.5,
            }}
          >
            {c.weight_kg} kg · {c.length_cm} cm
          </Typography>
          {c.location_text && (
            <Typography variant="body2" sx={{ color: light ? hemTheme.muted : 'text.secondary', mb: 0.5 }}>
              {c.location_text}
            </Typography>
          )}
          <Typography
            variant="caption"
            sx={{
              color: light ? hemTheme.muted : 'text.secondary',
              opacity: light ? 1 : 0.85,
            }}
          >
            {date}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

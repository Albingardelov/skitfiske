import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
import NextLink from 'next/link';
import { MapPin } from 'lucide-react';
import { hemTheme } from '@/lib/hemTheme';
import { expedition } from '@/lib/theme/expeditionTokens';
import { scientificNameForSpecies } from '@/lib/speciesLatin';
import { weatherSummarySv } from '@/lib/weather/format';
import type { Catch } from '@/types/catch';

interface Props {
  catch: Catch;
  variant?: 'default' | 'light' | 'logbook';
}

function formatLogbookDate(iso: string) {
  const d = new Date(iso);
  const s = d.toLocaleDateString('sv-SE', { day: 'numeric', month: 'short', year: 'numeric' });
  return s.replace(/\./g, '').toUpperCase();
}

function formatWeightSv(kg: number) {
  return `${new Intl.NumberFormat('sv-SE', { minimumFractionDigits: 0, maximumFractionDigits: 1 }).format(kg)} kg`;
}

function LogbookCatchCard({ c }: { c: Catch }) {
  const theme = useTheme();
  const isLight = theme.palette.mode === 'light';
  const forest = isLight ? expedition.forest : theme.palette.primary.dark;
  const rust = isLight ? expedition.rust : theme.palette.secondary.main;
  const latin = scientificNameForSpecies(c.species);
  const weatherLine = weatherSummarySv({ sea: c.sea_surface_temp_c, air: c.air_temp_c });

  return (
    <Card
      sx={{
        mb: 2,
        mx: 2,
        overflow: 'hidden',
        borderRadius: '16px',
        bgcolor: 'background.paper',
        boxShadow: isLight ? '0 4px 20px rgba(27, 48, 34, 0.07)' : '0 4px 20px rgba(0,0,0,0.25)',
      }}
    >
      <CardActionArea component={NextLink} href={`/logbok/${c.id}`}>
        <Box sx={{ position: 'relative' }}>
          {c.image_url ? (
            <Box
              component="img"
              src={c.image_url}
              alt={`Fångst: ${c.species}`}
              sx={{
                width: '100%',
                aspectRatio: '4 / 3',
                objectFit: 'cover',
                display: 'block',
              }}
            />
          ) : (
            <Box
              sx={{
                width: '100%',
                aspectRatio: '4 / 3',
                bgcolor: isLight ? '#E8E4DC' : 'rgba(255,255,255,0.06)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                Ingen bild
              </Typography>
            </Box>
          )}
          <Box
            sx={{
              position: 'absolute',
              top: 10,
              left: 10,
              px: 1.25,
              py: 0.5,
              borderRadius: 999,
              bgcolor: alpha(forest, 0.92),
              backdropFilter: 'blur(6px)',
            }}
          >
            <Typography
              sx={{
                fontFamily: 'var(--font-newsreader), Georgia, serif',
                fontWeight: 700,
                fontSize: '0.9rem',
                color: '#fff',
                lineHeight: 1.2,
              }}
            >
              {formatWeightSv(c.weight_kg)}
            </Typography>
          </Box>
        </Box>
        <CardContent sx={{ pt: 1.75, pb: 1.75, px: 2, bgcolor: 'background.paper' }}>
          <Box
            sx={{
              display: 'flex',
              gap: 1,
              alignItems: 'flex-start',
              mb: 1,
            }}
          >
            <Typography
              sx={{
                flex: 1,
                minWidth: 0,
                fontFamily: 'var(--font-newsreader), Georgia, serif',
                fontWeight: 700,
                fontSize: '1.05rem',
                letterSpacing: '-0.02em',
                lineHeight: 1.25,
                color: 'text.primary',
              }}
            >
              {c.species}
            </Typography>
            <Box sx={{ textAlign: 'right', flexShrink: 0, maxWidth: '42%' }}>
              <Typography
                sx={{
                  fontFamily: 'var(--font-work), var(--font-sans), system-ui, sans-serif',
                  fontSize: '0.65rem',
                  fontWeight: 600,
                  letterSpacing: '0.06em',
                  color: 'text.secondary',
                  lineHeight: 1.3,
                }}
              >
                {formatLogbookDate(c.caught_at)}
              </Typography>
              {latin && (
                <Typography
                  sx={{
                    fontFamily: 'var(--font-newsreader), Georgia, serif',
                    fontSize: '0.72rem',
                    fontStyle: 'italic',
                    color: 'text.secondary',
                    mt: 0.25,
                    lineHeight: 1.3,
                  }}
                >
                  {latin}
                </Typography>
              )}
            </Box>
          </Box>
          <Typography
            sx={{
              fontFamily: 'var(--font-work), var(--font-sans), system-ui, sans-serif',
              fontSize: '0.78rem',
              color: 'text.secondary',
              mb: c.location_text ? 0.75 : 0,
              fontFeatureSettings: '"tnum"',
            }}
          >
            {c.length_cm} cm
          </Typography>
          {c.location_text && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <MapPin size={16} strokeWidth={2} color={rust} aria-hidden />
              <Typography
                sx={{
                  fontFamily: 'var(--font-work), var(--font-sans), system-ui, sans-serif',
                  fontSize: '0.8125rem',
                  fontWeight: 500,
                  color: rust,
                }}
              >
                {c.location_text}
              </Typography>
            </Box>
          )}
          {weatherLine && (
            <Typography
              sx={{
                fontFamily: 'var(--font-work), var(--font-sans), system-ui, sans-serif',
                fontSize: '0.72rem',
                color: 'text.secondary',
                mt: c.location_text ? 0.5 : 0,
                fontFeatureSettings: '"tnum"',
              }}
            >
              {weatherLine}
            </Typography>
          )}
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

export default function CatchCard({ catch: c, variant = 'default' }: Props) {
  if (variant === 'logbook') {
    return <LogbookCatchCard c={c} />;
  }

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

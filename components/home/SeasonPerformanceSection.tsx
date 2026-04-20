'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import { hemTheme } from '@/lib/hemTheme';
import type { Catch } from '@/types/catch';
import { monthOverMonthTrendLabel, heaviestCatch } from '@/lib/catchStats';
import { formatWeightG } from '@/lib/formatWeight';

interface Props {
  catches: Catch[];
}

export default function SeasonPerformanceSection({ catches }: Props) {
  const theme = useTheme();
  const isLight = theme.palette.mode === 'light';
  const accentRed = hemTheme.rust;
  const heavy = heaviestCatch(catches);
  const trend = monthOverMonthTrendLabel(catches);

  const cardSx = {
    borderRadius: '18px',
    p: 2,
    boxShadow: isLight ? '0 4px 18px rgba(27, 48, 34, 0.06)' : '0 4px 18px rgba(0,0,0,0.22)',
  };

  const heavyDate = heavy
    ? new Date(heavy.caught_at).toLocaleDateString('sv-SE', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : null;

  return (
    <Box sx={{ px: 2, mt: 2.5, mb: 0.5 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 2 }}>
        <Box
          sx={{
            width: 26,
            height: 4,
            borderRadius: 2,
            bgcolor: accentRed,
            flexShrink: 0,
          }}
        />
        <Typography
          component="h2"
          sx={{
            fontFamily: 'var(--font-newsreader), Georgia, serif',
            fontWeight: 700,
            fontSize: '1.2rem',
            letterSpacing: '-0.02em',
            color: 'text.primary',
          }}
        >
          Säsongsstatistik
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <Box sx={{ ...cardSx, bgcolor: isLight ? '#fff' : 'background.paper' }}>
          <Typography
            sx={{
              fontFamily: 'var(--font-work), var(--font-sans), system-ui, sans-serif',
              fontSize: '0.7rem',
              fontWeight: 600,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'text.secondary',
              mb: 0.75,
            }}
          >
            Totalt antal
          </Typography>
          <Typography
            sx={{
              fontFamily: 'var(--font-newsreader), Georgia, serif',
              fontWeight: 700,
              fontSize: '2rem',
              lineHeight: 1.1,
              fontFeatureSettings: '"tnum"',
              color: 'text.primary',
            }}
          >
            {catches.length}
          </Typography>
          {trend && (
            <Typography
              sx={{
                mt: 1,
                fontFamily: 'var(--font-work), var(--font-sans), sans-serif',
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: accentRed,
              }}
            >
              {trend}
            </Typography>
          )}
        </Box>

        <Box sx={{ ...cardSx, bgcolor: isLight ? '#fff' : 'background.paper' }}>
          <Typography
            sx={{
              fontFamily: 'var(--font-work), var(--font-sans), system-ui, sans-serif',
              fontSize: '0.7rem',
              fontWeight: 600,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'text.secondary',
              mb: 0.75,
            }}
          >
            Tyngsta fångst
          </Typography>
          <Typography
            sx={{
              fontFamily: 'var(--font-newsreader), Georgia, serif',
              fontWeight: 700,
              fontSize: '1.75rem',
              lineHeight: 1.15,
              fontFeatureSettings: '"tnum"',
              color: 'text.primary',
            }}
          >
            {heavy ? formatWeightG(heavy.weight_kg) : '–'}
          </Typography>
          {heavy && (
            <Typography
              sx={{
                mt: 0.75,
                fontFamily: 'var(--font-work), var(--font-sans), sans-serif',
                fontSize: '0.8125rem',
                color: 'text.secondary',
              }}
            >
              {heavy.species}
              {heavyDate ? ` · ${heavyDate}` : ''}
            </Typography>
          )}
        </Box>

        <Box
          sx={{
            ...cardSx,
            bgcolor: isLight ? hemTheme.cardTan : 'rgba(169, 208, 175, 0.12)',
          }}
        >
          <Typography
            sx={{
              fontFamily: 'var(--font-work), var(--font-sans), system-ui, sans-serif',
              fontSize: '0.7rem',
              fontWeight: 600,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'text.secondary',
              mb: 0.75,
            }}
          >
            Klubbplats
          </Typography>
          <Typography
            sx={{
              fontFamily: 'var(--font-newsreader), Georgia, serif',
              fontWeight: 700,
              fontSize: '1.75rem',
              lineHeight: 1.15,
              color: 'text.primary',
            }}
          >
            —
          </Typography>
          <Typography
            sx={{
              mt: 0.75,
              fontFamily: 'var(--font-work), var(--font-sans), sans-serif',
              fontSize: '0.8125rem',
              color: 'text.secondary',
            }}
          >
            Fortsätt logga fångster för att synas i klubbens ranking.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

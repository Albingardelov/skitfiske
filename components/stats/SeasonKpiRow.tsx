'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import type { PersonalStats } from '@/lib/stats/index';

interface Props {
  stats: PersonalStats;
}

export default function SeasonKpiRow({ stats }: Props) {
  const theme = useTheme();
  const isLight = theme.palette.mode === 'light';

  const items = [
    { label: 'Fångster', value: String(stats.seasonCatchCount), sub: 'i år' },
    {
      label: 'Tyngsta',
      value: stats.heaviestCatch ? `${stats.heaviestCatch.weightKg * 1000} g` : '–',
      sub: stats.heaviestCatch?.species ?? '',
    },
    { label: 'Toppbete', value: stats.topBait ?? '–', sub: 'flest fångster' },
  ];

  return (
    <Box sx={{ display: 'flex', gap: 1, px: 2, pt: 2.5 }}>
      {items.map((item) => (
        <Box
          key={item.label}
          sx={{
            flex: 1,
            bgcolor: isLight ? '#fff' : 'background.paper',
            borderRadius: 2,
            p: 1.5,
            boxShadow: isLight ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
            border: isLight ? 'none' : '1px solid',
            borderColor: 'divider',
          }}
        >
          <Typography
            sx={{
              fontFamily: 'var(--font-work), var(--font-sans), sans-serif',
              fontSize: '0.625rem',
              fontWeight: 700,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'text.secondary',
              mb: 0.5,
            }}
          >
            {item.label}
          </Typography>
          <Typography
            sx={{
              fontFamily: 'var(--font-newsreader), Georgia, serif',
              fontWeight: 700,
              fontSize: '1.2rem',
              lineHeight: 1.1,
              color: 'text.primary',
              wordBreak: 'break-word',
            }}
          >
            {item.value}
          </Typography>
          {item.sub && (
            <Typography
              sx={{
                fontFamily: 'var(--font-work), var(--font-sans), sans-serif',
                fontSize: '0.7rem',
                color: 'text.secondary',
                mt: 0.25,
              }}
            >
              {item.sub}
            </Typography>
          )}
        </Box>
      ))}
    </Box>
  );
}

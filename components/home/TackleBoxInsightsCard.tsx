'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import { Sailboat } from 'lucide-react';
import { useTheme } from '@mui/material/styles';
import { hemTheme } from '@/lib/hemTheme';

export default function TackleBoxInsightsCard() {
  const theme = useTheme();
  const isLight = theme.palette.mode === 'light';

  return (
    <Box
      sx={{
        mx: 2,
        mt: 2.5,
        p: 2,
        borderRadius: '18px',
        position: 'relative',
        overflow: 'hidden',
        bgcolor: isLight ? hemTheme.cardGrey : 'rgba(255,255,255,0.06)',
        boxShadow: isLight ? '0 4px 18px rgba(27, 48, 34, 0.05)' : 'none',
      }}
    >
      <Typography
        sx={{
          fontFamily: 'var(--font-newsreader), Georgia, serif',
          fontWeight: 700,
          fontSize: '1.05rem',
          color: 'text.primary',
          mb: 1,
        }}
      >
        Utrustningsläge
      </Typography>
      <Typography
        sx={{
          fontFamily: 'var(--font-work), var(--font-sans), sans-serif',
          fontSize: '0.875rem',
          color: 'text.secondary',
          mb: 1.5,
          maxWidth: '92%',
        }}
      >
        Utgå från vatten du fiskar mest — välj fokus för bättre tips framöver.
      </Typography>
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        <Chip
          label="Sötvatten"
          size="small"
          sx={{
            fontFamily: 'var(--font-work), var(--font-sans), sans-serif',
            fontWeight: 600,
            fontSize: '0.7rem',
            bgcolor: isLight ? 'rgba(27, 48, 34, 0.08)' : 'rgba(169,208,175,0.15)',
          }}
        />
        <Chip
          label="Saltvatten"
          size="small"
          sx={{
            fontFamily: 'var(--font-work), var(--font-sans), sans-serif',
            fontWeight: 600,
            fontSize: '0.7rem',
            bgcolor: isLight ? 'rgba(27, 48, 34, 0.06)' : 'rgba(255,255,255,0.06)',
          }}
        />
      </Box>
      <Sailboat
        size={120}
        strokeWidth={1}
        aria-hidden
        style={{
          position: 'absolute',
          right: -16,
          bottom: -24,
          opacity: isLight ? 0.07 : 0.12,
          color: hemTheme.forest,
        }}
      />
    </Box>
  );
}

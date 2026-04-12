'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { Bell } from 'lucide-react';
import { useTheme } from '@mui/material/styles';
import { hemTheme } from '@/lib/hemTheme';

export default function UpcomingHatchCard() {
  const theme = useTheme();
  const isLight = theme.palette.mode === 'light';
  const red = hemTheme.rust;

  return (
    <Box
      sx={{
        mx: 2,
        mt: 2,
        mb: 1,
        p: 2,
        borderRadius: '18px',
        border: '2px solid',
        borderColor: red,
        bgcolor: isLight ? '#fff' : 'background.paper',
        boxShadow: isLight ? '0 4px 18px rgba(139, 46, 46, 0.06)' : 'none',
      }}
    >
      <Typography
        sx={{
          fontFamily: 'var(--font-newsreader), Georgia, serif',
          fontWeight: 700,
          fontSize: '1.05rem',
          color: red,
          mb: 1,
        }}
      >
        Kommande kläckning
      </Typography>
      <Typography
        sx={{
          fontFamily: 'var(--font-work), var(--font-sans), sans-serif',
          fontSize: '0.875rem',
          color: 'text.secondary',
          lineHeight: 1.5,
          mb: 2,
        }}
      >
        Dagländeslända väntas inom{' '}
        <Box component="span" sx={{ fontWeight: 700, color: 'text.primary' }}>
          48 timmar
        </Box>{' '}
        vid många kustvatten. Planera gärna kvällspasset efter väder och vind.
      </Typography>
      <Button
        variant="outlined"
        startIcon={<Bell size={18} />}
        sx={{
          borderRadius: 999,
          px: 2.5,
          py: 1,
          textTransform: 'none',
          fontFamily: 'var(--font-work), var(--font-sans), sans-serif',
          fontWeight: 700,
          fontSize: '0.75rem',
          letterSpacing: '0.06em',
          color: red,
          borderColor: red,
          bgcolor: isLight ? hemTheme.cardTan : 'transparent',
          '&:hover': {
            borderColor: red,
            bgcolor: isLight ? 'rgba(242, 230, 207, 0.85)' : 'rgba(255,255,255,0.06)',
          },
        }}
      >
        Påminn mig
      </Button>
    </Box>
  );
}

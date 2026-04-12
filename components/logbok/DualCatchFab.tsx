'use client';

import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Typography from '@mui/material/Typography';
import { Plus } from 'lucide-react';
import { useTheme } from '@mui/material/styles';
import { expedition } from '@/lib/theme/expeditionTokens';

export default function DualCatchFab() {
  const router = useRouter();
  const theme = useTheme();
  const isLight = theme.palette.mode === 'light';
  const rust = isLight ? expedition.rust : theme.palette.secondary.main;
  const forest = isLight ? expedition.forest : theme.palette.primary.dark;

  function go() {
    router.push('/logbok/ny');
  }

  return (
    <Box
      sx={{
        position: 'fixed',
        right: 16,
        bottom: 'calc(96px + env(safe-area-inset-bottom, 0px))',
        zIndex: 1050,
        display: 'flex',
        alignItems: 'stretch',
        borderRadius: 2,
        overflow: 'hidden',
        boxShadow: '0 10px 28px rgba(0,0,0,0.18)',
      }}
    >
      <ButtonBase
        onClick={go}
        aria-label="Ny fångst"
        sx={{
          px: 2,
          py: 1.25,
          bgcolor: rust,
          color: '#fff',
          borderRadius: 0,
          justifyContent: 'center',
        }}
      >
        <Typography
          sx={{
            fontFamily: 'var(--font-work), var(--font-sans), system-ui, sans-serif',
            fontWeight: 700,
            fontSize: '0.7rem',
            letterSpacing: '0.1em',
          }}
        >
          NY FÅNGST
        </Typography>
      </ButtonBase>
      <ButtonBase
        onClick={go}
        aria-label="Lägg till fångst"
        sx={{
          width: 52,
          minWidth: 52,
          bgcolor: forest,
          color: '#fff',
          borderRadius: 0,
        }}
      >
        <Plus size={26} strokeWidth={2.5} />
      </ButtonBase>
    </Box>
  );
}

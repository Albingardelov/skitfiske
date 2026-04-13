'use client';

import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import { expedition } from '@/lib/theme/expeditionTokens';

interface Props {
  value: 'logg' | 'statistik';
  onChange: (v: 'logg' | 'statistik') => void;
}

export default function LogbokTabs({ value, onChange }: Props) {
  const theme = useTheme();
  const isLight = theme.palette.mode === 'light';
  const activeColor = isLight ? expedition.forest : theme.palette.primary.main;

  return (
    <Box
      sx={{
        display: 'flex',
        borderBottom: '1px solid',
        borderColor: 'divider',
        flexShrink: 0,
        bgcolor: isLight ? expedition.canvasWarm : 'background.default',
      }}
    >
      {(['logg', 'statistik'] as const).map((tab) => {
        const active = value === tab;
        return (
          <ButtonBase
            key={tab}
            onClick={() => onChange(tab)}
            sx={{
              flex: 1,
              py: 1.5,
              borderBottom: '2px solid',
              borderColor: active ? activeColor : 'transparent',
              color: active ? activeColor : 'text.secondary',
              transition: 'color 0.15s, border-color 0.15s',
            }}
          >
            <Typography
              sx={{
                fontFamily: 'var(--font-work), var(--font-sans), sans-serif',
                fontWeight: active ? 700 : 500,
                fontSize: '0.875rem',
                letterSpacing: '0.02em',
              }}
            >
              {tab === 'logg' ? 'Logg' : 'Statistik'}
            </Typography>
          </ButtonBase>
        );
      })}
    </Box>
  );
}

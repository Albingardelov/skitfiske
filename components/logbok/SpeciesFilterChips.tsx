'use client';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import { useTheme } from '@mui/material/styles';
import { expedition } from '@/lib/theme/expeditionTokens';

interface Props {
  species: string[];
  active: string | null;
  onChange: (species: string | null) => void;
}

export default function SpeciesFilterChips({ species, active, onChange }: Props) {
  const theme = useTheme();
  const isLight = theme.palette.mode === 'light';

  if (species.length === 0) return null;

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 1,
        overflowX: 'auto',
        flexShrink: 0,
        px: 2,
        py: 1,
        scrollbarWidth: 'none',
        '&::-webkit-scrollbar': { display: 'none' },
        bgcolor: isLight ? expedition.canvasWarm : 'background.default',
      }}
    >
      <Chip
        label="Alla arter"
        onClick={() => onChange(null)}
        sx={{
          flexShrink: 0,
          fontFamily: 'var(--font-work), var(--font-sans), system-ui, sans-serif',
          fontWeight: 600,
          fontSize: '0.75rem',
          bgcolor:
            active === null
              ? isLight
                ? expedition.tanChip
                : 'rgba(169, 208, 175, 0.2)'
              : isLight
                ? expedition.segmentInactive
                : 'rgba(255,255,255,0.06)',
          color: 'text.primary',
          border: 'none',
          '&:hover': { opacity: 0.92 },
        }}
      />
      {species.map((s) => {
        const selected = active === s;
        return (
          <Chip
            key={s}
            label={s}
            onClick={() => onChange(s)}
            sx={{
              flexShrink: 0,
              fontFamily: 'var(--font-work), var(--font-sans), system-ui, sans-serif',
              fontWeight: 600,
              fontSize: '0.75rem',
              bgcolor: selected
                ? isLight
                  ? expedition.tanChip
                  : 'rgba(169, 208, 175, 0.2)'
                : isLight
                  ? expedition.segmentInactive
                  : 'rgba(255,255,255,0.06)',
              color: 'text.primary',
              border: 'none',
              '&:hover': { opacity: 0.92 },
            }}
          />
        );
      })}
    </Box>
  );
}

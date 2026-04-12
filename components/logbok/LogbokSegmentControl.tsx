'use client';

import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import { expedition } from '@/lib/theme/expeditionTokens';

const SEGMENTS = [
  { title: 'Mina fångster', subtitle: 'PERSONAL LOG' },
  { title: 'Klubbflöde', subtitle: 'COMMUNITY' },
] as const;

interface Props {
  value: number;
  onChange: (index: number) => void;
}

export default function LogbokSegmentControl({ value, onChange }: Props) {
  const theme = useTheme();
  const isLight = theme.palette.mode === 'light';
  const activeBg = isLight ? expedition.forest : theme.palette.primary.dark;
  const inactiveBg = isLight ? expedition.segmentInactive : 'rgba(255,255,255,0.06)';

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 1,
        px: 2,
        py: 1.5,
        flexShrink: 0,
        bgcolor: isLight ? expedition.canvasWarm : 'background.default',
      }}
    >
      {SEGMENTS.map((seg, index) => {
        const active = value === index;
        return (
          <ButtonBase
            key={seg.title}
            onClick={() => onChange(index)}
            focusRipple
            sx={{
              display: 'block',
              textAlign: 'center',
              py: 1.75,
              px: 1,
              borderRadius: 2,
              bgcolor: active ? activeBg : inactiveBg,
              color: active ? '#fff' : 'text.primary',
              transition: 'background-color 0.2s ease, color 0.2s ease',
            }}
          >
            <Typography
              sx={{
                fontFamily: 'var(--font-newsreader), Georgia, serif',
                fontWeight: 700,
                fontSize: '0.95rem',
                lineHeight: 1.25,
                display: 'block',
              }}
            >
              {seg.title}
            </Typography>
            <Typography
              sx={{
                fontFamily: 'var(--font-work), var(--font-sans), system-ui, sans-serif',
                fontSize: '0.65rem',
                fontWeight: 600,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                mt: 0.35,
                opacity: active ? 0.85 : 0.55,
                display: 'block',
              }}
            >
              {seg.subtitle}
            </Typography>
          </ButtonBase>
        );
      })}
    </Box>
  );
}

// components/home/StatsRow.tsx
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { hemTheme } from '@/lib/hemTheme';
import { formatWeightG } from '@/lib/formatWeight';

interface Props {
  count: number;
  heaviestKg: number | null;
  longestCm: number | null;
  /** `light` = redaktionell hem-sida (cream bakgrund). */
  variant?: 'default' | 'light';
}

interface StatBoxProps {
  label: string;
  value: string;
  variant: 'default' | 'light';
}

function StatBox({ label, value, variant }: StatBoxProps) {
  const light = variant === 'light';
  return (
    <Box sx={{ flex: 1, textAlign: 'center', px: 0.5 }}>
      <Typography
        variant="h5"
        sx={{
          fontFamily: light
            ? 'var(--font-display-editorial), Georgia, serif'
            : 'var(--font-serif), Georgia, serif',
          fontWeight: 700,
          fontFeatureSettings: '"tnum"',
          color: light ? hemTheme.ink : 'inherit',
        }}
      >
        {value}
      </Typography>
      <Typography
        variant="caption"
        sx={{
          color: light ? hemTheme.muted : 'text.secondary',
          textTransform: 'uppercase',
          fontWeight: 600,
          letterSpacing: '0.08em',
          display: 'block',
          mt: 0.5,
        }}
      >
        {label}
      </Typography>
    </Box>
  );
}

export default function StatsRow({ count, heaviestKg, longestCm, variant = 'default' }: Props) {
  const light = variant === 'light';

  return (
    <Box
      sx={{
        display: 'flex',
        mx: 2,
        py: light ? 2.5 : 2.25,
        px: light ? 1.5 : 1,
        bgcolor: light ? hemTheme.cardGrey : 'background.paper',
        borderRadius: light ? '18px' : 3,
        border: 'none',
        boxShadow: light
          ? '0 4px 20px rgba(27, 48, 34, 0.08)'
          : '0 4px 20px rgba(0,0,0,0.22)',
        mb: 2,
      }}
    >
      <StatBox label="Fångster" value={String(count)} variant={variant} />
      <StatBox label="Tyngsta" value={heaviestKg !== null ? formatWeightG(heaviestKg) : '–'} variant={variant} />
      <StatBox label="Längsta" value={longestCm !== null ? `${longestCm} cm` : '–'} variant={variant} />
    </Box>
  );
}

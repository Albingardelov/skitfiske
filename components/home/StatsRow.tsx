// components/home/StatsRow.tsx
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

interface Props {
  count: number;
  heaviestKg: number | null;
  longestCm: number | null;
}

interface StatBoxProps {
  label: string;
  value: string;
}

function StatBox({ label, value }: StatBoxProps) {
  return (
    <Box sx={{ flex: 1, textAlign: 'center', px: 0.5 }}>
      <Typography
        variant="h5"
        sx={{
          fontFamily: 'var(--font-serif), Georgia, serif',
          fontWeight: 600,
          fontFeatureSettings: '"tnum"',
        }}
      >
        {value}
      </Typography>
      <Typography
        variant="caption"
        sx={{
          color: 'text.secondary',
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

export default function StatsRow({ count, heaviestKg, longestCm }: Props) {
  return (
    <Box
      sx={{
        display: 'flex',
        mx: 2,
        py: 2.25,
        px: 1,
        bgcolor: 'background.paper',
        borderRadius: 3,
        border: 'none',
        boxShadow: '0 4px 20px rgba(0,0,0,0.22)',
        mb: 2,
      }}
    >
      <StatBox label="Fångster" value={String(count)} />
      <StatBox label="Tyngsta" value={heaviestKg !== null ? `${heaviestKg} kg` : '–'} />
      <StatBox label="Längsta" value={longestCm !== null ? `${longestCm} cm` : '–'} />
    </Box>
  );
}

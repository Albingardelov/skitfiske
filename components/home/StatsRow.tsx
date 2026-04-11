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
    <Box sx={{ flex: 1, textAlign: 'center' }}>
      <Typography variant="h5" sx={{ fontWeight: 700 }}>
        {value}
      </Typography>
      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
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
        py: 2,
        px: 1,
        bgcolor: 'background.paper',
        borderRadius: 2,
        mb: 2,
      }}
    >
      <StatBox label="Fångster" value={String(count)} />
      <StatBox label="Tyngsta" value={heaviestKg !== null ? `${heaviestKg} kg` : '–'} />
      <StatBox label="Längsta" value={longestCm !== null ? `${longestCm} cm` : '–'} />
    </Box>
  );
}

'use client';

import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import ButtonBase from '@mui/material/ButtonBase';
import { useTheme } from '@mui/material/styles';
import { ChevronDown } from 'lucide-react';
import type { SpeciesRecord } from '@/lib/stats/index';

interface Props {
  records: SpeciesRecord[];
}

export default function SpeciesRecordList({ records }: Props) {
  const theme = useTheme();
  const isLight = theme.palette.mode === 'light';
  const [showAll, setShowAll] = useState(false);

  const PAGE = 8;
  const visible = showAll ? records : records.slice(0, PAGE);

  if (records.length === 0) return null;

  return (
    <Box sx={{ px: 2, mt: 2.5 }}>
      <Typography
        sx={{
          fontFamily: 'var(--font-newsreader), Georgia, serif',
          fontWeight: 700,
          fontSize: '1.1rem',
          color: 'text.primary',
          mb: 1,
        }}
      >
        Rekord per art
      </Typography>
      <Box sx={{ borderRadius: 2, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
        {visible.map((rec, i) => (
          <Box
            key={rec.species}
            sx={{
              display: 'grid',
              gridTemplateColumns: '1fr auto auto auto',
              alignItems: 'center',
              gap: 2,
              px: 2,
              py: 1.25,
              bgcolor:
                i % 2 === 0
                  ? isLight ? '#fff' : 'background.paper'
                  : isLight ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.02)',
              borderBottom: i < visible.length - 1 ? '1px solid' : 'none',
              borderColor: 'divider',
            }}
          >
            <Typography
              sx={{
                fontFamily: 'var(--font-work), var(--font-sans), sans-serif',
                fontWeight: 600,
                fontSize: '0.875rem',
                color: 'text.primary',
              }}
            >
              {rec.species}
            </Typography>
            <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary', fontWeight: 600 }}>
              {rec.count}×
            </Typography>
            <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary', fontFeatureSettings: '"tnum"' }}>
              {rec.heaviestKg * 1000} g
            </Typography>
            <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary', fontFeatureSettings: '"tnum"' }}>
              {rec.longestCm} cm
            </Typography>
          </Box>
        ))}
      </Box>
      {records.length > PAGE && (
        <ButtonBase
          onClick={() => setShowAll((v) => !v)}
          sx={{
            mt: 1,
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 0.5,
            py: 0.75,
            color: 'text.secondary',
            fontSize: '0.8125rem',
            borderRadius: 1,
          }}
        >
          {showAll ? 'Visa färre' : `Visa ${records.length - PAGE} fler`}
          <ChevronDown
            size={16}
            style={{ transform: showAll ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
          />
        </ButtonBase>
      )}
    </Box>
  );
}

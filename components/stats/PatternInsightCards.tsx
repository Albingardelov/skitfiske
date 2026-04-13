'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import { Lightbulb } from 'lucide-react';
import { expedition } from '@/lib/theme/expeditionTokens';
import type { PatternInsight } from '@/lib/stats/index';

interface Props {
  insights: PatternInsight[];
}

export default function PatternInsightCards({ insights }: Props) {
  const theme = useTheme();
  const isLight = theme.palette.mode === 'light';

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
        Dina mönster
      </Typography>
      {insights.length === 0 ? (
        <Typography
          variant="body2"
          sx={{ color: 'text.secondary', fontFamily: 'var(--font-work), var(--font-sans), sans-serif' }}
        >
          Logga fler fångster för att se dina mönster.
        </Typography>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {insights.map((insight) => (
            <Box
              key={insight.text}
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 1.5,
                p: 1.75,
                borderRadius: 2,
                bgcolor: isLight ? 'rgba(27,48,34,0.06)' : 'rgba(169,208,175,0.08)',
              }}
            >
              <Lightbulb
                size={18}
                color={isLight ? expedition.forest : theme.palette.primary.main}
                style={{ flexShrink: 0, marginTop: 2 }}
              />
              <Typography
                sx={{
                  fontFamily: 'var(--font-work), var(--font-sans), sans-serif',
                  fontSize: '0.875rem',
                  lineHeight: 1.5,
                  color: 'text.primary',
                }}
              >
                {insight.text}
              </Typography>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}

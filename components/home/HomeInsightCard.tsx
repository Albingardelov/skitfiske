'use client';

import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import ButtonBase from '@mui/material/ButtonBase';
import { useTheme } from '@mui/material/styles';
import { Fish } from 'lucide-react';
import { expedition } from '@/lib/theme/expeditionTokens';
import { computeHomeInsight } from '@/lib/stats/index';
import type { Catch } from '@/types/catch';

interface Props {
  catches: Catch[];
}

export default function HomeInsightCard({ catches }: Props) {
  const theme = useTheme();
  const isLight = theme.palette.mode === 'light';
  const router = useRouter();

  const insight = computeHomeInsight(catches, new Date());
  if (!insight) return null;

  const sentences: string[] = [];
  if (insight.timeLabel && insight.monthLabel) {
    sentences.push(
      `Du fångar mest ${insight.species.toLowerCase()} ${insight.timeLabel} i ${insight.monthLabel} — precis som nu.`,
    );
  } else if (insight.timeLabel) {
    sentences.push(
      `Du fångar mest ${insight.species.toLowerCase()} ${insight.timeLabel} — precis som nu.`,
    );
  } else if (insight.monthLabel) {
    const m = insight.monthLabel.charAt(0).toUpperCase() + insight.monthLabel.slice(1);
    sentences.push(`${m} är din bästa månad för ${insight.species.toLowerCase()}.`);
  }
  if (insight.topBait) sentences.push(`Bete: ${insight.topBait}.`);

  return (
    <Box sx={{ px: 2, mt: 2 }}>
      <ButtonBase
        onClick={() => router.push('/logbok?view=statistik')}
        sx={{ display: 'block', width: '100%', textAlign: 'left', borderRadius: '16px' }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 1.5,
            p: 2,
            borderRadius: '16px',
            bgcolor: isLight ? expedition.tanChip : 'rgba(169,208,175,0.1)',
            border: '1px solid',
            borderColor: isLight ? 'rgba(27,48,34,0.1)' : 'rgba(169,208,175,0.15)',
          }}
        >
          <Fish
            size={20}
            color={isLight ? expedition.forest : theme.palette.primary.main}
            style={{ flexShrink: 0, marginTop: 2 }}
          />
          <Box>
            <Typography
              sx={{
                fontFamily: 'var(--font-work), var(--font-sans), sans-serif',
                fontWeight: 700,
                fontSize: '0.875rem',
                color: isLight ? expedition.forest : 'primary.main',
                mb: 0.25,
              }}
            >
              Bra förutsättningar för {insight.species.toLowerCase()}
            </Typography>
            <Typography
              sx={{
                fontFamily: 'var(--font-work), var(--font-sans), sans-serif',
                fontSize: '0.8125rem',
                lineHeight: 1.5,
                color: 'text.secondary',
              }}
            >
              {sentences.join(' ')}
            </Typography>
          </Box>
        </Box>
      </ButtonBase>
    </Box>
  );
}

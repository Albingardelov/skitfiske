'use client';

import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Skeleton from '@mui/material/Skeleton';
import { alpha, useTheme } from '@mui/material/styles';
import { createClient } from '@/lib/supabase/client';
import { fetchMyCatches, fetchAllCatches } from '@/lib/supabase/catches';
import HemHero from '@/components/home/HemHero';
import StatsRow from '@/components/home/StatsRow';
import CatchCard from '@/components/catch/CatchCard';
import { hemTheme } from '@/lib/hemTheme';
import type { Catch } from '@/types/catch';

function HemSkeleton() {
  const theme = useTheme();
  const skelBg = alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.12 : 0.08);
  const skelBg2 = alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.1 : 0.06);

  return (
    <Box sx={{ bgcolor: 'background.default', flex: 1, minHeight: 0 }}>
      <Box sx={{ px: 2, pt: 2 }}>
        <Skeleton variant="rounded" height={320} sx={{ borderRadius: '24px', bgcolor: skelBg }} />
      </Box>
      <Box sx={{ px: 2, pt: 3 }}>
        <Skeleton variant="rounded" height={96} sx={{ borderRadius: '18px', bgcolor: skelBg2 }} />
      </Box>
      <Box sx={{ px: 2, pt: 2 }}>
        <Skeleton variant="text" width="40%" sx={{ bgcolor: skelBg }} />
        <Skeleton variant="rounded" height={220} sx={{ mt: 1, borderRadius: '18px', bgcolor: skelBg2 }} />
      </Box>
    </Box>
  );
}

export default function HemPage() {
  const theme = useTheme();
  const isLight = theme.palette.mode === 'light';
  const [firstName, setFirstName] = useState<string>('');
  const [myCatches, setMyCatches] = useState<Catch[]>([]);
  const [clubFeed, setClubFeed] = useState<Catch[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth
      .getUser()
      .then(({ data }) => {
        const fullName = data.user?.user_metadata?.full_name ?? '';
        setFirstName(fullName.split(' ')[0]);
        const userId = data.user?.id;
        if (!userId) {
          setIsLoading(false);
          return;
        }
        Promise.all([fetchMyCatches(userId), fetchAllCatches()])
          .then(([mine, all]) => {
            setMyCatches(mine);
            setClubFeed(all.slice(0, 10));
          })
          .catch(() => {
            setMyCatches([]);
            setClubFeed([]);
          })
          .finally(() => setIsLoading(false));
      })
      .catch(() => setIsLoading(false));
  }, []);

  const heaviestKg =
    myCatches.length > 0 ? Math.max(...myCatches.map((c) => c.weight_kg)) : null;
  const longestCm =
    myCatches.length > 0 ? Math.max(...myCatches.map((c) => c.length_cm)) : null;

  if (isLoading) {
    return <HemSkeleton />;
  }

  return (
    <Box
      sx={{
        bgcolor: 'background.default',
        color: 'text.primary',
        flex: 1,
        minHeight: 0,
        pb: 4,
      }}
    >
      <HemHero firstName={firstName} />

      <StatsRow
        count={myCatches.length}
        heaviestKg={heaviestKg}
        longestCm={longestCm}
        variant={isLight ? 'light' : 'default'}
      />

      <Box sx={{ px: 2, mb: 1.5, mt: 1 }}>
        <Box
          sx={{
            width: 28,
            height: 3,
            borderRadius: 1,
            bgcolor: isLight ? hemTheme.rust : 'secondary.main',
            mb: 1.25,
          }}
        />
        <Typography
          sx={{
            fontFamily: 'var(--font-display-editorial), Georgia, serif',
            fontWeight: 700,
            fontSize: '1.35rem',
            letterSpacing: '-0.02em',
            color: 'text.primary',
          }}
        >
          Senaste i klubben
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
          Rapporter från medlemmarna
        </Typography>
      </Box>

      {clubFeed.length === 0 ? (
        <Box sx={{ px: 2 }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Inga fångster registrerade än.
          </Typography>
        </Box>
      ) : (
        clubFeed.map((c) => (
          <CatchCard key={c.id} catch={c} variant={isLight ? 'light' : 'default'} />
        ))
      )}
    </Box>
  );
}

'use client';

import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Skeleton from '@mui/material/Skeleton';
import Link from '@mui/material/Link';
import { alpha, useTheme } from '@mui/material/styles';
import NextLink from 'next/link';
import { ChevronRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useClub } from '@/contexts/ClubContext';
import { fetchMyCatches, fetchClubCatches } from '@/lib/supabase/catches';
import HemScreenHeader from '@/components/home/HemScreenHeader';
import HemHero from '@/components/home/HemHero';
import SeasonPerformanceSection from '@/components/home/SeasonPerformanceSection';
import TackleBoxInsightsCard from '@/components/home/TackleBoxInsightsCard';
import UpcomingHatchCard from '@/components/home/UpcomingHatchCard';
import HomeFab from '@/components/home/HomeFab';
import HomeInsightCard from '@/components/home/HomeInsightCard';
import CatchCard from '@/components/catch/CatchCard';
import { expedition } from '@/lib/theme/expeditionTokens';
import type { Catch } from '@/types/catch';

function HemSkeleton() {
  const theme = useTheme();
  const isLight = theme.palette.mode === 'light';
  const skelBg = alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.12 : 0.08);
  const skelBg2 = alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.1 : 0.06);

  return (
    <Box
      sx={{
        bgcolor: isLight ? expedition.canvasWarm : 'background.default',
        flex: 1,
        minHeight: 0,
      }}
    >
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
  const { isReady, activeClub } = useClub();
  const [firstName, setFirstName] = useState<string>('');
  const [myCatches, setMyCatches] = useState<Catch[]>([]);
  const [clubFeed, setClubFeed] = useState<Catch[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isReady) return;
    let cancelled = false;
    setIsLoading(true);
    createClient()
      .auth.getUser()
      .then(async ({ data }) => {
        if (cancelled) return;
        const fullName = data.user?.user_metadata?.full_name ?? '';
        setFirstName(fullName.split(' ')[0]);
        const userId = data.user?.id;
        if (!userId || !activeClub) {
          setMyCatches([]);
          setClubFeed([]);
          return;
        }
        const [mine, club] = await Promise.all([
          fetchMyCatches(userId),
          fetchClubCatches(activeClub.id),
        ]);
        if (!cancelled) {
          setMyCatches(mine);
          setClubFeed(club.slice(0, 10));
        }
      })
      .catch(() => {
        if (!cancelled) {
          setMyCatches([]);
          setClubFeed([]);
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isReady, activeClub?.id]);

  if (!isReady || isLoading) {
    return (
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          bgcolor: isLight ? expedition.canvasWarm : 'background.default',
        }}
      >
        <HemScreenHeader />
        <HemSkeleton />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        bgcolor: isLight ? expedition.canvasWarm : 'background.default',
        color: 'text.primary',
        flex: 1,
        minHeight: 0,
        pb: 'calc(96px + env(safe-area-inset-bottom, 0px))',
        overflowY: 'auto',
      }}
    >
      <HemScreenHeader />
      <HemHero firstName={firstName} />
      <HomeInsightCard catches={myCatches} />

      <SeasonPerformanceSection catches={myCatches} />

      <Box
        sx={{
          px: 2,
          mt: 2.5,
          mb: 1,
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          gap: 1,
        }}
      >
        <Box>
          <Typography
            sx={{
              fontFamily: 'var(--font-newsreader), Georgia, serif',
              fontWeight: 700,
              fontSize: '1.2rem',
              letterSpacing: '-0.02em',
              color: 'text.primary',
            }}
          >
            Senaste aktivitet
          </Typography>
          <Typography
            variant="body2"
            sx={{
              fontFamily: 'var(--font-work), var(--font-sans), sans-serif',
              color: 'text.secondary',
              mt: 0.35,
            }}
          >
            Rapporter från klubben
          </Typography>
        </Box>
        <Link
          component={NextLink}
          href="/logbok"
          underline="hover"
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.25,
            fontFamily: 'var(--font-work), var(--font-sans), sans-serif',
            fontWeight: 600,
            fontSize: '0.8125rem',
            color: isLight ? expedition.forest : 'primary.main',
            whiteSpace: 'nowrap',
          }}
        >
          Visa allt
          <ChevronRight size={16} aria-hidden />
        </Link>
      </Box>

      {clubFeed.length === 0 ? (
        <Box sx={{ px: 2 }}>
          <Typography
            variant="body2"
            sx={{ fontFamily: 'var(--font-work), var(--font-sans), sans-serif', color: 'text.secondary' }}
          >
            Inga fångster registrerade än.
          </Typography>
        </Box>
      ) : (
        clubFeed.map((c) => <CatchCard key={c.id} catch={c} variant={isLight ? 'light' : 'default'} />)
      )}

      <TackleBoxInsightsCard />
      <UpcomingHatchCard />

      <HomeFab />
    </Box>
  );
}

'use client';

import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Skeleton from '@mui/material/Skeleton';
import { createClient } from '@/lib/supabase/client';
import { fetchMyCatches, fetchAllCatches } from '@/lib/supabase/catches';
import StatsRow from '@/components/home/StatsRow';
import CatchCard from '@/components/catch/CatchCard';
import type { Catch } from '@/types/catch';

function HemSkeleton() {
  return (
    <Box sx={{ px: 2, pt: 3, pb: 2 }}>
      <Skeleton variant="text" width="55%" height={44} sx={{ mb: 1, borderRadius: 1 }} />
      <Skeleton variant="text" width="85%" height={22} sx={{ mb: 3, borderRadius: 1 }} />
      <Skeleton variant="rounded" height={100} sx={{ mb: 2, borderRadius: 3 }} />
      <Skeleton variant="text" width={140} height={24} sx={{ mb: 1.5 }} />
      <Skeleton variant="rounded" height={200} sx={{ mb: 2, borderRadius: 3, mx: 0 }} />
      <Skeleton variant="rounded" height={200} sx={{ borderRadius: 3, mx: 0 }} />
    </Box>
  );
}

export default function HemPage() {
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
    return (
      <Box sx={{ minHeight: 'calc(100dvh - 56px)' }}>
        <HemSkeleton />
      </Box>
    );
  }

  return (
    <Box sx={{ pb: 4 }}>
      <Box sx={{ px: 2, pt: 3, pb: 2 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 600,
            letterSpacing: '-0.03em',
            lineHeight: 1.2,
          }}
        >
          {firstName ? `Hej, ${firstName}` : 'Välkommen'}
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.75 }}>
          Klubbens senaste fångster och dina siffror.
        </Typography>
      </Box>

      <StatsRow count={myCatches.length} heaviestKg={heaviestKg} longestCm={longestCm} />

      <Box sx={{ px: 2, mb: 1.5, mt: 0.5 }}>
        <Typography
          variant="overline"
          sx={{
            color: 'text.secondary',
            fontWeight: 600,
            letterSpacing: '0.12em',
            lineHeight: 1.5,
          }}
        >
          Senaste i klubben
        </Typography>
      </Box>

      {clubFeed.length === 0 ? (
        <Box sx={{ px: 2 }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Inga fångster registrerade än.
          </Typography>
        </Box>
      ) : (
        clubFeed.map((c) => <CatchCard key={c.id} catch={c} />)
      )}
    </Box>
  );
}

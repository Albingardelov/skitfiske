'use client';

import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import { createClient } from '@/lib/supabase/client';
import { fetchMyCatches, fetchAllCatches } from '@/lib/supabase/catches';
import StatsRow from '@/components/home/StatsRow';
import CatchCard from '@/components/catch/CatchCard';
import type { Catch } from '@/types/catch';

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
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 'calc(100vh - 64px)',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ pb: 4 }}>
      <Box sx={{ px: 2, pt: 3, pb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          {firstName ? `Hej, ${firstName}!` : 'Välkommen!'}
        </Typography>
      </Box>

      <StatsRow count={myCatches.length} heaviestKg={heaviestKg} longestCm={longestCm} />

      <Box sx={{ px: 2, mb: 1 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
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

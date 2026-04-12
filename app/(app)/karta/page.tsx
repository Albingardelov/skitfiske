'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Fab from '@mui/material/Fab';
import { Plus } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useClub } from '@/contexts/ClubContext';
import { fetchMyCatches, fetchClubCatches } from '@/lib/supabase/catches';
import type { Catch } from '@/types/catch';

const CatchMap = dynamic(() => import('@/components/map/CatchMap'), { ssr: false });

function KartaContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isReady: clubReady, activeClub } = useClub();
  const focusLat = searchParams.get('lat') ? parseFloat(searchParams.get('lat')!) : undefined;
  const focusLng = searchParams.get('lng') ? parseFloat(searchParams.get('lng')!) : undefined;
  const [filter, setFilter] = useState<'mine' | 'all'>('all');
  const [catches, setCatches] = useState<Catch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [authDone, setAuthDone] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth
      .getUser()
      .then(({ data }) => {
        setUserId(data.user?.id ?? null);
      })
      .catch(() => {
        setUserId(null);
      })
      .finally(() => setAuthDone(true));
  }, []);

  useEffect(() => {
    if (!authDone || !clubReady) return;
    if (!userId) {
      setCatches([]);
      setIsLoading(false);
      return;
    }
    if (filter === 'all' && !activeClub) {
      setCatches([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    const load =
      filter === 'mine' ? fetchMyCatches(userId) : fetchClubCatches(activeClub!.id);
    load
      .then(setCatches)
      .catch(() => setCatches([]))
      .finally(() => setIsLoading(false));
  }, [authDone, clubReady, filter, userId, activeClub?.id]);

  function handleMapClick(lat: number, lng: number) {
    router.push(`/logbok/ny?lat=${lat}&lng=${lng}`);
  }

  function handleFab() {
    router.push('/logbok/ny');
  }

  return (
    <Box
      sx={{
        flex: 1,
        minHeight: { xs: 'calc(100dvh - 140px)', sm: 0 },
        position: 'relative',
        width: '100%',
      }}
    >
      {/* Filter toggle */}
      <ToggleButtonGroup
        value={filter}
        exclusive
        onChange={(_, val) => {
          if (val) setFilter(val);
        }}
        size="small"
        sx={{
          position: 'absolute',
          top: 10,
          right: 10,
          zIndex: 1000,
        }}
      >
        <ToggleButton value="mine">Mina</ToggleButton>
        <ToggleButton value="all">Alla</ToggleButton>
      </ToggleButtonGroup>

      {/* Map — absolut positioned så Leaflet får garanterad höjd (flex + height:100% räcker inte alltid). */}
      {authDone && clubReady && !isLoading && (
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            zIndex: 0,
          }}
        >
          <CatchMap catches={catches} onMapClick={handleMapClick} focusLat={focusLat} focusLng={focusLng} />
        </Box>
      )}
      {(!authDone || !clubReady || isLoading) && (
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'background.default',
            zIndex: 1,
          }}
        >
          <CircularProgress size={36} sx={{ color: 'primary.light' }} />
        </Box>
      )}

      {/* FAB */}
      <Fab
        color="primary"
        onClick={handleFab}
        sx={{
          position: 'fixed',
          right: 16,
          bottom: 'calc(96px + env(safe-area-inset-bottom, 0px))',
        }}
        aria-label="Registrera fångst"
      >
        <Plus size={24} />
      </Fab>
    </Box>
  );
}

export default function KartaPage() {
  return (
    <Suspense>
      <KartaContent />
    </Suspense>
  );
}

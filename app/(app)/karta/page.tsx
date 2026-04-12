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
import { fetchMyCatches, fetchAllCatches } from '@/lib/supabase/catches';
import type { Catch } from '@/types/catch';

const CatchMap = dynamic(() => import('@/components/map/CatchMap'), { ssr: false });

function KartaContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
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
    if (!authDone) return;
    if (!userId) {
      setCatches([]);
      return;
    }
    setIsLoading(true);
    const load = filter === 'mine' ? fetchMyCatches(userId) : fetchAllCatches();
    load
      .then(setCatches)
      .catch(() => setCatches([]))
      .finally(() => setIsLoading(false));
  }, [authDone, filter, userId]);

  function handleMapClick(lat: number, lng: number) {
    router.push(`/logbok/ny?lat=${lat}&lng=${lng}`);
  }

  function handleFab() {
    router.push('/logbok/ny');
  }

  return (
    <Box sx={{ height: 'calc(100vh - 64px)', position: 'relative' }}>
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

      {/* Map */}
      {authDone && !isLoading && (
        <CatchMap catches={catches} onMapClick={handleMapClick} focusLat={focusLat} focusLng={focusLng} />
      )}
      {(!authDone || isLoading) && (
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
        sx={{ position: 'fixed', bottom: 80, right: 16 }}
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

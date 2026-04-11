'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Box from '@mui/material/Box';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Fab from '@mui/material/Fab';
import { Plus } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { fetchMyCatches, fetchAllCatches } from '@/lib/supabase/catches';
import type { Catch } from '@/types/catch';

const CatchMap = dynamic(() => import('@/components/map/CatchMap'), { ssr: false });

export default function KartaPage() {
  const router = useRouter();
  const [filter, setFilter] = useState<'mine' | 'all'>('mine');
  const [catches, setCatches] = useState<Catch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser()
      .then(({ data }) => {
        setUserId(data.user?.id ?? null);
      })
      .catch(() => {
        setUserId(null);
      });
  }, []);

  useEffect(() => {
    if (!userId) return;
    setIsLoading(true);
    const load = filter === 'mine' ? fetchMyCatches(userId) : fetchAllCatches();
    load
      .then(setCatches)
      .catch(() => setCatches([]))
      .finally(() => setIsLoading(false));
  }, [filter, userId]);

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
        onChange={(_, val) => { if (val) setFilter(val); }}
        size="small"
        sx={{
          position: 'absolute',
          top: 8,
          right: 8,
          zIndex: 1000,
          bgcolor: 'background.paper',
          borderRadius: 1,
        }}
      >
        <ToggleButton value="mine">Mina</ToggleButton>
        <ToggleButton value="all">Alla</ToggleButton>
      </ToggleButtonGroup>

      {/* Map */}
      {!isLoading && (
        <CatchMap catches={catches} onMapClick={handleMapClick} />
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

// app/(app)/logbok/page.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import { createClient } from '@/lib/supabase/client';
import { fetchMyCatches, fetchAllCatches } from '@/lib/supabase/catches';
import CatchList from '@/components/catch/CatchList';
import EditorialShellHeader from '@/components/layout/EditorialShellHeader';
import LogbokSegmentControl from '@/components/logbok/LogbokSegmentControl';
import SpeciesFilterChips from '@/components/logbok/SpeciesFilterChips';
import DualCatchFab from '@/components/logbok/DualCatchFab';
import { expedition } from '@/lib/theme/expeditionTokens';
import type { Catch } from '@/types/catch';

export default function LogbokPage() {
  const theme = useTheme();
  const isLight = theme.palette.mode === 'light';
  const [tab, setTab] = useState(0);
  const [speciesFilter, setSpeciesFilter] = useState<string | null>(null);
  const [catches, setCatches] = useState<Catch[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState('');

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUserId(data.user.id);
    });
  }, []);

  useEffect(() => {
    setSpeciesFilter(null);
  }, [tab]);

  useEffect(() => {
    if (!userId) return;
    setIsLoading(true);
    const load = tab === 0 ? fetchMyCatches(userId) : fetchAllCatches();
    load
      .then((data) => setCatches(data))
      .catch(() => setCatches([]))
      .finally(() => setIsLoading(false));
  }, [tab, userId]);

  const speciesOptions = useMemo(() => {
    const set = new Set(catches.map((c) => c.species.trim()).filter(Boolean));
    return [...set].sort((a, b) => a.localeCompare(b, 'sv'));
  }, [catches]);

  const filteredCatches = useMemo(() => {
    if (!speciesFilter) return catches;
    return catches.filter((c) => c.species === speciesFilter);
  }, [catches, speciesFilter]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        minHeight: 0,
        bgcolor: isLight ? expedition.canvasWarm : 'background.default',
      }}
    >
      <EditorialShellHeader />
      <LogbokSegmentControl value={tab} onChange={setTab} />
      <SpeciesFilterChips species={speciesOptions} active={speciesFilter} onChange={setSpeciesFilter} />
      <CatchList catches={filteredCatches} isLoading={isLoading} cardVariant="logbook" />
      <DualCatchFab />
    </Box>
  );
}

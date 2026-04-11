// app/(app)/logbok/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Fab from '@mui/material/Fab';
import { Plus } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { fetchMyCatches, fetchAllCatches } from '@/lib/supabase/catches';
import CatchList from '@/components/catch/CatchList';
import type { Catch } from '@/types/catch';

export default function LogbokPage() {
  const router = useRouter();
  const [tab, setTab] = useState(0);
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
    if (!userId) return;
    setIsLoading(true);
    const load = tab === 0 ? fetchMyCatches(userId) : fetchAllCatches();
    load
      .then((data) => setCatches(data))
      .catch(() => setCatches([]))
      .finally(() => setIsLoading(false));
  }, [tab, userId]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)' }}>
      <Box sx={{ position: 'sticky', top: 0, zIndex: 10, bgcolor: 'background.paper' }}>
        <Tabs
          value={tab}
          onChange={(_, v: number) => setTab(v)}
          variant="fullWidth"
          sx={{
            '& .MuiTab-root': { color: 'text.secondary' },
            '& .Mui-selected': { color: 'primary.main' },
            '& .MuiTabs-indicator': { bgcolor: 'primary.main' },
          }}
        >
          <Tab label="Mina fångster" />
          <Tab label="Alla fångster" />
        </Tabs>
      </Box>

      <CatchList catches={catches} isLoading={isLoading} />

      <Fab
        color="primary"
        aria-label="Lägg till fångst"
        onClick={() => router.push('/logbok/ny')}
        sx={{ position: 'fixed', bottom: 80, right: 16 }}
      >
        <Plus size={24} />
      </Fab>
    </Box>
  );
}

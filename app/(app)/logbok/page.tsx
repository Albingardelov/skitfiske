// app/(app)/logbok/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Fab from '@mui/material/Fab';
import { Plus } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { fetchMyCatches, fetchAllCatches } from '@/lib/supabase/catches';
import CatchList from '@/components/catch/CatchList';
import { stickyBarSurfaceSx } from '@/lib/appChrome';
import type { Catch } from '@/types/catch';

const mainH = 'calc(100dvh - 56px)';

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
    <Box sx={{ display: 'flex', flexDirection: 'column', height: mainH }}>
      <Box
        sx={[
          stickyBarSurfaceSx,
          {
            px: 2,
            py: 1.25,
            display: 'flex',
            gap: 1,
          },
        ]}
      >
        {(['Mina fångster', 'Alla fångster'] as const).map((label, index) => {
          const active = tab === index;
          return (
            <Button
              key={label}
              onClick={() => setTab(index)}
              variant="text"
              size="small"
              sx={{
                flex: 1,
                borderRadius: 999,
                py: 1,
                minHeight: 42,
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.8125rem',
                color: active ? 'primary.light' : 'text.secondary',
                bgcolor: active ? 'action.selected' : 'rgba(255,255,255,0.04)',
                border: '1px solid',
                borderColor: active ? 'rgba(90, 158, 152, 0.45)' : 'transparent',
                '&:hover': {
                  bgcolor: active ? 'action.selected' : 'action.hover',
                  borderColor: active ? 'rgba(90, 158, 152, 0.55)' : 'divider',
                },
              }}
            >
              {label}
            </Button>
          );
        })}
      </Box>

      <CatchList catches={catches} isLoading={isLoading} />

      <Fab
        color="primary"
        aria-label="Lägg till fångst"
        onClick={() => router.push('/logbok/ny')}
        sx={{
          position: 'fixed',
          right: 16,
          bottom: 'calc(96px + env(safe-area-inset-bottom, 0px))',
        }}
      >
        <Plus size={24} />
      </Fab>
    </Box>
  );
}

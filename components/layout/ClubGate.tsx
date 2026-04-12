'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { useClub } from '@/contexts/ClubContext';

export default function ClubGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isReady, memberships, userId } = useClub();

  useEffect(() => {
    if (!isReady || !userId) return;
    const onKlubb = pathname === '/klubb' || pathname.startsWith('/klubb/');
    if (memberships.length === 0 && !onKlubb) {
      router.replace('/klubb');
    }
  }, [isReady, memberships.length, pathname, router, userId]);

  if (!isReady) {
    return (
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60dvh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return <>{children}</>;
}

'use client';

import Box from '@mui/material/Box';
import { usePathname } from 'next/navigation';
import AppHeader from '@/components/layout/AppHeader';
import BottomNav from '@/components/navigation/BottomNav';

const bottomInset = 'calc(76px + env(safe-area-inset-bottom, 0px))';

export default function AppRouteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showAppHeader =
    pathname !== '/logbok' &&
    pathname !== '/hem' &&
    pathname !== '/chatt' &&
    pathname !== '/klubb' &&
    !pathname.startsWith('/klubb/');

  return (
    <Box
      sx={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'transparent',
        pb: bottomInset,
      }}
    >
      {showAppHeader && <AppHeader />}
      <Box
        sx={{
          flex: '1 1 0',
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {children}
      </Box>
      <BottomNav />
    </Box>
  );
}

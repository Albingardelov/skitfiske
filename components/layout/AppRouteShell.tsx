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
  const padForBottomNav = pathname !== '/chatt';
  const shellContentScrolls = pathname !== '/chatt';

  return (
    <Box
      sx={{
        height: '100dvh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.default',
        pb: padForBottomNav ? bottomInset : 0,
      }}
    >
      {showAppHeader && <AppHeader />}
      <Box
        sx={{
          flex: '1 1 0',
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          overflowY: shellContentScrolls ? 'auto' : 'hidden',
        }}
      >
        {children}
      </Box>
      <BottomNav />
    </Box>
  );
}

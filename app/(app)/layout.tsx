import Box from '@mui/material/Box';
import AppHeader from '@/components/layout/AppHeader';
import BottomNav from '@/components/navigation/BottomNav';

/** Ungefärlig höjd för bottennav + säker yta (matchar BottomNav). */
const bottomInset = 'calc(76px + env(safe-area-inset-bottom, 0px))';

export default function AppLayout({ children }: { children: React.ReactNode }) {
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
      <AppHeader />
      <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>{children}</Box>
      <BottomNav />
    </Box>
  );
}

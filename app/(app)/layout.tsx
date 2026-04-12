import Box from '@mui/material/Box';
import Image from 'next/image';
import BottomNav from '@/components/navigation/BottomNav';

/** Ungefärlig höjd för bottennav + säker yta (matchar BottomNav). */
const bottomInset = 'calc(76px + env(safe-area-inset-bottom, 0px))';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <Box sx={{ minHeight: '100dvh', bgcolor: 'transparent', pb: bottomInset }}>
      <Box
        component="header"
        sx={{
          display: 'flex',
          alignItems: 'center',
          minHeight: 56,
          px: 2,
          py: 0.5,
          bgcolor: 'rgba(18, 26, 28, 0.78)',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Image src="/logo.svg" alt="Skitfiske" width={44} height={44} priority />
      </Box>
      {children}
      <BottomNav />
    </Box>
  );
}

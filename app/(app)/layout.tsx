import Box from '@mui/material/Box';
import Image from 'next/image';
import BottomNav from '@/components/navigation/BottomNav';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'transparent', pb: '64px' }}>
      <Box
        component="header"
        sx={{
          display: 'flex',
          alignItems: 'center',
          px: 2,
          py: 0.75,
          bgcolor: 'rgba(19, 24, 32, 0.72)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Image src="/logo.svg" alt="Skitfiske" width={48} height={48} />
      </Box>
      {children}
      <BottomNav />
    </Box>
  );
}

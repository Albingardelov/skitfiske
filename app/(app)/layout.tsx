import Box from '@mui/material/Box';
import Image from 'next/image';
import BottomNav from '@/components/navigation/BottomNav';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: '64px' }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          px: 2,
          py: 1,
          bgcolor: 'background.paper',
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

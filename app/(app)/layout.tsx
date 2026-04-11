import Box from '@mui/material/Box';
import BottomNav from '@/components/navigation/BottomNav';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: '64px' }}>
      {children}
      <BottomNav />
    </Box>
  );
}

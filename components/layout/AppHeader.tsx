'use client';

import Box from '@mui/material/Box';
import Image from 'next/image';
import ColorModeMenuButton from '@/components/theme/ColorModeMenuButton';

export default function AppHeader() {
  return (
    <Box
      component="header"
      sx={{
        display: 'flex',
        alignItems: 'center',
        minHeight: 56,
        px: 2,
        py: 0.5,
        bgcolor: 'var(--app-chrome-bg)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        borderBottom: '1px solid',
        borderColor: 'var(--app-chrome-border)',
      }}
    >
      <Image src="/logo.png" alt="Skitfiske" width={40} height={40} priority />
      <ColorModeMenuButton />
    </Box>
  );
}

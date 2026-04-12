'use client';

import { usePathname, useRouter } from 'next/navigation';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import Paper from '@mui/material/Paper';
import { Home, MessageCircle, MapPin, BookOpen } from 'lucide-react';

const navItems = [
  { label: 'Hem', icon: <Home size={24} />, route: '/hem' },
  { label: 'Chatt', icon: <MessageCircle size={24} />, route: '/chatt' },
  { label: 'Karta', icon: <MapPin size={24} />, route: '/karta' },
  { label: 'Logbok', icon: <BookOpen size={24} />, route: '/logbok' },
] as const;

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  const currentValue = navItems.findIndex((item) => pathname.startsWith(item.route));

  return (
    <Paper
      square
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        bgcolor: 'background.paper',
        borderTop: 1,
        borderColor: 'divider',
        boxShadow: '0 -4px 24px rgba(0,0,0,0.35)',
      }}
      elevation={0}
    >
      <BottomNavigation
        value={currentValue}
        onChange={(_, newValue: number) => {
          router.push(navItems[newValue].route);
        }}
        sx={{ minHeight: 64, bgcolor: 'transparent' }}
      >
        {navItems.map((item) => (
          <BottomNavigationAction
            key={item.route}
            label={item.label}
            icon={item.icon}
            sx={{
              color: 'text.secondary',
              '&.Mui-selected': { color: 'primary.light' },
              minWidth: 0,
            }}
          />
        ))}
      </BottomNavigation>
    </Paper>
  );
}

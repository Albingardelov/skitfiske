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
      sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1000 }}
      elevation={3}
    >
      <BottomNavigation
        value={currentValue}
        onChange={(_, newValue: number) => {
          router.push(navItems[newValue].route);
        }}
        sx={{ minHeight: 64, bgcolor: 'secondary.main' }}
      >
        {navItems.map((item) => (
          <BottomNavigationAction
            key={item.route}
            label={item.label}
            icon={item.icon}
            sx={{
              color: 'rgba(255,255,255,0.6)',
              '&.Mui-selected': { color: 'primary.main' },
              minWidth: 0,
            }}
          />
        ))}
      </BottomNavigation>
    </Paper>
  );
}

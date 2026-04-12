'use client';

import { usePathname, useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Home, MessageCircle, MapPin, BookOpen } from 'lucide-react';

const navItems = [
  { label: 'Hem', icon: Home, route: '/hem' },
  { label: 'Chatt', icon: MessageCircle, route: '/chatt' },
  { label: 'Karta', icon: MapPin, route: '/karta' },
  { label: 'Logbok', icon: BookOpen, route: '/logbok' },
] as const;

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <Box
      component="nav"
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        px: 1.5,
        pt: 1,
        pb: 'calc(10px + env(safe-area-inset-bottom, 0px))',
        bgcolor: 'var(--app-nav-bg)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderTop: '1px solid',
        borderColor: 'var(--app-chrome-border)',
        boxShadow: '0 -8px 32px var(--app-nav-shadow)',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'stretch',
          gap: 0.5,
          maxWidth: 480,
          mx: 'auto',
        }}
      >
        {navItems.map((item) => {
          const selected = pathname.startsWith(item.route);
          const Icon = item.icon;
          return (
            <Box
              key={item.route}
              component="button"
              type="button"
              onClick={() => router.push(item.route)}
              sx={{
                flex: 1,
                minHeight: 52,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 0.25,
                border: 'none',
                cursor: 'pointer',
                borderRadius: 999,
                px: 0.5,
                py: 0.75,
                bgcolor: selected ? 'action.selected' : 'transparent',
                color: selected ? 'primary.light' : 'text.secondary',
                transition: 'background-color 0.15s ease, color 0.15s ease',
                '&:hover': {
                  bgcolor: selected ? 'action.selected' : 'action.hover',
                  color: selected ? 'primary.light' : 'text.primary',
                },
                '&:active': {
                  transform: 'scale(0.97)',
                },
              }}
            >
              <Icon size={22} strokeWidth={selected ? 2.25 : 2} aria-hidden />
              <Typography
                variant="caption"
                sx={{
                  fontSize: '0.65rem',
                  fontWeight: selected ? 700 : 600,
                  lineHeight: 1,
                  letterSpacing: '0.02em',
                }}
              >
                {item.label}
              </Typography>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}

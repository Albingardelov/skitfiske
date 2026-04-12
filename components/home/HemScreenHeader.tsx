'use client';

import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import { useTheme } from '@mui/material/styles';
import NextLink from 'next/link';
import { createClient } from '@/lib/supabase/client';
import ColorModeMenuButton from '@/components/theme/ColorModeMenuButton';
import { expedition } from '@/lib/theme/expeditionTokens';
import { useClub } from '@/contexts/ClubContext';

export default function HemScreenHeader() {
  const theme = useTheme();
  const { activeClub } = useClub();
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>();
  const [initials, setInitials] = useState('');

  useEffect(() => {
    createClient()
      .auth.getUser()
      .then(({ data }) => {
        const u = data.user;
        if (!u) return;
        const meta = u.user_metadata as Record<string, string | undefined>;
        setAvatarUrl(meta.avatar_url);
        const name = meta.full_name ?? u.email ?? '';
        const parts = name.trim().split(/\s+/).filter(Boolean);
        const ini =
          parts.length >= 2
            ? `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`
            : name.slice(0, 2);
        setInitials(ini.toUpperCase());
      });
  }, []);

  const titleColor =
    theme.palette.mode === 'light' ? expedition.forest : theme.palette.primary.main;

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        px: 2,
        py: 1.25,
        flexShrink: 0,
        bgcolor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          component="div"
          sx={{
            fontFamily: 'var(--font-newsreader), Georgia, serif',
            fontWeight: 700,
            fontSize: '1.2rem',
            letterSpacing: '-0.02em',
            color: titleColor,
            lineHeight: 1.2,
          }}
        >
          Skitfiske
        </Typography>
        <Link
          component={NextLink}
          href="/klubb"
          underline="hover"
          variant="caption"
          sx={{ color: 'text.secondary', fontWeight: 600 }}
        >
          {activeClub ? activeClub.name : 'Klubb'}
        </Link>
      </Box>
      <ColorModeMenuButton aria-label="Välj tema" sx={{ ml: 0 }} />
      <Avatar src={avatarUrl} alt="" sx={{ width: 40, height: 40, flexShrink: 0 }}>
        {initials}
      </Avatar>
    </Box>
  );
}

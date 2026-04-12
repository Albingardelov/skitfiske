'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import { Settings } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import ColorModeMenuButton from '@/components/theme/ColorModeMenuButton';
import { expedition } from '@/lib/theme/expeditionTokens';

/** Avatar vänster, Skitfiske centrerat, tema + inställningar — loggbok & chatt. */
export default function EditorialShellHeader() {
  const theme = useTheme();
  const router = useRouter();
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

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        px: 2,
        py: 1.25,
        flexShrink: 0,
        bgcolor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Avatar src={avatarUrl} alt="" sx={{ width: 40, height: 40, flexShrink: 0 }}>
        {initials}
      </Avatar>
      <Typography
        component="div"
        sx={{
          flex: 1,
          textAlign: 'center',
          fontFamily: 'var(--font-newsreader), Georgia, serif',
          fontWeight: 700,
          fontSize: '1.2rem',
          letterSpacing: '-0.02em',
          color: theme.palette.mode === 'light' ? expedition.forest : theme.palette.primary.main,
          lineHeight: 1.2,
        }}
      >
        Skitfiske
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
        <ColorModeMenuButton aria-label="Välj tema" sx={{ ml: 0 }} />
        <IconButton
          onClick={() => router.push('/hem')}
          aria-label="Inställningar"
          size="small"
          sx={{ color: 'text.secondary' }}
        >
          <Settings size={22} strokeWidth={2} />
        </IconButton>
      </Box>
    </Box>
  );
}

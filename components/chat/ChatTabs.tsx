'use client';

// components/chat/ChatTabs.tsx
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { alpha } from '@mui/material/styles';
import { staticBarSurfaceSx } from '@/lib/appChrome';
import type { Channel } from '@/types/chat';

interface Props {
  channels: Channel[];
  activeChannelId: string;
  onChannelChange: (channelId: string) => void;
}

export default function ChatTabs({ channels, activeChannelId, onChannelChange }: Props) {
  return (
    <Box
      sx={[
        staticBarSurfaceSx,
        {
          flexShrink: 0,
          px: 2,
          py: 1,
          display: 'flex',
          gap: 1,
          flexWrap: 'nowrap',
          overflowX: 'auto',
          scrollbarWidth: 'none',
          '&::-webkit-scrollbar': { display: 'none' },
        },
      ]}
    >
      {channels.map((channel) => {
        const active = channel.id === activeChannelId;
        return (
          <Button
            key={channel.id}
            onClick={() => onChannelChange(channel.id)}
            variant="text"
            size="small"
            sx={(theme) => ({
              flexShrink: 0,
              borderRadius: 999,
              px: 2,
              py: 0.85,
              minHeight: 40,
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.8125rem',
              letterSpacing: '0.02em',
              color: active ? 'primary.main' : 'text.secondary',
              bgcolor: active
                ? 'action.selected'
                : alpha(theme.palette.text.primary, theme.palette.mode === 'dark' ? 0.04 : 0.06),
              border: '1px solid',
              borderColor: active ? alpha(theme.palette.primary.main, 0.45) : 'transparent',
              '&:hover': {
                bgcolor: active ? 'action.selected' : 'action.hover',
                borderColor: active ? alpha(theme.palette.primary.main, 0.55) : 'divider',
              },
            })}
          >
            {channel.label}
          </Button>
        );
      })}
    </Box>
  );
}

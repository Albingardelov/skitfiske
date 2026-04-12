// components/chat/ChatTabs.tsx
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { stickyBarSurfaceSx } from '@/lib/appChrome';
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
        stickyBarSurfaceSx,
        {
          px: 2,
          py: 1.25,
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
            sx={{
              flexShrink: 0,
              borderRadius: 999,
              px: 2,
              py: 0.85,
              minHeight: 40,
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.8125rem',
              letterSpacing: '0.02em',
              color: active ? 'primary.light' : 'text.secondary',
              bgcolor: active ? 'action.selected' : 'rgba(255,255,255,0.04)',
              border: '1px solid',
              borderColor: active ? 'rgba(90, 158, 152, 0.45)' : 'transparent',
              '&:hover': {
                bgcolor: active ? 'action.selected' : 'action.hover',
                borderColor: active ? 'rgba(90, 158, 152, 0.55)' : 'divider',
              },
            }}
          >
            {channel.label}
          </Button>
        );
      })}
    </Box>
  );
}

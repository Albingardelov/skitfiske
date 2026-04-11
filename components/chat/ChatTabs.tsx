// components/chat/ChatTabs.tsx
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import type { Channel } from '@/types/chat';

interface Props {
  channels: Channel[];
  activeChannelId: string;
  onChannelChange: (channelId: string) => void;
}

export default function ChatTabs({ channels, activeChannelId, onChannelChange }: Props) {
  const activeIndex = channels.findIndex((c) => c.id === activeChannelId);

  return (
    <Box sx={{ position: 'sticky', top: 0, zIndex: 10, bgcolor: 'background.paper' }}>
      <Tabs
        value={activeIndex === -1 ? false : activeIndex}
        onChange={(_, newIndex: number) => onChannelChange(channels[newIndex].id)}
        variant="fullWidth"
        sx={{
          '& .MuiTab-root': { color: 'text.secondary' },
          '& .Mui-selected': { color: 'primary.main' },
          '& .MuiTabs-indicator': { bgcolor: 'primary.main' },
        }}
      >
        {channels.map((channel) => (
          <Tab key={channel.id} label={channel.label} />
        ))}
      </Tabs>
    </Box>
  );
}

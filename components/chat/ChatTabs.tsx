// components/chat/ChatTabs.tsx
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import { stickyBarSurfaceSx } from '@/lib/appChrome';
import type { Channel } from '@/types/chat';

interface Props {
  channels: Channel[];
  activeChannelId: string;
  onChannelChange: (channelId: string) => void;
}

export default function ChatTabs({ channels, activeChannelId, onChannelChange }: Props) {
  const activeIndex = channels.findIndex((c) => c.id === activeChannelId);

  return (
    <Box sx={stickyBarSurfaceSx}>
      <Tabs
        value={activeIndex === -1 ? false : activeIndex}
        onChange={(_, newIndex: number) => onChannelChange(channels[newIndex].id)}
        variant="fullWidth"
      >
        {channels.map((channel) => (
          <Tab key={channel.id} label={channel.label} />
        ))}
      </Tabs>
    </Box>
  );
}

'use client';

import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { createClient } from '@/lib/supabase/client';
import { useChat } from '@/hooks/useChat';
import ChatTabs from '@/components/chat/ChatTabs';
import MessageList from '@/components/chat/MessageList';
import MessageInput from '@/components/chat/MessageInput';
import type { Channel } from '@/types/chat';

export default function ChattPage() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [activeChannelId, setActiveChannelId] = useState('');
  const [userId, setUserId] = useState('');
  const [fullName, setFullName] = useState('');

  useEffect(() => {
    const supabase = createClient();

    Promise.all([
      supabase.from('channels').select('*').order('name'),
      supabase.auth.getUser(),
    ]).then(([{ data: channelData }, { data: userData }]) => {
      if (channelData?.length) {
        setChannels(channelData);
        setActiveChannelId(channelData[0].id);
      }
      if (userData.user) {
        setUserId(userData.user.id);
        setFullName(userData.user.user_metadata?.full_name ?? 'Anonym');
      }
    });
  }, []);

  const { messages, sendMessage, isLoading } = useChat(activeChannelId, userId, fullName);

  if (!activeChannelId) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: 'calc(100vh - 64px)',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)' }}>
      <ChatTabs
        channels={channels}
        activeChannelId={activeChannelId}
        onChannelChange={setActiveChannelId}
      />
      <MessageList messages={messages} currentUserId={userId} />
      <MessageInput onSend={sendMessage} disabled={isLoading || !userId} />
    </Box>
  );
}

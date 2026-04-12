'use client';

import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
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
  const [initError, setInitError] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    Promise.all([
      supabase.from('channels').select('*').order('name'),
      supabase.auth.getUser(),
    ])
      .then(([{ data: channelData }, { data: userData }]) => {
        if (channelData?.length) {
          setChannels(channelData);
          setActiveChannelId(channelData[0].id);
        }
        if (userData.user) {
          setUserId(userData.user.id);
          setFullName(userData.user.user_metadata?.full_name ?? 'Anonym');
        }
      })
      .catch(() => setInitError(true));
  }, []);

  const { messages, sendMessage, removeMessage, editMessage, isLoading, error } = useChat(activeChannelId, userId, fullName);

  if (initError) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: 'calc(100vh - 64px)',
          px: 2,
        }}
      >
        <Alert severity="error" sx={{ width: '100%', maxWidth: 400 }}>
          Kunde inte ladda chatten. Försök igen.
        </Alert>
      </Box>
    );
  }

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
      {error && (
        <Alert severity="error" sx={{ mx: 2, mt: 1, borderRadius: 2 }}>
          {error}
        </Alert>
      )}
      <MessageList messages={messages} currentUserId={userId} onDelete={removeMessage} onEdit={editMessage} />
      <MessageInput onSend={sendMessage} disabled={isLoading || !userId} />
    </Box>
  );
}

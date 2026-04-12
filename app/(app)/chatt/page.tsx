'use client';

import { useState, useEffect, useMemo } from 'react';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import { createClient } from '@/lib/supabase/client';
import { useChat } from '@/hooks/useChat';
import EditorialShellHeader from '@/components/layout/EditorialShellHeader';
import ClubChannelsSection from '@/components/chat/ClubChannelsSection';
import MessageList from '@/components/chat/MessageList';
import MessageInput from '@/components/chat/MessageInput';
import { expedition } from '@/lib/theme/expeditionTokens';
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

  const { messages, sendMessage, removeMessage, editMessage, isLoading, error } = useChat(
    activeChannelId,
    userId,
    fullName,
  );

  const messagePreview = useMemo(() => {
    const withText = [...messages].reverse().find((m) => m.content?.trim());
    if (!withText?.content) return null;
    const t = withText.content.trim();
    return t.length > 80 ? `${t.slice(0, 77)}…` : t;
  }, [messages]);

  if (initError) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          minHeight: 0,
          bgcolor: 'background.default',
        }}
      >
        <EditorialShellHeader />
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flex: 1,
            minHeight: 0,
            px: 2,
          }}
        >
          <Alert severity="error" sx={{ width: '100%', maxWidth: 400 }}>
            Kunde inte ladda chatten. Försök igen.
          </Alert>
        </Box>
      </Box>
    );
  }

  if (!activeChannelId) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          minHeight: 0,
        }}
      >
        <EditorialShellHeader />
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flex: 1,
            minHeight: 0,
          }}
        >
          <CircularProgress sx={{ color: 'primary.main' }} />
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={(theme) => ({
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        minHeight: 0,
        overflow: 'hidden',
        bgcolor: theme.palette.mode === 'light' ? expedition.canvasWarm : 'background.default',
      })}
    >
      <EditorialShellHeader />
      <ClubChannelsSection
        channels={channels}
        activeChannelId={activeChannelId}
        onChannelChange={setActiveChannelId}
        messagePreview={messagePreview}
      />
      {error && (
        <Alert severity="error" sx={{ mx: 2, mt: 0.5, borderRadius: 3 }}>
          {error}
        </Alert>
      )}
      <MessageList messages={messages} currentUserId={userId} onDelete={removeMessage} onEdit={editMessage} />
      <MessageInput onSend={sendMessage} disabled={isLoading || !userId} />
    </Box>
  );
}

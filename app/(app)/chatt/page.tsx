'use client';

import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import { createClient } from '@/lib/supabase/client';
import { useClub } from '@/contexts/ClubContext';
import { fetchChannelsForClub } from '@/lib/supabase/chat';
import { useChat } from '@/hooks/useChat';
import EditorialShellHeader from '@/components/layout/EditorialShellHeader';
import ChatTabs from '@/components/chat/ChatTabs';
import MessageList from '@/components/chat/MessageList';
import MessageInput from '@/components/chat/MessageInput';
import { expedition } from '@/lib/theme/expeditionTokens';
import type { Channel } from '@/types/chat';

function ChattThread({
  channels,
  activeChannelId,
  onChannelChange,
  userId,
  fullName,
}: {
  channels: Channel[];
  activeChannelId: string;
  onChannelChange: (id: string) => void;
  userId: string;
  fullName: string;
}) {
  const { messages, sendMessage, removeMessage, editMessage, isLoading, error } = useChat(
    activeChannelId,
    userId,
    fullName,
  );

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
      <ChatTabs
        channels={channels}
        activeChannelId={activeChannelId}
        onChannelChange={onChannelChange}
      />
      {error && (
        <Alert severity="error" sx={{ mx: 2, mt: 0.5, flexShrink: 0, borderRadius: 3 }}>
          {error}
        </Alert>
      )}
      <MessageList messages={messages} currentUserId={userId} onDelete={removeMessage} onEdit={editMessage} />
      <MessageInput onSend={sendMessage} disabled={isLoading || !userId} />
    </Box>
  );
}

export default function ChattPage() {
  const { isReady, activeClub } = useClub();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [activeChannelId, setActiveChannelId] = useState('');
  const [userId, setUserId] = useState('');
  const [fullName, setFullName] = useState('');
  const [initError, setInitError] = useState(false);
  const [channelsLoading, setChannelsLoading] = useState(true);

  useEffect(() => {
    createClient()
      .auth.getUser()
      .then(({ data: userData }) => {
        if (userData.user) {
          setUserId(userData.user.id);
          setFullName(userData.user.user_metadata?.full_name ?? 'Anonym');
        }
      })
      .catch(() => setInitError(true));
  }, []);

  useEffect(() => {
    if (!isReady || !activeClub) {
      setChannels([]);
      setActiveChannelId('');
      setChannelsLoading(false);
      return;
    }
    setChannelsLoading(true);
    fetchChannelsForClub(activeClub.id)
      .then((channelData) => {
        setChannels(channelData);
        if (channelData[0]) setActiveChannelId(channelData[0].id);
        else setActiveChannelId('');
      })
      .catch(() => setInitError(true))
      .finally(() => setChannelsLoading(false));
  }, [isReady, activeClub?.id]);

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

  if (!isReady || channelsLoading || !userId) {
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
        <Box sx={{ px: 2, py: 3, flex: 1 }}>
          <Alert severity="info">
            Inga kanaler för denna klubb än. Skapa en klubb på nytt eller kontakta support om något
            saknas.
          </Alert>
        </Box>
      </Box>
    );
  }

  return (
    <ChattThread
      channels={channels}
      activeChannelId={activeChannelId}
      onChannelChange={setActiveChannelId}
      userId={userId}
      fullName={fullName}
    />
  );
}

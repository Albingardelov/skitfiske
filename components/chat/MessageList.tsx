'use client';

import { useEffect, useRef } from 'react';
import Box from '@mui/material/Box';
import MessageBubble from '@/components/chat/MessageBubble';
import type { Message } from '@/types/chat';

interface Props {
  messages: Message[];
  currentUserId: string;
}

export default function MessageList({ messages, currentUserId }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;

    if (distanceFromBottom < 200) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length]);

  return (
    <Box
      ref={containerRef}
      sx={{ flex: 1, overflowY: 'auto', py: 2 }}
    >
      {messages.map((message) => (
        <MessageBubble
          key={message.id}
          message={message}
          isOwn={message.user_id === currentUserId}
        />
      ))}
      <div ref={bottomRef} />
    </Box>
  );
}

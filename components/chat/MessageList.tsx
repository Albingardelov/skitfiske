'use client';

import { Fragment, useEffect, useRef } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import MessageBubble from '@/components/chat/MessageBubble';
import { dayDividerLabel, isSameCalendarDay } from '@/components/chat/chatDateLabel';
import type { Message } from '@/types/chat';

interface Props {
  messages: Message[];
  currentUserId: string;
  onDelete: (id: string) => void;
  onEdit: (id: string, content: string) => void;
}

export default function MessageList({ messages, currentUserId, onDelete, onEdit }: Props) {
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
      sx={{
        flex: '1 1 0',
        minHeight: 0,
        overflowY: 'auto',
        overflowX: 'hidden',
        WebkitOverflowScrolling: 'touch',
        pt: 2,
        pb: 'calc(160px + env(safe-area-inset-bottom, 0px))',
        scrollbarWidth: 'thin',
        scrollbarColor: 'rgba(128,128,128,0.25) transparent',
        '&::-webkit-scrollbar': { width: '4px' },
        '&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
        '&::-webkit-scrollbar-thumb': {
          bgcolor: 'rgba(128,128,128,0.25)',
          borderRadius: '2px',
        },
      }}
    >
      {messages.map((message, index) => {
        const showDay =
          index === 0 || !isSameCalendarDay(message.created_at, messages[index - 1].created_at);
        return (
          <Fragment key={message.id}>
            {showDay && (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  px: 3,
                  py: 2,
                }}
              >
                <Box sx={{ flex: 1, height: '1px', bgcolor: 'divider', opacity: 0.6 }} />
                <Typography
                  sx={{
                    fontFamily: 'var(--font-work), var(--font-sans), sans-serif',
                    fontSize: '0.625rem',
                    fontWeight: 700,
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    color: 'text.disabled',
                    px: 0.5,
                  }}
                >
                  {dayDividerLabel(message.created_at)}
                </Typography>
                <Box sx={{ flex: 1, height: '1px', bgcolor: 'divider', opacity: 0.6 }} />
              </Box>
            )}
            <MessageBubble
              message={message}
              isOwn={message.user_id === currentUserId}
              onDelete={onDelete}
              onEdit={onEdit}
            />
          </Fragment>
        );
      })}
      <div ref={bottomRef} />
    </Box>
  );
}

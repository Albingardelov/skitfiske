// hooks/useChat.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { fetchMessages, insertMessage, uploadChatImage, deleteMessage, updateMessage } from '@/lib/supabase/chat';
import type { Message } from '@/types/chat';

export function useChat(channelId: string, userId: string, fullName: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pendingIdsRef = useRef<string[]>([]);

  useEffect(() => {
    if (!channelId) return;

    let mounted = true;
    setIsLoading(true);
    setMessages([]);

    fetchMessages(channelId)
      .then((data) => {
        if (mounted) {
          setMessages(data);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (mounted) {
          setError('Kunde inte ladda meddelanden.');
          setIsLoading(false);
        }
      });

    const supabase = createClient();
    const channel = supabase
      .channel(`messages:${channelId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `channel_id=eq.${channelId}` },
        (payload) => {
          if (!mounted) return;
          const newMsg = payload.new as Message;
          setMessages((prev) => {
            const optimisticIndex = prev.findIndex(
              (m) => pendingIdsRef.current.includes(m.id) && m.user_id === newMsg.user_id
            );
            if (optimisticIndex !== -1) {
              pendingIdsRef.current = pendingIdsRef.current.filter(
                (id) => id !== prev[optimisticIndex].id
              );
              const next = [...prev];
              next[optimisticIndex] = newMsg;
              return next;
            }
            return [...prev, newMsg];
          });
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'messages', filter: `channel_id=eq.${channelId}` },
        (payload) => {
          if (!mounted) return;
          const updated = payload.new as Message;
          setMessages((prev) => prev.map((m) => (m.id === updated.id ? { ...m, ...updated } : m)));
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'messages', filter: `channel_id=eq.${channelId}` },
        (payload) => {
          if (!mounted) return;
          setMessages((prev) => prev.filter((m) => m.id !== payload.old.id));
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [channelId]);

  const sendMessage = useCallback(
    async (content: string | null, imageFile: File | null) => {
      const optimisticId = `optimistic-${Date.now()}`;

      const optimistic: Message = {
        id: optimisticId,
        channel_id: channelId,
        user_id: userId,
        full_name: fullName,
        content,
        image_url: null,
        created_at: new Date().toISOString(),
        status: 'pending',
      };

      pendingIdsRef.current.push(optimisticId);
      setMessages((prev) => [...prev, optimistic]);

      try {
        let imageUrl: string | null = null;
        if (imageFile) {
          imageUrl = await uploadChatImage(userId, imageFile);
        }
        await insertMessage({
          channel_id: channelId,
          user_id: userId,
          full_name: fullName,
          content,
          image_url: imageUrl,
        });
      } catch {
        pendingIdsRef.current = pendingIdsRef.current.filter((id) => id !== optimisticId);
        setMessages((prev) =>
          prev.map((m) => (m.id === optimisticId ? { ...m, status: 'error' } : m))
        );
      }
    },
    [channelId, userId, fullName]
  );

  const removeMessage = useCallback(async (id: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== id));
    try {
      await deleteMessage(id);
    } catch {
      setError('Kunde inte ta bort meddelandet.');
    }
  }, []);

  const editMessage = useCallback(async (id: string, content: string) => {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, content } : m)));
    try {
      await updateMessage(id, content);
    } catch {
      setError('Kunde inte redigera meddelandet.');
    }
  }, []);

  return { messages, sendMessage, removeMessage, editMessage, isLoading, error };
}

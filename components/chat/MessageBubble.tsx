// components/chat/MessageBubble.tsx
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import type { Message } from '@/types/chat';

interface Props {
  message: Message;
  isOwn: boolean;
}

export default function MessageBubble({ message, isOwn }: Props) {
  const isPending = message.status === 'pending';
  const isError = message.status === 'error';

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: isOwn ? 'flex-end' : 'flex-start',
        mb: 1,
        px: 2,
      }}
    >
      {!isOwn && (
        <Typography variant="caption" sx={{ color: 'text.secondary', mb: 0.5 }}>
          {message.full_name}
        </Typography>
      )}
      <Box
        sx={{
          maxWidth: '75%',
          bgcolor: isOwn ? 'primary.main' : 'background.paper',
          color: 'text.primary',
          borderRadius: 2,
          px: 2,
          py: 1,
          opacity: isPending ? 0.7 : 1,
          border: isError ? '2px solid red' : 'none',
        }}
      >
        {message.image_url && (
          <Box
            component="img"
            src={message.image_url}
            alt="Bifogad bild"
            sx={{
              maxWidth: 240,
              width: '100%',
              borderRadius: 1,
              display: 'block',
              mb: message.content ? 1 : 0,
            }}
          />
        )}
        {message.content && (
          <Typography variant="body2">{message.content}</Typography>
        )}
        {isPending && <CircularProgress size={12} sx={{ ml: 1 }} />}
      </Box>
      <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5 }}>
        {new Date(message.created_at).toLocaleTimeString('sv-SE', {
          hour: '2-digit',
          minute: '2-digit',
        })}
      </Typography>
    </Box>
  );
}

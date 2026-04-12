// components/chat/MessageBubble.tsx
import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import { Check, X } from 'lucide-react';
import type { Message } from '@/types/chat';

interface Props {
  message: Message;
  isOwn: boolean;
  onDelete?: (id: string) => void;
  onEdit?: (id: string, content: string) => void;
}

export default function MessageBubble({ message, isOwn, onDelete, onEdit }: Props) {
  const isPending = message.status === 'pending';
  const isError = message.status === 'error';
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(message.content ?? '');

  function handleBubbleClick(e: React.MouseEvent<HTMLElement>) {
    if (!isOwn || isPending || isError || !message.content) return;
    setAnchorEl(e.currentTarget);
  }

  function handleClose() {
    setAnchorEl(null);
  }

  function handleEditStart() {
    setEditValue(message.content ?? '');
    setEditing(true);
    handleClose();
  }

  function handleEditSave() {
    if (editValue.trim() && onEdit) {
      onEdit(message.id, editValue.trim());
    }
    setEditing(false);
  }

  function handleEditCancel() {
    setEditing(false);
  }

  function handleDelete() {
    if (onDelete) onDelete(message.id);
    handleClose();
  }

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
        onClick={handleBubbleClick}
        sx={{
          maxWidth: '75%',
          bgcolor: isOwn ? 'primary.main' : 'background.paper',
          color: 'text.primary',
          borderRadius: 2,
          px: 2,
          py: 1,
          opacity: isPending ? 0.7 : 1,
          border: isError ? '2px solid red' : 'none',
          cursor: isOwn && !isPending && !isError && message.content ? 'pointer' : 'default',
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
        {editing ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <TextField
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              size="small"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleEditSave(); }
                if (e.key === 'Escape') handleEditCancel();
              }}
              sx={{ bgcolor: 'background.default', borderRadius: 1 }}
            />
            <IconButton size="small" onClick={handleEditSave}><Check size={16} /></IconButton>
            <IconButton size="small" onClick={handleEditCancel}><X size={16} /></IconButton>
          </Box>
        ) : (
          message.content && (
            <Typography variant="body2">{message.content}</Typography>
          )
        )}
        {isPending && <CircularProgress size={12} sx={{ ml: 1 }} />}
      </Box>
      <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5 }}>
        {new Date(message.created_at).toLocaleTimeString('sv-SE', {
          hour: '2-digit',
          minute: '2-digit',
        })}
      </Typography>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
        <MenuItem onClick={handleEditStart}>Redigera</MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>Ta bort</MenuItem>
      </Menu>
    </Box>
  );
}

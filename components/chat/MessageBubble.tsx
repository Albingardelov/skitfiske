// components/chat/MessageBubble.tsx
import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Modal from '@mui/material/Modal';
import Tooltip from '@mui/material/Tooltip';
import { Check, MoreVertical, X } from 'lucide-react';
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
  const [lightboxOpen, setLightboxOpen] = useState(false);

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

  const canEdit = Boolean(onEdit && message.content);
  const canDelete = Boolean(onDelete);
  const canOpenMenu = isOwn && !isPending && !isError && (canEdit || canDelete);

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
          display: 'flex',
          flexDirection: isOwn ? 'row-reverse' : 'row',
          alignItems: 'flex-start',
          gap: 0.25,
          maxWidth: '100%',
        }}
      >
        <Box
          sx={{
            maxWidth: '75%',
            bgcolor: isOwn ? 'primary.main' : 'background.paper',
            color: isOwn ? 'primary.contrastText' : 'text.primary',
            borderRadius: 2,
            px: 2,
            py: 1,
            opacity: isPending ? 0.7 : 1,
            border: isError ? '2px solid' : '1px solid',
            borderColor: isError ? 'error.main' : isOwn ? 'transparent' : 'divider',
          }}
        >
        {message.image_url && (
          <Box
            component="img"
            src={message.image_url}
            alt="Bifogad bild"
            onClick={(e) => { e.stopPropagation(); setLightboxOpen(true); }}
            sx={{
              maxWidth: 240,
              width: '100%',
              borderRadius: 1,
              display: 'block',
              mb: message.content ? 1 : 0,
              cursor: 'zoom-in',
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
        {canOpenMenu && (
          <Tooltip title="Redigera eller ta bort meddelandet">
            <IconButton
              size="small"
              aria-label="Meddelandealternativ"
              onClick={(e) => setAnchorEl(e.currentTarget)}
              sx={{
                mt: 0.25,
                color: isOwn ? 'primary.contrastText' : 'text.secondary',
                opacity: isOwn ? 0.75 : 0.85,
                '&:hover': {
                  opacity: 1,
                  bgcolor: isOwn ? 'rgba(18,21,26,0.12)' : 'action.hover',
                },
              }}
            >
              <MoreVertical size={18} strokeWidth={2} />
            </IconButton>
          </Tooltip>
        )}
      </Box>
      <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5 }}>
        {new Date(message.created_at).toLocaleTimeString('sv-SE', {
          hour: '2-digit',
          minute: '2-digit',
        })}
      </Typography>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
        {canEdit && (
          <MenuItem onClick={handleEditStart}>Redigera</MenuItem>
        )}
        {canDelete && (
          <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
            Ta bort
          </MenuItem>
        )}
      </Menu>

      {message.image_url && (
        <Modal open={lightboxOpen} onClose={() => setLightboxOpen(false)}>
          <Box
            onClick={() => setLightboxOpen(false)}
            sx={{
              position: 'fixed',
              inset: 0,
              bgcolor: 'rgba(0,0,0,0.9)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Box
              component="img"
              src={message.image_url}
              alt="Fullscreen"
              sx={{ maxWidth: '95vw', maxHeight: '90vh', objectFit: 'contain', borderRadius: 1 }}
            />
          </Box>
        </Modal>
      )}
    </Box>
  );
}

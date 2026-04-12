'use client';

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
import { alpha, useTheme } from '@mui/material/styles';
import { Check, MoreVertical, X } from 'lucide-react';
import type { Message } from '@/types/chat';

interface Props {
  message: Message;
  isOwn: boolean;
  onDelete?: (id: string) => void;
  onEdit?: (id: string, content: string) => void;
}

export default function MessageBubble({ message, isOwn, onDelete, onEdit }: Props) {
  const theme = useTheme();
  const ownBubbleBg = alpha(theme.palette.primary.main, 0.28);
  const otherBubbleBg =
    theme.palette.mode === 'dark'
      ? alpha(theme.palette.common.white, 0.055)
      : alpha(theme.palette.common.black, 0.06);
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
        mb: 1.25,
        px: 2,
      }}
    >
      {!isOwn && (
        <Typography variant="caption" sx={{ color: 'text.secondary', mb: 0.5, fontWeight: 500 }}>
          {message.full_name}
        </Typography>
      )}
      <Box
        sx={{
          display: 'flex',
          flexDirection: isOwn ? 'row-reverse' : 'row',
          alignItems: 'flex-end',
          gap: 0.5,
          maxWidth: '100%',
        }}
      >
        <Box
          sx={{
            maxWidth: '80%',
            bgcolor: isOwn ? ownBubbleBg : otherBubbleBg,
            color: 'text.primary',
            borderRadius: isOwn ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
            px: 1.75,
            py: 1.15,
            opacity: isPending ? 0.75 : 1,
            border: isError ? '2px solid' : 'none',
            borderColor: isError ? 'error.main' : 'transparent',
            boxShadow: isOwn || isError ? 'none' : '0 2px 12px rgba(0,0,0,0.12)',
          }}
        >
          {message.image_url && (
            <Box
              component="img"
              src={message.image_url}
              alt="Bifogad bild"
              onClick={(e) => {
                e.stopPropagation();
                setLightboxOpen(true);
              }}
              sx={{
                maxWidth: 260,
                width: '100%',
                borderRadius: 1.5,
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
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleEditSave();
                  }
                  if (e.key === 'Escape') handleEditCancel();
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: 'rgba(0,0,0,0.2)',
                    borderRadius: 2,
                  },
                }}
              />
              <IconButton size="small" onClick={handleEditSave} aria-label="Spara">
                <Check size={16} />
              </IconButton>
              <IconButton size="small" onClick={handleEditCancel} aria-label="Avbryt">
                <X size={16} />
              </IconButton>
            </Box>
          ) : (
            message.content && (
              <Typography variant="body2" sx={{ lineHeight: 1.45 }}>
                {message.content}
              </Typography>
            )
          )}
          {isPending && <CircularProgress size={12} sx={{ ml: 1, mt: 0.5 }} />}
        </Box>
        {canOpenMenu && (
          <Tooltip title="Redigera eller ta bort">
            <IconButton
              size="small"
              aria-label="Meddelandealternativ"
              onClick={(e) => setAnchorEl(e.currentTarget)}
              sx={{
                mb: 0.25,
                color: 'text.secondary',
                opacity: 0.9,
                '&:hover': { opacity: 1, bgcolor: 'action.hover' },
              }}
            >
              <MoreVertical size={18} strokeWidth={2} />
            </IconButton>
          </Tooltip>
        )}
      </Box>
      <Typography
        variant="caption"
        sx={{ color: 'text.secondary', mt: 0.35, opacity: 0.75, fontSize: '0.68rem' }}
      >
        {new Date(message.created_at).toLocaleTimeString('sv-SE', {
          hour: '2-digit',
          minute: '2-digit',
        })}
      </Typography>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
        {canEdit && <MenuItem onClick={handleEditStart}>Redigera</MenuItem>}
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

'use client';

import { useState, useRef } from 'react';
import Box from '@mui/material/Box';
import InputBase from '@mui/material/InputBase';
import IconButton from '@mui/material/IconButton';
import Snackbar from '@mui/material/Snackbar';
import { Camera, Send } from 'lucide-react';

interface Props {
  onSend: (content: string | null, imageFile: File | null) => void;
  disabled?: boolean;
}

export default function MessageInput({ onSend, disabled }: Props) {
  const [text, setText] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [snackbar, setSnackbar] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canSend = (text.trim().length > 0 || imageFile !== null) && !disabled;

  function handleSend() {
    if (!canSend) return;
    onSend(text.trim() || null, imageFile);
    setText('');
    setImageFile(null);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setSnackbar('Bilden får max vara 5 MB.');
      return;
    }
    setImageFile(file);
  }

  return (
    <>
      <Box
        sx={{
          px: 2,
          pt: 1.25,
          pb: 'calc(12px + env(safe-area-inset-bottom, 0px))',
          borderTop: '1px solid',
          borderColor: 'divider',
          bgcolor: 'rgba(18, 26, 28, 0.94)',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-end',
            gap: 1,
            p: 1,
            borderRadius: 3,
            bgcolor: 'rgba(255,255,255,0.06)',
            border: '1px solid',
            borderColor: 'divider',
            maxWidth: 720,
            mx: 'auto',
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
          <IconButton
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
            sx={{
              width: 44,
              height: 44,
              flexShrink: 0,
              color: imageFile ? 'primary.light' : 'text.secondary',
            }}
            aria-label="Välj bild"
          >
            <Camera size={22} />
          </IconButton>
          <InputBase
            fullWidth
            multiline
            maxRows={5}
            placeholder={
              imageFile ? `Bifogad: ${imageFile.name}` : 'Skriv ett meddelande…'
            }
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            sx={{
              py: 1,
              px: 0.5,
              fontSize: '0.9375rem',
              lineHeight: 1.45,
              color: 'text.primary',
            }}
          />
          <IconButton
            onClick={handleSend}
            disabled={!canSend}
            sx={{
              width: 46,
              height: 46,
              flexShrink: 0,
              borderRadius: '50%',
              bgcolor: canSend ? '#c4a667' : 'rgba(255,255,255,0.06)',
              color: canSend ? '#12151a' : 'text.disabled',
              '&:hover': {
                bgcolor: canSend ? '#d4bc85' : 'action.hover',
              },
              '&.Mui-disabled': {
                bgcolor: 'rgba(255,255,255,0.04)',
                color: 'text.disabled',
              },
            }}
            aria-label="Skicka"
          >
            <Send size={20} strokeWidth={2.25} />
          </IconButton>
        </Box>
      </Box>
      <Snackbar
        open={Boolean(snackbar)}
        autoHideDuration={5000}
        onClose={() => setSnackbar(null)}
        message={snackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{ bottom: { xs: 100, sm: 88 } }}
      />
    </>
  );
}

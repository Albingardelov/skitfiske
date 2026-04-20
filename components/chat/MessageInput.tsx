'use client';

import { useState, useRef } from 'react';
import Box from '@mui/material/Box';
import InputBase from '@mui/material/InputBase';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Snackbar from '@mui/material/Snackbar';
import { alpha, useTheme } from '@mui/material/styles';
import { Plus, Send } from 'lucide-react';
import { expedition } from '@/lib/theme/expeditionTokens';

interface Props {
  onSend: (content: string | null, imageFile: File | null) => void;
  disabled?: boolean;
}

export default function MessageInput({ onSend, disabled }: Props) {
  const theme = useTheme();
  const isLight = theme.palette.mode === 'light';
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
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 'calc(76px + env(safe-area-inset-bottom, 0px))',
          zIndex: 1100,
          flexShrink: 0,
          px: 2,
          pt: 1.25,
          pb: 1.25,
          borderTop: '1px solid',
          borderColor: 'divider',
          bgcolor: isLight ? expedition.canvasWarm : 'background.default',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            p: 1,
            pl: 1.25,
            borderRadius: 999,
            bgcolor: isLight ? '#fff' : theme.palette.background.paper,
            border: '1px solid',
            borderColor: isLight ? 'rgba(27, 28, 28, 0.08)' : 'divider',
            boxShadow: isLight ? '0 4px 20px rgba(0,0,0,0.06)' : 'none',
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
              width: 40,
              height: 40,
              flexShrink: 0,
              bgcolor: isLight ? 'rgba(27,48,34,0.06)' : alpha(theme.palette.common.white, 0.08),
              color: imageFile ? 'primary.main' : 'text.secondary',
            }}
            aria-label="Bifoga bild"
          >
            <Plus size={22} strokeWidth={2.25} />
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
              py: 0.5,
              px: 0.5,
              fontSize: '0.9375rem',
              lineHeight: 1.45,
              color: 'text.primary',
              fontFamily: 'var(--font-work), var(--font-sans), sans-serif',
            }}
          />
          <Button
            variant="contained"
            disableElevation
            disabled={!canSend}
            onClick={handleSend}
            endIcon={<Send size={18} strokeWidth={2.25} />}
            sx={{
              flexShrink: 0,
              borderRadius: 999,
              px: 2,
              py: 1,
              minWidth: 0,
              textTransform: 'none',
              fontFamily: 'var(--font-work), var(--font-sans), sans-serif',
              fontWeight: 800,
              fontSize: '0.68rem',
              letterSpacing: '0.12em',
              bgcolor: isLight ? expedition.forest : 'primary.main',
              color: '#fff',
              '&:hover': { bgcolor: isLight ? '#14261a' : 'primary.light' },
              '&.Mui-disabled': {
                bgcolor: alpha(theme.palette.text.primary, 0.12),
                color: 'text.disabled',
              },
            }}
          >
            SKICKA
          </Button>
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

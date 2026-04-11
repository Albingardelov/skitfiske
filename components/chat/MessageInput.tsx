'use client';

import { useState, useRef } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import { Camera, Send } from 'lucide-react';

interface Props {
  onSend: (content: string | null, imageFile: File | null) => void;
  disabled?: boolean;
}

export default function MessageInput({ onSend, disabled }: Props) {
  const [text, setText] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
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
      alert('Bilden får max vara 5MB.');
      return;
    }
    setImageFile(file);
  }

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'flex-end',
        gap: 1,
        p: 1,
        borderTop: '1px solid rgba(255,255,255,0.1)',
        bgcolor: 'background.paper',
        pb: 'calc(8px + env(safe-area-inset-bottom))',
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
        sx={{ color: imageFile ? 'primary.main' : 'text.secondary' }}
        aria-label="Välj bild"
      >
        <Camera size={24} />
      </IconButton>
      <TextField
        fullWidth
        multiline
        maxRows={4}
        placeholder={imageFile ? `Bild: ${imageFile.name}` : 'Skriv ett meddelande...'}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        variant="outlined"
        size="small"
      />
      <IconButton
        onClick={handleSend}
        disabled={!canSend}
        sx={{ color: canSend ? 'primary.main' : 'text.secondary' }}
        aria-label="Skicka"
      >
        <Send size={24} />
      </IconButton>
    </Box>
  );
}

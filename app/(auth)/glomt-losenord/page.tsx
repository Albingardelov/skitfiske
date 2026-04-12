'use client';

import { useState } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Link from '@mui/material/Link';
import NextLink from 'next/link';
import Image from 'next/image';
import { alpha } from '@mui/material/styles';
import { createClient } from '@/lib/supabase/client';
import ColorModeMenuButton from '@/components/theme/ColorModeMenuButton';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/uppdatera-losenord`,
    });

    setLoading(false);

    if (error) {
      setError('Något gick fel. Försök igen.');
      return;
    }

    setSuccess(true);
  }

  if (success) {
    return (
      <Box
        sx={{
          minHeight: '100dvh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: 2,
          bgcolor: 'transparent',
        }}
      >
        <Alert severity="success" sx={{ maxWidth: 420, width: '100%', borderRadius: 3 }}>
          Vi har skickat en återställningslänk till din e-post.
        </Alert>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
        py: 4,
        bgcolor: 'transparent',
      }}
    >
      <Image
        src="/logo.png"
        alt="Skitfiske"
        width={160}
        height={160}
        style={{ marginBottom: 12, width: 140, height: 'auto' }}
      />
      <Typography variant="h4" sx={{ mb: 1, textAlign: 'center', letterSpacing: '-0.03em' }}>
        Glömt lösenord?
      </Typography>
      <Typography
        variant="body2"
        sx={{ mb: 3, color: 'text.secondary', textAlign: 'center', maxWidth: 340 }}
      >
        Ange din e-postadress så skickar vi en återställningslänk.
      </Typography>

      <Paper
        elevation={0}
        sx={{
          width: '100%',
          maxWidth: 420,
          p: { xs: 2.5, sm: 3 },
          borderRadius: 4,
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: (t) => alpha(t.palette.background.paper, t.palette.mode === 'light' ? 0.88 : 0.65),
          backdropFilter: 'blur(12px)',
        }}
      >
        <Box component="form" onSubmit={handleSubmit}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <TextField
            fullWidth
            label="E-postadress"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            variant="filled"
            sx={{ mb: 3 }}
          />

          <Button type="submit" variant="contained" fullWidth disabled={loading} sx={{ mb: 2 }}>
            {loading ? 'Skickar...' : 'Skicka återställningslänk'}
          </Button>

          <Link component={NextLink} href="/login" color="primary" sx={{ fontSize: '0.875rem' }}>
            Tillbaka till inloggning
          </Link>
        </Box>
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
        <ColorModeMenuButton aria-label="Välj ljust eller mörkt läge" sx={{ ml: 0 }} />
      </Box>
    </Box>
  );
}

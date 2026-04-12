'use client';

import { useState } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Link from '@mui/material/Link';
import NextLink from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';

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
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: 3,
          bgcolor: 'transparent',
        }}
      >
        <Alert severity="success" sx={{ maxWidth: 400, width: '100%' }}>
          Vi har skickat en återställningslänk till din e-post.
        </Alert>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        px: 3,
        bgcolor: 'transparent',
      }}
    >
      <Image
        src="/logo.svg"
        alt="Skitfiske"
        width={168}
        height={68}
        style={{ marginBottom: 12 }}
      />
      <Typography variant="h4" sx={{ mb: 1.5, textAlign: 'center', letterSpacing: '-0.03em' }}>
        Glömt lösenord?
      </Typography>
      <Typography
        variant="body1"
        sx={{ mb: 4, color: 'text.secondary', textAlign: 'center', maxWidth: 320 }}
      >
        Ange din e-postadress så skickar vi en återställningslänk.
      </Typography>

      <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%', maxWidth: 400 }}>
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
          sx={{ mb: 3 }}
        />

        <Button type="submit" variant="contained" fullWidth disabled={loading} sx={{ mb: 3 }}>
          {loading ? 'Skickar...' : 'Skicka återställningslänk'}
        </Button>

        <Link component={NextLink} href="/login" color="primary">
          Tillbaka till inloggning
        </Link>
      </Box>
    </Box>
  );
}

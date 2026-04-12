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

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Lösenorden matchar inte.');
      return;
    }

    if (password.length < 6) {
      setError('Lösenordet måste vara minst 6 tecken.');
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
      },
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
          Konto skapat! Kontrollera din e-post för en bekräftelselänk.
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
        src="/logo.svg"
        alt="Skitfiske"
        width={160}
        height={160}
        unoptimized
        style={{ marginBottom: 12, width: 140, height: 'auto' }}
      />
      <Typography variant="h4" sx={{ mb: 0.5, textAlign: 'center', letterSpacing: '-0.03em' }}>
        Skapa konto
      </Typography>
      <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary', textAlign: 'center', maxWidth: 360 }}>
        Bli medlem och få tillgång till loggbok, karta och chatt.
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
            label="Namn"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoComplete="name"
            variant="filled"
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="E-postadress"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            variant="filled"
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Lösenord"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
            variant="filled"
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Bekräfta lösenord"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            autoComplete="new-password"
            variant="filled"
            sx={{ mb: 3 }}
          />

          <Button type="submit" variant="contained" fullWidth disabled={loading} sx={{ mb: 2 }}>
            {loading ? 'Skapar konto...' : 'Registrera dig'}
          </Button>

          <Link component={NextLink} href="/login" color="primary" sx={{ fontSize: '0.875rem' }}>
            Har du redan ett konto? Logga in
          </Link>
        </Box>
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
        <ColorModeMenuButton aria-label="Välj ljust eller mörkt läge" sx={{ ml: 0 }} />
      </Box>
    </Box>
  );
}

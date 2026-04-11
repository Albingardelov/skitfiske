'use client';

import { useState } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Link from '@mui/material/Link';
import NextLink from 'next/link';
import { createClient } from '@/lib/supabase/client';

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
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: 3,
          bgcolor: 'background.default',
        }}
      >
        <Alert severity="success" sx={{ maxWidth: 400, width: '100%' }}>
          Konto skapat! Kontrollera din e-post för en bekräftelselänk.
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
        bgcolor: 'background.default',
      }}
    >
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 700 }}>
        Skapa konto
      </Typography>

      <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%', maxWidth: 400 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <TextField fullWidth label="Namn" value={name} onChange={(e) => setName(e.target.value)} required autoComplete="name" sx={{ mb: 2 }} />
        <TextField fullWidth label="E-postadress" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" sx={{ mb: 2 }} />
        <TextField fullWidth label="Lösenord" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="new-password" sx={{ mb: 2 }} />
        <TextField fullWidth label="Bekräfta lösenord" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required autoComplete="new-password" sx={{ mb: 3 }} />

        <Button type="submit" variant="contained" fullWidth disabled={loading} sx={{ mb: 3 }}>
          {loading ? 'Skapar konto...' : 'Registrera dig'}
        </Button>

        <Link component={NextLink} href="/login" color="primary">
          Har du redan ett konto? Logga in
        </Link>
      </Box>
    </Box>
  );
}

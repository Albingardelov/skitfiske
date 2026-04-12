'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Link from '@mui/material/Link';
import NextLink from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError('Felaktig e-postadress eller lösenord.');
      setLoading(false);
      return;
    }

    router.push('/hem');
    router.refresh();
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
        width={168}
        height={68}
        style={{ marginBottom: 12 }}
      />
      <Typography variant="h4" sx={{ mb: 0.5, textAlign: 'center', letterSpacing: '-0.03em' }}>
        Logga in
      </Typography>
      <Typography variant="body2" sx={{ mb: 0.5, color: 'text.secondary', textAlign: 'center', maxWidth: 340 }}>
        Fångster, karta och klubbchatt — allt på ett ställe.
      </Typography>
      <Typography variant="caption" sx={{ mb: 3, color: 'text.secondary', textAlign: 'center', opacity: 0.9 }}>
        Endast för medlemmar i klubben
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
          bgcolor: 'rgba(18, 26, 28, 0.65)',
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
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Lösenord"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            variant="filled"
            sx={{ mb: 3 }}
          />

          <Button type="submit" variant="contained" color="primary" fullWidth disabled={loading} sx={{ mb: 2 }}>
            {loading ? 'Loggar in...' : 'Logga in'}
          </Button>

          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              justifyContent: 'space-between',
              gap: 1.5,
            }}
          >
            <Link component={NextLink} href="/registrera" color="primary" sx={{ fontSize: '0.875rem' }}>
              Registrera dig
            </Link>
            <Link component={NextLink} href="/glomt-losenord" color="primary" sx={{ fontSize: '0.875rem' }}>
              Glömt lösenord?
            </Link>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}

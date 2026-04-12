'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import { ArrowLeft, Building2, KeyRound } from 'lucide-react';
import { useClub } from '@/contexts/ClubContext';
import { stickyBarSurfaceSx } from '@/lib/appChrome';

export default function KlubbPage() {
  const router = useRouter();
  const { memberships, activeClub, activeClubId, setActiveClubId, createClub, joinClub } = useClub();
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const activeRole = memberships.find((m) => m.club.id === activeClubId)?.role;

  async function onCreate() {
    if (name.trim().length < 2) return;
    setBusy(true);
    setErr(null);
    try {
      await createClub(name.trim());
      setName('');
      router.push('/hem');
    } catch {
      setErr('Kunde inte skapa klubben. Försök igen.');
    } finally {
      setBusy(false);
    }
  }

  async function onJoin() {
    if (!code.trim()) return;
    setBusy(true);
    setErr(null);
    try {
      await joinClub(code.trim());
      setCode('');
      router.push('/hem');
    } catch {
      setErr('Kontrollera koden — den kan vara fel eller du är redan medlem.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Box sx={{ pb: 4 }}>
      <Box
        sx={[
          stickyBarSurfaceSx,
          {
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            px: 1,
            py: 1,
          },
        ]}
      >
        <IconButton onClick={() => router.push('/hem')} aria-label="Tillbaka">
          <ArrowLeft size={24} />
        </IconButton>
        <Typography variant="h6">Fiskeklubb</Typography>
      </Box>

      <Box sx={{ px: 2, display: 'flex', flexDirection: 'column', gap: 2.5, pt: 2 }}>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Varje klubb har egen loggbok och kanaler. Skapa en ny eller gå med med en kod från
          klubbens administratör.
        </Typography>

        {err && (
          <Alert severity="error" onClose={() => setErr(null)}>
            {err}
          </Alert>
        )}

        {memberships.length > 0 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <FormControl fullWidth>
              <InputLabel id="active-club-label">Aktiv klubb</InputLabel>
              <Select
                labelId="active-club-label"
                label="Aktiv klubb"
                value={activeClubId ?? ''}
                onChange={(e) => setActiveClubId(e.target.value as string)}
              >
                {memberships.map((m) => (
                  <MenuItem key={m.club.id} value={m.club.id}>
                    {m.club.name}
                    {m.role === 'admin' ? ' (admin)' : ''}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {activeClub && activeRole === 'admin' && (
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  bgcolor: 'action.hover',
                }}
              >
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                  Inbjudningskod (dela med medlemmar)
                </Typography>
                <Typography
                  variant="h5"
                  sx={{ fontFeatureSettings: '"tnum"', letterSpacing: '0.2em', mt: 0.5 }}
                >
                  {activeClub.invite_code}
                </Typography>
              </Box>
            )}
          </Box>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Building2 size={20} aria-hidden />
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              Skapa ny klubb
            </Typography>
          </Box>
          <TextField
            label="Klubbnamn"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            placeholder="t.ex. Norra Mälarens FVO"
          />
          <Button
            variant="contained"
            onClick={onCreate}
            disabled={busy || name.trim().length < 2}
            startIcon={busy ? <CircularProgress size={16} color="inherit" /> : undefined}
          >
            Skapa klubb
          </Button>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <KeyRound size={20} aria-hidden />
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              Gå med med kod
            </Typography>
          </Box>
          <TextField
            label="Inbjudningskod"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            fullWidth
            placeholder="Sex tecken"
            slotProps={{ htmlInput: { maxLength: 12 } }}
          />
          <Button
            variant="outlined"
            onClick={onJoin}
            disabled={busy || !code.trim()}
            startIcon={busy ? <CircularProgress size={16} /> : undefined}
          >
            Gå med
          </Button>
        </Box>

        {memberships.length > 0 && (
          <Button variant="text" onClick={() => router.push('/hem')} fullWidth>
            Tillbaka till hemmet
          </Button>
        )}
      </Box>
    </Box>
  );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
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
import { supabaseErrorMessage } from '@/lib/supabase/errorMessage';

const fieldReadableSx = {
  '& .MuiOutlinedInput-root': {
    color: 'text.primary',
  },
  '& .MuiInputLabel-root': {
    color: 'text.secondary',
  },
  '& .MuiInputLabel-root.Mui-focused': {
    color: 'primary.main',
  },
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: 'divider',
  },
  '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: 'primary.light',
  },
  '& .MuiOutlinedInput-input::placeholder': {
    opacity: 1,
    color: 'text.secondary',
  },
} as const;

export default function KlubbPage() {
  const theme = useTheme();
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
    } catch (e) {
      setErr(
        supabaseErrorMessage(e, 'Kunde inte skapa klubben. Försök igen.')
      );
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
    } catch (e) {
      setErr(
        supabaseErrorMessage(
          e,
          'Kontrollera koden — den kan vara fel eller du är redan medlem.'
        )
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <Box
      sx={{
        pb: 4,
        minHeight: '100%',
        bgcolor: 'background.default',
        color: 'text.primary',
      }}
    >
      <Box
        sx={[
          stickyBarSurfaceSx,
          {
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            px: 1,
            py: 1,
            color: 'text.primary',
            '& .MuiIconButton-root': { color: 'text.primary' },
          },
        ]}
      >
        <IconButton onClick={() => router.push('/hem')} aria-label="Tillbaka">
          <ArrowLeft size={24} />
        </IconButton>
        <Typography variant="h6" sx={{ color: 'text.primary' }}>
          Fiskeklubb
        </Typography>
      </Box>

      <Box sx={{ px: 2, display: 'flex', flexDirection: 'column', gap: 2.5, pt: 2 }}>
        <Typography variant="body2" sx={{ color: 'text.primary', opacity: 0.88, lineHeight: 1.5 }}>
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
            <FormControl fullWidth sx={{ '& .MuiInputLabel-root': { color: 'text.secondary' } }}>
              <InputLabel id="active-club-label">Aktiv klubb</InputLabel>
              <Select
                labelId="active-club-label"
                label="Aktiv klubb"
                value={activeClubId ?? ''}
                onChange={(e) => setActiveClubId(e.target.value as string)}
                sx={{
                  color: 'text.primary',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'divider' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'primary.light' },
                  '& .MuiSvgIcon-root': { color: 'text.secondary' },
                }}
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
                <Typography variant="caption" sx={{ color: 'text.primary', opacity: 0.75, fontWeight: 600 }}>
                  Inbjudningskod (dela med medlemmar)
                </Typography>
                <Typography
                  variant="h5"
                  sx={{
                    fontFeatureSettings: '"tnum"',
                    letterSpacing: '0.2em',
                    mt: 0.5,
                    color: 'primary.light',
                  }}
                >
                  {activeClub.invite_code}
                </Typography>
              </Box>
            )}
          </Box>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'primary.main' }}>
            <Building2 size={20} strokeWidth={2} aria-hidden />
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary' }}>
              Skapa ny klubb
            </Typography>
          </Box>
          <TextField
            label="Klubbnamn"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            placeholder="t.ex. Norra Mälarens FVO"
            sx={fieldReadableSx}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={onCreate}
            disabled={busy || name.trim().length < 2}
            startIcon={busy ? <CircularProgress size={16} sx={{ color: 'primary.contrastText' }} /> : undefined}
            sx={{
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              '&:hover': { bgcolor: 'primary.light' },
              '&.Mui-disabled': {
                bgcolor: theme.palette.action.disabledBackground,
                color: theme.palette.action.disabled,
              },
            }}
          >
            Skapa klubb
          </Button>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'primary.main' }}>
            <KeyRound size={20} strokeWidth={2} aria-hidden />
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary' }}>
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
            sx={fieldReadableSx}
          />
          <Button
            variant="outlined"
            color="primary"
            onClick={onJoin}
            disabled={busy || !code.trim()}
            startIcon={
              busy ? <CircularProgress size={16} sx={{ color: 'primary.main' }} /> : undefined
            }
            sx={{
              color: 'primary.light',
              borderColor: 'primary.light',
              borderWidth: 2,
              '&:hover': {
                borderColor: 'primary.main',
                bgcolor: 'rgba(169, 208, 175, 0.12)',
              },
            }}
          >
            Gå med
          </Button>
        </Box>

        {memberships.length > 0 && (
          <Button
            variant="text"
            color="primary"
            onClick={() => router.push('/hem')}
            fullWidth
            sx={{ color: 'primary.light' }}
          >
            Tillbaka till hemmet
          </Button>
        )}
      </Box>
    </Box>
  );
}

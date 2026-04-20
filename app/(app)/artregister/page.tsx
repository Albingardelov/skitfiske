// app/(app)/artregister/page.tsx
'use client';

import { useState, useEffect } from 'react';
import NextLink from 'next/link';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import Link from '@mui/material/Link';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { useClub } from '@/contexts/ClubContext';
import { createClient } from '@/lib/supabase/client';
import { fetchClubSpecies, insertClubSpecies, deleteClubSpecies } from '@/lib/supabase/species';
import { GLOBAL_SPECIES } from '@/lib/speciesLatin';
import { stickyBarSurfaceSx, formFieldReadableSx } from '@/lib/appChrome';
import type { ClubSpecies } from '@/types/species';

export default function ArtregisterPage() {
  const router = useRouter();
  const { activeClub } = useClub();
  const [clubSpecies, setClubSpecies] = useState<ClubSpecies[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [addError, setAddError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [snackbar, setSnackbar] = useState<string | null>(null);

  useEffect(() => {
    createClient()
      .auth.getUser()
      .then(({ data }) => setCurrentUserId(data.user?.id ?? null));
  }, []);

  useEffect(() => {
    if (!activeClub) return;
    fetchClubSpecies(activeClub.id)
      .then(setClubSpecies)
      .catch(() => setClubSpecies([]));
  }, [activeClub]);

  async function handleAdd() {
    const trimmed = newName.trim();
    if (!trimmed || !activeClub || !currentUserId) return;

    const exists = [
      ...GLOBAL_SPECIES,
      ...clubSpecies.map((s) => s.name),
    ].some((n) => n.toLowerCase() === trimmed.toLowerCase());

    if (exists) {
      setAddError('Den här arten finns redan i listan.');
      return;
    }

    setIsSaving(true);
    setAddError(null);
    try {
      await insertClubSpecies(activeClub.id, trimmed, currentUserId);
      const updated = await fetchClubSpecies(activeClub.id);
      setClubSpecies(updated);
      setNewName('');
    } catch {
      setSnackbar('Kunde inte lägga till arten. Försök igen.');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteClubSpecies(id);
      setClubSpecies((prev) => prev.filter((s) => s.id !== id));
    } catch {
      setSnackbar('Kunde inte ta bort arten. Försök igen.');
    }
  }

  return (
    <Box sx={{ pb: 10, minHeight: '100%', bgcolor: 'background.default', color: 'text.primary' }}>
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
        <IconButton onClick={() => router.back()} aria-label="Tillbaka">
          <ArrowLeft size={24} />
        </IconButton>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="h6" sx={{ color: 'text.primary' }}>
            Artregister
          </Typography>
          {activeClub && (
            <Typography variant="caption" sx={{ color: 'text.primary', opacity: 0.75, display: 'block' }}>
              {activeClub.name}
            </Typography>
          )}
        </Box>
      </Box>

      <Box sx={{ px: 2, pt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
        {!activeClub && (
          <Typography variant="body2" sx={{ color: 'error.light' }}>
            <Link component={NextLink} href="/klubb" underline="always" sx={{ color: 'error.light', fontWeight: 600 }}>
              Skapa eller gå med i en klubb
            </Link>{' '}
            för att se och hantera artregistret.
          </Typography>
        )}

        {/* Globala arter */}
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary', fontWeight: 700, letterSpacing: '0.04em', fontSize: '0.75rem', textTransform: 'uppercase' }}>
            Globala arter
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {[...GLOBAL_SPECIES].sort((a, b) => a.localeCompare(b, 'sv')).map((name) => (
              <Chip
                key={name}
                label={name}
                size="small"
                sx={{ bgcolor: 'action.selected', color: 'text.primary' }}
              />
            ))}
          </Box>
        </Box>

        {/* Klubbens egna arter */}
        {activeClub && (
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary', fontWeight: 700, letterSpacing: '0.04em', fontSize: '0.75rem', textTransform: 'uppercase' }}>
              {activeClub.name}s arter
            </Typography>
            {clubSpecies.length === 0 ? (
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Inga egna arter ännu.
              </Typography>
            ) : (
              <Box sx={{ borderRadius: 2, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
                {clubSpecies.map((s, i) => (
                  <Box
                    key={s.id}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      px: 2,
                      py: 1.25,
                      bgcolor: i % 2 === 0 ? 'background.paper' : 'rgba(255,255,255,0.02)',
                      borderBottom: i < clubSpecies.length - 1 ? '1px solid' : 'none',
                      borderColor: 'divider',
                    }}
                  >
                    <Typography sx={{ flex: 1, fontSize: '0.9rem', color: 'text.primary' }}>
                      {s.name}
                    </Typography>
                    {s.created_by === currentUserId && (
                      <IconButton
                        size="small"
                        aria-label={`Ta bort ${s.name}`}
                        onClick={() => handleDelete(s.id)}
                        sx={{ color: 'text.secondary', '&:hover': { color: 'error.light' } }}
                      >
                        <Trash2 size={16} />
                      </IconButton>
                    )}
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        )}

        {/* Lägg till ny art */}
        {activeClub && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography variant="subtitle2" sx={{ color: 'text.secondary', fontWeight: 700, letterSpacing: '0.04em', fontSize: '0.75rem', textTransform: 'uppercase' }}>
              Lägg till art
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                label="Artnamn"
                value={newName}
                onChange={(e) => { setNewName(e.target.value); setAddError(null); }}
                onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); }}
                fullWidth
                error={Boolean(addError)}
                helperText={addError}
                sx={formFieldReadableSx}
              />
              <Button
                variant="contained"
                onClick={handleAdd}
                disabled={!newName.trim() || isSaving}
                sx={{
                  flexShrink: 0,
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  '&:hover': { bgcolor: 'primary.light' },
                  '&.Mui-disabled': { bgcolor: 'action.disabledBackground', color: 'action.disabled' },
                }}
              >
                {isSaving ? <CircularProgress size={20} sx={{ color: 'primary.contrastText' }} /> : 'Lägg till'}
              </Button>
            </Box>
          </Box>
        )}
      </Box>

      <Snackbar
        open={Boolean(snackbar)}
        autoHideDuration={6000}
        onClose={() => setSnackbar(null)}
        message={snackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  );
}

// components/logbok/SpeciesAutocomplete.tsx
'use client';

import { useState, useEffect } from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import Box from '@mui/material/Box';
import NextLink from 'next/link';
import { fetchClubSpecies } from '@/lib/supabase/species';
import { allSpeciesNames } from '@/lib/species';
import { formFieldReadableSx } from '@/lib/appChrome';

interface Props {
  value: string;
  onChange: (v: string) => void;
  clubId: string | null;
}

export default function SpeciesAutocomplete({ value, onChange, clubId }: Props) {
  const [options, setOptions] = useState<string[]>(() => allSpeciesNames([]));

  useEffect(() => {
    if (!clubId) {
      setOptions(allSpeciesNames([]));
      return;
    }
    fetchClubSpecies(clubId)
      .then((cs) => setOptions(allSpeciesNames(cs)))
      .catch(() => setOptions(allSpeciesNames([])));
  }, [clubId]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
      <Autocomplete
        options={options}
        value={value || null}
        onChange={(_, v) => onChange(v ?? '')}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Art *"
            fullWidth
            sx={formFieldReadableSx}
          />
        )}
        noOptionsText="Ingen art hittades"
        sx={{
          '& .MuiAutocomplete-popupIndicator': { color: 'text.secondary' },
          '& .MuiAutocomplete-clearIndicator': { color: 'text.secondary' },
        }}
      />
      <Typography variant="caption" sx={{ color: 'text.secondary', pl: 0.25 }}>
        <Link
          component={NextLink}
          href="/artregister"
          underline="always"
          sx={{ color: 'primary.light' }}
        >
          Saknas din art? Lägg till den →
        </Link>
      </Typography>
    </Box>
  );
}

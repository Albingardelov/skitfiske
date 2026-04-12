// app/(app)/logbok/ny/page.tsx
'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import { ArrowLeft, MapPin, Camera } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { insertCatch, uploadCatchImage } from '@/lib/supabase/catches';
import { stickyBarSurfaceSx } from '@/lib/appChrome';

function getLocalDatetimeString() {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 16);
}

function NyFangstForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [species, setSpecies] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [lengthCm, setLengthCm] = useState('');
  const [caughtAt, setCaughtAt] = useState(getLocalDatetimeString());
  const [bait, setBait] = useState('');
  const [locationText, setLocationText] = useState('');
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  useEffect(() => {
    const qLat = searchParams.get('lat');
    const qLng = searchParams.get('lng');
    if (qLat && qLng) {
      const lat = parseFloat(qLat);
      const lng = parseFloat(qLng);
      if (!isNaN(lat) && !isNaN(lng)) {
        setLat(lat);
        setLng(lng);
        setLocationText('Karta-position');
      }
    }
  }, [searchParams]);

  const parsedWeight = parseFloat(weightKg);
  const parsedLength = parseFloat(lengthCm);
  const canSave =
    species.trim().length > 0 &&
    !isNaN(parsedWeight) && parsedWeight > 0 &&
    !isNaN(parsedLength) && parsedLength > 0 &&
    caughtAt.length > 0 &&
    !isSaving;

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('Bilden får max vara 5MB.');
      return;
    }
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  function handleGetGps() {
    if (!navigator.geolocation) {
      setGpsError('GPS stöds inte av din enhet.');
      return;
    }
    setGpsLoading(true);
    setGpsError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude);
        setLng(pos.coords.longitude);
        setLocationText('GPS-position');
        setGpsLoading(false);
      },
      () => {
        setGpsError('Kunde inte hämta position. Kontrollera att appen har tillstånd att använda platsinformation.');
        setGpsLoading(false);
      },
      { timeout: 10000 }
    );
  }

  async function handleSubmit() {
    if (!canSave) return;
    setIsSaving(true);

    try {
      const supabase = createClient();
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Inte inloggad');

      let imageUrl: string | null = null;
      if (imageFile) {
        imageUrl = await uploadCatchImage(userData.user.id, imageFile);
      }

      await insertCatch({
        user_id: userData.user.id,
        full_name: userData.user.user_metadata?.full_name ?? 'Anonym',
        species: species.trim(),
        weight_kg: parsedWeight,
        length_cm: parsedLength,
        bait: bait.trim() || null,
        location_text: locationText.trim() || null,
        lat,
        lng,
        image_url: imageUrl,
        caught_at: new Date(caughtAt).toISOString(),
      });

      setIsSaving(false);
      router.push('/logbok');
    } catch {
      alert('Kunde inte spara fångsten. Försök igen.');
      setIsSaving(false);
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
        <IconButton onClick={() => router.push('/logbok')} aria-label="Tillbaka">
          <ArrowLeft size={24} />
        </IconButton>
        <Typography variant="h6">Registrera fångst</Typography>
      </Box>

      <Box sx={{ px: 2, display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
        <TextField
          label="Art *"
          value={species}
          onChange={(e) => setSpecies(e.target.value)}
          fullWidth
        />
        <TextField
          label="Vikt (kg) *"
          type="number"
          slotProps={{ htmlInput: { step: '0.001', min: '0' } }}
          value={weightKg}
          onChange={(e) => setWeightKg(e.target.value)}
          fullWidth
        />
        <TextField
          label="Längd (cm) *"
          type="number"
          slotProps={{ htmlInput: { step: '0.1', min: '0' } }}
          value={lengthCm}
          onChange={(e) => setLengthCm(e.target.value)}
          fullWidth
        />
        <TextField
          label="Bete"
          value={bait}
          onChange={(e) => setBait(e.target.value)}
          fullWidth
          placeholder="t.ex. Rapala, mask, fluga"
        />
        <TextField
          label="Datum & tid *"
          type="datetime-local"
          value={caughtAt}
          onChange={(e) => setCaughtAt(e.target.value)}
          fullWidth
          slotProps={{ inputLabel: { shrink: true } }}
        />

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={gpsLoading ? <CircularProgress size={16} /> : <MapPin size={16} />}
            onClick={handleGetGps}
            disabled={gpsLoading}
            fullWidth
          >
            {lat ? 'GPS-position hämtad' : 'Hämta GPS-position'}
          </Button>
          {gpsError && (
            <Typography variant="caption" sx={{ color: 'error.main' }}>
              {gpsError}
            </Typography>
          )}
          <TextField
            label="Plats (fritext)"
            value={locationText}
            onChange={(e) => setLocationText(e.target.value)}
            fullWidth
            placeholder="t.ex. Mälaren, norra stranden"
          />
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
          <Button
            variant="outlined"
            startIcon={<Camera size={16} />}
            onClick={() => fileInputRef.current?.click()}
            fullWidth
          >
            {imageFile ? imageFile.name : 'Välj bild'}
          </Button>
          {imagePreview && (
            <Box
              component="img"
              src={imagePreview}
              alt="Förhandsvisning"
              sx={{
                width: '100%',
                maxHeight: 200,
                objectFit: 'cover',
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
              }}
            />
          )}
        </Box>

        <Button
          variant="contained"
          fullWidth
          disabled={!canSave}
          onClick={handleSubmit}
          sx={{ mt: 1 }}
        >
          {isSaving ? <CircularProgress size={24} color="inherit" /> : 'Spara fångst'}
        </Button>
      </Box>
    </Box>
  );
}

export default function NyFangstPage() {
  return (
    <Suspense>
      <NyFangstForm />
    </Suspense>
  );
}

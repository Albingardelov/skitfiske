// app/(app)/logbok/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Modal from '@mui/material/Modal';
import { ArrowLeft, Map } from 'lucide-react';
import { fetchCatch } from '@/lib/supabase/catches';
import { stickyBarSurfaceSx } from '@/lib/appChrome';
import type { Catch } from '@/types/catch';

export default function FangstDetailPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [catch_, setCatch_] = useState<Catch | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    fetchCatch(id)
      .then(setCatch_)
      .catch(() => setCatch_(null))
      .finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 64px)' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!catch_) {
    return (
      <Box sx={{ px: 2, pt: 3 }}>
        <IconButton onClick={() => router.back()} aria-label="Tillbaka">
          <ArrowLeft size={24} />
        </IconButton>
        <Typography variant="body1" sx={{ mt: 2 }}>
          Fångsten hittades inte.
        </Typography>
      </Box>
    );
  }

  const date = new Date(catch_.caught_at).toLocaleString('sv-SE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

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
        <IconButton onClick={() => router.back()} aria-label="Tillbaka">
          <ArrowLeft size={24} />
        </IconButton>
        <Typography variant="h6">{catch_.species}</Typography>
      </Box>

      {catch_.image_url && (
        <>
          <Box
            component="img"
            src={catch_.image_url}
            alt={catch_.species}
            onClick={() => setLightboxOpen(true)}
            sx={{ width: '100%', maxHeight: 300, objectFit: 'cover', cursor: 'zoom-in' }}
          />
          <Modal open={lightboxOpen} onClose={() => setLightboxOpen(false)}>
            <Box
              onClick={() => setLightboxOpen(false)}
              sx={{
                position: 'fixed',
                inset: 0,
                bgcolor: 'rgba(0,0,0,0.9)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Box
                component="img"
                src={catch_.image_url}
                alt={catch_.species}
                sx={{ maxWidth: '95vw', maxHeight: '90vh', objectFit: 'contain', borderRadius: 1 }}
              />
            </Box>
          </Modal>
        </>
      )}

      <Box sx={{ px: 2, pt: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <Typography
          variant="overline"
          sx={{ color: 'text.secondary', fontWeight: 600, letterSpacing: '0.12em' }}
        >
          Fångst
        </Typography>
        <Typography variant="h4" sx={{ letterSpacing: '-0.03em', lineHeight: 1.2 }}>
          {catch_.species}
        </Typography>
        <Typography variant="body1" sx={{ fontFeatureSettings: '"tnum"', fontWeight: 500 }}>
          {catch_.weight_kg} kg · {catch_.length_cm} cm
        </Typography>
        {catch_.bait && (
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Bete: {catch_.bait}
          </Typography>
        )}
        {catch_.location_text && (
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {catch_.location_text}
          </Typography>
        )}
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {date}
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {catch_.full_name}
        </Typography>

        {catch_.lat !== null && catch_.lng !== null && (
          <Button
            variant="outlined"
            startIcon={<Map size={16} />}
            onClick={() => router.push(`/karta?lat=${catch_.lat}&lng=${catch_.lng}`)}
            sx={{ mt: 1, alignSelf: 'flex-start' }}
          >
            Visa på karta
          </Button>
        )}
      </Box>
    </Box>
  );
}

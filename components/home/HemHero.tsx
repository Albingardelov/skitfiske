'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { Plus } from 'lucide-react';
import { hemTheme } from '@/lib/hemTheme';

/** Dim sjö/skog — högupplöst via Unsplash (får användas enligt licens). */
const HERO_IMAGE =
  'https://images.unsplash.com/photo-1439066615861-d1af74d74000?auto=format&fit=crop&w=1400&q=80';

interface Props {
  firstName: string;
}

export default function HemHero({ firstName }: Props) {
  const router = useRouter();
  const greeting = firstName ? `Tight lines, ${firstName}!` : 'Tight lines!';

  return (
    <Box
      sx={{
        position: 'relative',
        mx: 2,
        mt: 2,
        borderRadius: '24px',
        overflow: 'hidden',
        minHeight: { xs: 300, sm: 340 },
        maxHeight: 420,
        boxShadow: '0 16px 48px rgba(27, 48, 34, 0.18)',
      }}
    >
      <Image
        src={HERO_IMAGE}
        alt=""
        fill
        priority
        sizes="(max-width: 600px) 100vw, 520px"
        style={{ objectFit: 'cover', objectPosition: 'center 35%' }}
      />
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(
            180deg,
            rgba(15, 25, 20, 0.15) 0%,
            rgba(15, 25, 20, 0.25) 35%,
            rgba(12, 22, 18, 0.82) 100%
          )`,
        }}
      />
      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
          height: '100%',
          minHeight: { xs: 300, sm: 340 },
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          alignItems: 'flex-start',
          p: { xs: 2.25, sm: 3 },
          textAlign: 'left',
        }}
      >
        <Typography
          component="h1"
          sx={{
            fontFamily: 'var(--font-display-editorial), Georgia, serif',
            fontWeight: 700,
            fontSize: { xs: '1.85rem', sm: '2.15rem' },
            lineHeight: 1.15,
            letterSpacing: '-0.02em',
            color: '#fff',
            textShadow: '0 2px 24px rgba(0,0,0,0.35)',
            mb: 1.25,
          }}
        >
          {greeting}
        </Typography>
        <Typography
          sx={{
            fontSize: '0.9375rem',
            lineHeight: 1.5,
            color: 'rgba(255,255,255,0.92)',
            maxWidth: 320,
            mb: 2.5,
            textShadow: '0 1px 12px rgba(0,0,0,0.4)',
          }}
        >
          Vinden har lagt sig — perfekt dag att testa vassen. Gäddan brukar hugga när ytan
          står stilla.
        </Typography>
        <Button
          variant="contained"
          disableElevation
          startIcon={<Plus size={20} strokeWidth={2.5} />}
          onClick={() => router.push('/logbok/ny')}
          sx={{
            borderRadius: 999,
            px: 2.5,
            py: 1.25,
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '0.9375rem',
            bgcolor: hemTheme.forest,
            color: '#fff',
            '&:hover': {
              bgcolor: hemTheme.forestHover,
            },
          }}
        >
          Logga fångst
        </Button>
      </Box>
    </Box>
  );
}

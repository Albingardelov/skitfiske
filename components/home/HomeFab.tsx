'use client';

import { useRouter } from 'next/navigation';
import Fab from '@mui/material/Fab';
import { Plus } from 'lucide-react';

/** Koppar/mässing — primär flytande åtgärd på hem (mockup). */
export default function HomeFab() {
  const router = useRouter();

  return (
    <Fab
      aria-label="Ny fångst"
      onClick={() => router.push('/logbok/ny')}
      sx={{
        position: 'fixed',
        right: 20,
        bottom: 'calc(96px + env(safe-area-inset-bottom, 0px))',
        zIndex: 1050,
        width: 56,
        height: 56,
        background: 'linear-gradient(145deg, #d4a574 0%, #a67c52 45%, #8b5a2b 100%)',
        color: '#fff',
        boxShadow: '0 10px 28px rgba(0,0,0,0.2)',
        '&:hover': {
          background: 'linear-gradient(145deg, #e0b588 0%, #b88a62 45%, #9c6635 100%)',
        },
      }}
    >
      <Plus size={28} strokeWidth={2.5} />
    </Fab>
  );
}

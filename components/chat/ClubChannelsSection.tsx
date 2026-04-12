'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import ButtonBase from '@mui/material/ButtonBase';
import { Fish, Users, Waves } from 'lucide-react';
import { useTheme } from '@mui/material/styles';
import { expedition } from '@/lib/theme/expeditionTokens';
import { hemTheme } from '@/lib/hemTheme';
import type { Channel } from '@/types/chat';

interface Props {
  channels: Channel[];
  activeChannelId: string;
  onChannelChange: (channelId: string) => void;
  /** Sista raden under aktiv kanal (t.ex. sista meddelandet). */
  messagePreview: string | null;
}

export default function ClubChannelsSection({
  channels,
  activeChannelId,
  onChannelChange,
  messagePreview,
}: Props) {
  const theme = useTheme();
  const isLight = theme.palette.mode === 'light';
  const active = channels.find((c) => c.id === activeChannelId);
  const others = channels.filter((c) => c.id !== activeChannelId).slice(0, 2);
  const forest = isLight ? expedition.forest : theme.palette.primary.dark;
  const sand = isLight ? '#F0E3D2' : 'rgba(255,255,255,0.08)';
  const featuredBg = isLight ? '#ECEAE6' : 'rgba(255,255,255,0.06)';

  if (!active) return null;

  return (
    <Box
      sx={{
        px: 2,
        pt: 2,
        pb: 1.5,
        flexShrink: 0,
        bgcolor: isLight ? expedition.canvasWarm : 'background.default',
      }}
    >
      <Typography
        sx={{
          fontFamily: 'var(--font-newsreader), Georgia, serif',
          fontStyle: 'italic',
          fontSize: '0.8rem',
          fontWeight: 500,
          color: hemTheme.rust,
          mb: 0.35,
        }}
      >
        På gång
      </Typography>
      <Typography
        sx={{
          fontFamily: 'var(--font-newsreader), Georgia, serif',
          fontWeight: 700,
          fontSize: '1.35rem',
          letterSpacing: '-0.02em',
          color: 'text.primary',
          mb: 1.5,
        }}
      >
        Klubbkanaler
      </Typography>

      <ButtonBase
        onClick={() => onChannelChange(active.id)}
        focusRipple
        sx={{
          display: 'block',
          width: '100%',
          textAlign: 'left',
          borderRadius: '18px',
          p: 2,
          mb: others.length > 0 ? 1.25 : 0,
          bgcolor: featuredBg,
          color: 'text.primary',
          boxShadow: isLight ? '0 4px 16px rgba(0,0,0,0.05)' : 'none',
          position: 'relative',
        }}
      >
        <Typography
          sx={{
            fontFamily: 'var(--font-work), var(--font-sans), sans-serif',
            fontSize: '0.62rem',
            fontWeight: 700,
            letterSpacing: '0.14em',
            color: hemTheme.rust,
            mb: 0.75,
          }}
        >
          AKTIVT NU
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
          <Box sx={{ minWidth: 0 }}>
            <Typography
              sx={{
                fontFamily: 'var(--font-newsreader), Georgia, serif',
                fontWeight: 700,
                fontSize: '1.05rem',
                mb: 0.5,
              }}
            >
              {active.label}
            </Typography>
            <Typography
              sx={{
                fontFamily: 'var(--font-work), var(--font-sans), sans-serif',
                fontSize: '0.8125rem',
                color: 'text.secondary',
                lineHeight: 1.4,
              }}
            >
              {messagePreview ?? 'Inga meddelanden än — skriv först i kanalen.'}
            </Typography>
          </Box>
          <Box
            sx={{
              flexShrink: 0,
              width: 44,
              height: 44,
              borderRadius: 2,
              bgcolor: isLight ? 'rgba(27,48,34,0.08)' : 'rgba(255,255,255,0.06)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Waves size={24} strokeWidth={1.75} color={forest} aria-hidden />
          </Box>
        </Box>
      </ButtonBase>

      {others.length > 0 && (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: others.length === 1 ? '1fr' : '1fr 1fr',
            gap: 1,
            maxWidth: others.length === 1 ? 280 : 'none',
            mx: others.length === 1 ? 'auto' : 0,
          }}
        >
          {others.map((ch, i) => {
            const isForest = i % 2 === 0;
            const bg = isForest ? forest : sand;
            const fg = isForest ? '#fff' : 'text.primary';
            const subFg = isForest ? 'rgba(255,255,255,0.75)' : 'text.secondary';
            return (
              <ButtonBase
                key={ch.id}
                onClick={() => onChannelChange(ch.id)}
                focusRipple
                sx={{
                  display: 'block',
                  textAlign: 'left',
                  borderRadius: '16px',
                  p: 1.75,
                  minHeight: 120,
                  bgcolor: bg,
                  color: fg,
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  {isForest ? (
                    <Fish size={22} strokeWidth={2} color="#fff" aria-hidden />
                  ) : (
                    <Users size={22} strokeWidth={2} color={expedition.forest} aria-hidden />
                  )}
                </Box>
                <Typography
                  sx={{
                    fontFamily: 'var(--font-newsreader), Georgia, serif',
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    lineHeight: 1.25,
                    mb: 0.75,
                  }}
                >
                  {ch.label}
                </Typography>
                <Typography sx={{ fontFamily: 'var(--font-work), sans-serif', fontSize: '0.65rem', color: subFg }}>
                  {isForest ? 'Tryck för att byta kanal' : 'Öppna kanalen'}
                </Typography>
              </ButtonBase>
            );
          })}
        </Box>
      )}
    </Box>
  );
}

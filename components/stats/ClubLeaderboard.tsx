'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import { alpha, useTheme } from '@mui/material/styles';
import { expedition } from '@/lib/theme/expeditionTokens';
import type { LeaderboardData } from '@/lib/stats/index';

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

interface Props {
  data: LeaderboardData;
}

export default function ClubLeaderboard({ data }: Props) {
  const theme = useTheme();
  const isLight = theme.palette.mode === 'light';

  function sectionLabel(label: string) {
    return (
      <Typography
        sx={{
          fontFamily: 'var(--font-work), var(--font-sans), sans-serif',
          fontSize: '0.625rem',
          fontWeight: 700,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: 'text.secondary',
          mt: 2,
          mb: 0.75,
        }}
      >
        {label}
      </Typography>
    );
  }

  function rowBg(i: number) {
    return i % 2 === 0
      ? isLight ? '#fff' : 'background.paper'
      : isLight ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.02)';
  }

  return (
    <Box sx={{ px: 2, mt: 3, pb: 2 }}>
      <Typography
        sx={{
          fontFamily: 'var(--font-newsreader), Georgia, serif',
          fontWeight: 700,
          fontSize: '1.1rem',
          color: 'text.primary',
          mb: 0.5,
        }}
      >
        Klubben
      </Typography>

      {/* Säsongens topplista */}
      {sectionLabel('Säsongens topplista')}
      <Box sx={{ borderRadius: 2, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
        {data.topList.length === 0 ? (
          <Box sx={{ px: 2, py: 2 }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Inga fångster registrerade i år.
            </Typography>
          </Box>
        ) : (
          data.topList.map((entry, i) => (
            <Box
              key={entry.userId}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                px: 2,
                py: 1.25,
                bgcolor: entry.isCurrentUser
                  ? isLight
                    ? alpha(expedition.forest, 0.07)
                    : alpha(theme.palette.primary.main, 0.12)
                  : rowBg(i),
                borderBottom: i < data.topList.length - 1 ? '1px solid' : 'none',
                borderColor: 'divider',
              }}
            >
              <Typography
                sx={{
                  width: 24,
                  fontFamily: 'var(--font-work), var(--font-sans), sans-serif',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  color: entry.rank <= 3
                    ? isLight ? expedition.forest : 'primary.main'
                    : 'text.secondary',
                  fontFeatureSettings: '"tnum"',
                }}
              >
                {entry.rank}
              </Typography>
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  bgcolor: isLight ? 'rgba(27,48,34,0.1)' : 'rgba(255,255,255,0.1)',
                  color: 'text.primary',
                }}
              >
                {initials(entry.fullName)}
              </Avatar>
              <Typography
                sx={{
                  flex: 1,
                  fontFamily: 'var(--font-work), var(--font-sans), sans-serif',
                  fontSize: '0.875rem',
                  fontWeight: entry.isCurrentUser ? 700 : 500,
                  color: 'text.primary',
                }}
              >
                {entry.fullName.split(' ')[0]}
              </Typography>
              <Typography
                sx={{
                  fontFamily: 'var(--font-work), var(--font-sans), sans-serif',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: 'text.secondary',
                  fontFeatureSettings: '"tnum"',
                }}
              >
                {entry.count}
              </Typography>
            </Box>
          ))
        )}
      </Box>

      {/* Klubbrekord per art */}
      {data.speciesRecords.length > 0 && (
        <>
          {sectionLabel('Klubbrekord per art')}
          <Box sx={{ borderRadius: 2, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
            {data.speciesRecords.map((rec, i) => (
              <Box
                key={rec.species}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  px: 2,
                  py: 1.25,
                  bgcolor: rowBg(i),
                  borderBottom: i < data.speciesRecords.length - 1 ? '1px solid' : 'none',
                  borderColor: 'divider',
                }}
              >
                <Typography
                  sx={{
                    flex: 1,
                    fontFamily: 'var(--font-work), var(--font-sans), sans-serif',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    color: 'text.primary',
                  }}
                >
                  {rec.species}
                </Typography>
                <Typography
                  sx={{
                    fontFamily: 'var(--font-newsreader), Georgia, serif',
                    fontWeight: 700,
                    fontSize: '1.1rem',
                    color: isLight ? expedition.forest : 'primary.main',
                    fontFeatureSettings: '"tnum"',
                  }}
                >
                  {rec.weightKg} kg
                </Typography>
                <Typography
                  sx={{
                    fontFamily: 'var(--font-work), var(--font-sans), sans-serif',
                    fontSize: '0.75rem',
                    color: 'text.secondary',
                    minWidth: 72,
                    textAlign: 'right',
                  }}
                >
                  {rec.fullName.split(' ')[0]}
                </Typography>
              </Box>
            ))}
          </Box>
        </>
      )}

      {/* Senaste stora */}
      {data.recentBig.length > 0 && (
        <>
          {sectionLabel('Senaste stora (30 dagar)')}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {data.recentBig.map((c, i) => (
              <Box
                key={`${c.caughtAt}-${c.fullName}-${i}`}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: isLight ? '#fff' : 'background.paper',
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <Box sx={{ flex: 1 }}>
                  <Typography
                    sx={{
                      fontFamily: 'var(--font-work), var(--font-sans), sans-serif',
                      fontWeight: 600,
                      fontSize: '0.875rem',
                      color: 'text.primary',
                    }}
                  >
                    {c.fullName.split(' ')[0]} · {c.species}
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: 'var(--font-work), var(--font-sans), sans-serif',
                      fontSize: '0.75rem',
                      color: 'text.secondary',
                      mt: 0.25,
                    }}
                  >
                    {new Date(c.caughtAt).toLocaleDateString('sv-SE', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </Typography>
                </Box>
                <Typography
                  sx={{
                    fontFamily: 'var(--font-newsreader), Georgia, serif',
                    fontWeight: 700,
                    fontSize: '1.25rem',
                    color: isLight ? expedition.forest : 'primary.main',
                    fontFeatureSettings: '"tnum"',
                  }}
                >
                  {c.weightKg} kg
                </Typography>
              </Box>
            ))}
          </Box>
        </>
      )}
    </Box>
  );
}

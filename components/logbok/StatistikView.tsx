'use client';

import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import { useTheme } from '@mui/material/styles';
import { expedition } from '@/lib/theme/expeditionTokens';
import { fetchMyCatches, fetchClubCatches } from '@/lib/supabase/catches';
import {
  computePersonalStats,
  computePatternInsights,
  computeLeaderboard,
} from '@/lib/stats/index';
import SeasonKpiRow from '@/components/stats/SeasonKpiRow';
import SpeciesRecordList from '@/components/stats/SpeciesRecordList';
import PatternInsightCards from '@/components/stats/PatternInsightCards';
import ClubLeaderboard from '@/components/stats/ClubLeaderboard';
import type { Catch } from '@/types/catch';

interface Props {
  userId: string;
  clubId: string | undefined;
}

export default function StatistikView({ userId, clubId }: Props) {
  const theme = useTheme();
  const isLight = theme.palette.mode === 'light';
  const [personalCatches, setPersonalCatches] = useState<Catch[] | null>(null);
  const [clubCatches, setClubCatches] = useState<Catch[] | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    setError(false);
    try {
      const [mine, club] = await Promise.all([
        fetchMyCatches(userId),
        clubId ? fetchClubCatches(clubId) : Promise.resolve([]),
      ]);
      setPersonalCatches(mine);
      setClubCatches(club);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!userId) return;
    load();
  }, [userId, clubId]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', pt: 6, flex: 1, minHeight: 0 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ px: 2, pt: 3, flex: 1, minHeight: 0 }}>
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={load}>
              Försök igen
            </Button>
          }
        >
          Kunde inte ladda statistik.
        </Alert>
      </Box>
    );
  }

  const catches = personalCatches ?? [];
  const club = clubCatches ?? [];
  const personalStats = computePersonalStats(catches);
  const insights = computePatternInsights(catches);
  const leaderboard = computeLeaderboard(club, userId);

  return (
    <Box
      sx={{
        overflowY: 'auto',
        flex: 1,
        minHeight: 0,
        pb: 4,
        bgcolor: isLight ? expedition.canvasWarm : 'background.default',
      }}
    >
      <SeasonKpiRow stats={personalStats} />
      <SpeciesRecordList records={personalStats.speciesRecords} />
      <PatternInsightCards insights={insights} />
      {clubId && <ClubLeaderboard data={leaderboard} />}
    </Box>
  );
}

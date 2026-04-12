'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  createClubRpc,
  fetchMyClubMemberships,
  joinClubByCodeRpc,
  persistActiveClubId,
  readStoredActiveClubId,
} from '@/lib/supabase/clubs';
import type { Club } from '@/types/club';

export type ClubMembershipRow = { role: 'admin' | 'member'; club: Club };

type Ctx = {
  userId: string | null;
  isReady: boolean;
  memberships: ClubMembershipRow[];
  activeClub: Club | null;
  activeClubId: string | null;
  setActiveClubId: (id: string) => void;
  refreshClubs: () => Promise<void>;
  createClub: (name: string) => Promise<Club>;
  joinClub: (code: string) => Promise<string>;
};

const ClubContext = createContext<Ctx | null>(null);

export default function ClubProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [authResolved, setAuthResolved] = useState(false);
  const [memberships, setMemberships] = useState<ClubMembershipRow[]>([]);
  const [clubLoadDone, setClubLoadDone] = useState(false);
  const [activeClubId, setActiveClubIdState] = useState<string | null>(null);

  const applyMemberships = useCallback((list: ClubMembershipRow[]) => {
    setMemberships(list);
    const stored = readStoredActiveClubId();
    const ids = new Set(list.map((m) => m.club.id));
    let nextId: string | null = null;
    if (stored && ids.has(stored)) nextId = stored;
    else if (list[0]) nextId = list[0].club.id;
    setActiveClubIdState(nextId);
    if (nextId) persistActiveClubId(nextId);
    else persistActiveClubId(null);
  }, []);

  const refreshClubs = useCallback(async () => {
    if (!userId) {
      setMemberships([]);
      setActiveClubIdState(null);
      persistActiveClubId(null);
      return;
    }
    const list = await fetchMyClubMemberships(userId);
    applyMemberships(list);
  }, [userId, applyMemberships]);

  useEffect(() => {
    createClient()
      .auth.getUser()
      .then(({ data }) => setUserId(data.user?.id ?? null))
      .finally(() => setAuthResolved(true));
  }, []);

  useEffect(() => {
    if (!authResolved) return;
    if (!userId) {
      setMemberships([]);
      setActiveClubIdState(null);
      setClubLoadDone(true);
      return;
    }
    let cancelled = false;
    setClubLoadDone(false);
    fetchMyClubMemberships(userId)
      .then((list) => {
        if (cancelled) return;
        applyMemberships(list);
      })
      .catch(() => {
        if (!cancelled) {
          setMemberships([]);
          setActiveClubIdState(null);
        }
      })
      .finally(() => {
        if (!cancelled) setClubLoadDone(true);
      });
    return () => {
      cancelled = true;
    };
  }, [authResolved, userId, applyMemberships]);

  const activeClub = useMemo(() => {
    if (!activeClubId) return null;
    return memberships.find((m) => m.club.id === activeClubId)?.club ?? null;
  }, [memberships, activeClubId]);

  const setActiveClubId = useCallback((id: string) => {
    setActiveClubIdState(id);
    persistActiveClubId(id);
  }, []);

  const createClub = useCallback(
    async (name: string) => {
      const club = await createClubRpc(name);
      persistActiveClubId(club.id);
      await refreshClubs();
      setActiveClubIdState(club.id);
      return club;
    },
    [refreshClubs]
  );

  const joinClub = useCallback(
    async (code: string) => {
      const clubId = await joinClubByCodeRpc(code);
      persistActiveClubId(clubId);
      await refreshClubs();
      setActiveClubIdState(clubId);
      return clubId;
    },
    [refreshClubs]
  );

  const isReady = authResolved && clubLoadDone;

  const value = useMemo(
    () => ({
      userId,
      isReady,
      memberships,
      activeClub,
      activeClubId,
      setActiveClubId,
      refreshClubs,
      createClub,
      joinClub,
    }),
    [
      userId,
      isReady,
      memberships,
      activeClub,
      activeClubId,
      setActiveClubId,
      refreshClubs,
      createClub,
      joinClub,
    ]
  );

  return <ClubContext.Provider value={value}>{children}</ClubContext.Provider>;
}

export function useClub() {
  const ctx = useContext(ClubContext);
  if (!ctx) throw new Error('useClub används utanför ClubProvider');
  return ctx;
}

import AppRouteShell from '@/components/layout/AppRouteShell';
import ClubGate from '@/components/layout/ClubGate';
import ClubProvider from '@/contexts/ClubContext';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClubProvider>
      <AppRouteShell>
        <ClubGate>{children}</ClubGate>
      </AppRouteShell>
    </ClubProvider>
  );
}

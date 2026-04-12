import AppRouteShell from '@/components/layout/AppRouteShell';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppRouteShell>{children}</AppRouteShell>;
}

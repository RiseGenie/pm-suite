import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Sidebar } from '@/components/Sidebar';
import { ThemeProvider } from '@/components/ThemeProvider';
import type { CompanyTheme } from '@/lib/types';
import { getCurrentProfile } from '@/lib/auth';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await getCurrentProfile();
  if (!profile) redirect('/login');
  if (!profile.company_id) redirect('/super-admin');

  const supabase = createClient();
  const { data: theme } = await supabase
    .from('company_themes')
    .select('*')
    .eq('company_id', profile.company_id)
    .single();

  const links = [
    { href: '/dashboard/projects', label: 'Projects' },
    ...(profile.role === 'company_admin'
      ? [
          { href: '/admin', label: 'Admin dashboard' },
          { href: '/admin/users', label: 'Team' },
          { href: '/admin/theme', label: 'Theme customizer' },
          { href: '/admin/support', label: 'Report a bug' },
        ]
      : []),
  ];

  return (
    <div className="flex">
      <ThemeProvider theme={theme as CompanyTheme | null} />
      <Sidebar title="PM Suite" links={links} />
      <main className="flex-1 p-8 max-w-6xl">{children}</main>
    </div>
  );
}

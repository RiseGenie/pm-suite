import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Sidebar } from '@/components/Sidebar';
import { ThemeProvider } from '@/components/ThemeProvider';
import { DashboardMain } from '@/components/DashboardMain';
import type { CompanyTheme } from '@/lib/types';
import { getCurrentProfile } from '@/lib/auth';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await getCurrentProfile();
  if (!profile) redirect('/login');
  if (!profile.company_id) redirect('/super-admin');

  const supabase = createClient();
  const [{ data: theme }, { data: platformSettings }] = await Promise.all([
    supabase.from('company_themes').select('*').eq('company_id', profile.company_id).single(),
    supabase.from('platform_settings').select('*').eq('id', true).single(),
  ]);

  const links = [
    { href: '/dashboard/projects', label: 'Projects' },
    { href: '/dashboard/todos', label: 'Todos' },
    { href: '/dashboard/issues', label: 'Issues' },
    { href: '/dashboard/goals', label: 'Goals' },
    { href: '/dashboard/huddle', label: 'Huddle' },
    ...(profile.role === 'company_admin'
      ? [
          { href: '/admin', label: 'Admin dashboard' },
          { href: '/admin/users', label: 'Team' },
          { href: '/admin/theme', label: 'Theme customizer' },
          { href: '/admin/support', label: 'Report a bug' },
        ]
      : []),
  ];

  const timezone = theme?.timezone || platformSettings?.timezone || 'UTC';

  return (
    <div className="flex">
      <ThemeProvider theme={theme as CompanyTheme | null} />
      <Sidebar
        title="PM Suite"
        links={links}
        agencyLogoUrl={platformSettings?.logo_url}
        companyLogoUrl={theme?.logo_url}
      />
      <DashboardMain timezone={timezone}>{children}</DashboardMain>
    </div>
  );
}

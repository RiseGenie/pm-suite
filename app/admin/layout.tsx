import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Sidebar } from '@/components/Sidebar';
import { ThemeProvider } from '@/components/ThemeProvider';
import { DashboardMain } from '@/components/DashboardMain';
import type { CompanyTheme } from '@/lib/types';
import { getCurrentProfile } from '@/lib/auth';

const LINKS = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/dashboard/projects', label: 'Projects' },
  { href: '/admin/users', label: 'Team' },
  { href: '/admin/theme', label: 'Theme customizer' },
  { href: '/admin/support', label: 'Report a bug' },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await getCurrentProfile();
  if (!profile?.company_id) redirect('/no-access');

  const supabase = createClient();
  const [{ data: theme }, { data: platformSettings }] = await Promise.all([
    supabase.from('company_themes').select('*').eq('company_id', profile.company_id).single(),
    supabase.from('platform_settings').select('*').eq('id', true).single(),
  ]);

  const timezone = profile.timezone || theme?.timezone || platformSettings?.timezone || 'UTC';

  return (
    <div className="flex">
      <ThemeProvider theme={theme as CompanyTheme | null} />
      <Sidebar
        title="Company Admin"
        links={LINKS}
        agencyLogoUrl={platformSettings?.logo_url}
        companyLogoUrl={theme?.logo_url}
      />
      <DashboardMain timezone={timezone} myTimezone={profile.timezone}>
        {children}
      </DashboardMain>
    </div>
  );
}

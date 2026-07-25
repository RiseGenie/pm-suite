import { createClient } from '@/lib/supabase/server';
import { Sidebar } from '@/components/Sidebar';
import { DashboardMain } from '@/components/DashboardMain';

const LINKS = [
  { href: '/super-admin', label: 'Overview' },
  { href: '/super-admin/companies', label: 'Companies' },
  { href: '/super-admin/bug-reports', label: 'Bug reports' },
  { href: '/super-admin/reports', label: 'Reports' },
  { href: '/super-admin/settings', label: 'Platform settings' },
];

export default async function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const { data: platformSettings } = await supabase.from('platform_settings').select('*').eq('id', true).single();
  const timezone = platformSettings?.timezone || 'UTC';

  return (
    <div className="flex">
      <Sidebar title="PM Suite · Owner" links={LINKS} agencyLogoUrl={platformSettings?.logo_url} />
      <DashboardMain timezone={timezone}>{children}</DashboardMain>
    </div>
  );
}

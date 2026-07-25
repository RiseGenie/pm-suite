import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Sidebar } from '@/components/Sidebar';
import { ThemeProvider } from '@/components/ThemeProvider';
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
  const { data: theme } = await supabase
    .from('company_themes')
    .select('*')
    .eq('company_id', profile.company_id)
    .single();

  return (
    <div className="flex">
      <ThemeProvider theme={theme as CompanyTheme | null} />
      <Sidebar title="Company Admin" links={LINKS} />
      <main className="flex-1 p-8 max-w-6xl">{children}</main>
    </div>
  );
}

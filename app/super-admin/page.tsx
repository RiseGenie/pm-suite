import { createClient } from '@/lib/supabase/server';

export default async function SuperAdminOverview() {
  const supabase = createClient();
  const [{ count: companyCount }, { count: userCount }, { count: projectCount }, { count: taskCount }] =
    await Promise.all([
      supabase.from('companies').select('*', { count: 'exact', head: true }),
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('projects').select('*', { count: 'exact', head: true }),
      supabase.from('tasks').select('*', { count: 'exact', head: true }),
    ]);

  const stats = [
    { label: 'Companies', value: companyCount ?? 0 },
    { label: 'Users', value: userCount ?? 0 },
    { label: 'Projects', value: projectCount ?? 0 },
    { label: 'Tasks', value: taskCount ?? 0 },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Platform overview</h1>
      <div className="grid grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="card p-5">
            <p className="text-sm text-muted">{s.label}</p>
            <p className="text-3xl font-bold mt-1">{s.value}</p>
          </div>
        ))}
      </div>
      <p className="text-sm text-muted mt-8">
        Manage client companies, their admins, and global settings from <strong>Companies</strong>.
      </p>
    </div>
  );
}

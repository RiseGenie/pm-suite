import { createClient } from '@/lib/supabase/server';
import { getCurrentProfile } from '@/lib/auth';

export default async function AdminDashboard() {
  const { profile } = await getCurrentProfile();
  const supabase = createClient();

  const [{ count: userCount }, { count: projectCount }, { count: taskCount }, { count: doneCount }] =
    await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('company_id', profile!.company_id),
      supabase.from('projects').select('*', { count: 'exact', head: true }).eq('company_id', profile!.company_id),
      supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('company_id', profile!.company_id),
      supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', profile!.company_id)
        .eq('status', 'done'),
    ]);

  const stats = [
    { label: 'Team members', value: userCount ?? 0 },
    { label: 'Projects', value: projectCount ?? 0 },
    { label: 'Tasks', value: taskCount ?? 0 },
    { label: 'Completed', value: doneCount ?? 0 },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Company dashboard</h1>
      <div className="grid grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="card p-5">
            <p className="text-sm text-muted">{s.label}</p>
            <p className="text-3xl font-bold mt-1">{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

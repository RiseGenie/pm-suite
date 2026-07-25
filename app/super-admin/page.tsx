import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

const ACTION_LABELS: Record<string, string> = {
  'company.created': 'created the company',
  'company.suspended': 'suspended the company',
  'company.reactivated': 'reactivated the company',
  'admin.invited': 'invited a company admin',
  'member.invited': 'invited a team member',
  'member.role_changed': 'changed a member’s role',
  'member.activated': 'reactivated a member',
  'member.deactivated': 'deactivated a member',
  'project.created': 'created a project',
  'task.created': 'created a task',
  'task.updated': 'updated a task',
  'task.status_changed': 'moved a task',
  'task.deleted': 'deleted a task',
  'task.commented': 'commented on a task',
  'bug.reported': 'reported a bug',
};

export default async function SuperAdminOverview() {
  const supabase = createClient();

  const [{ count: companyCount }, { count: userCount }, { count: projectCount }, { count: taskCount }, { data: companyStats }, { data: recentActivity }, { count: openBugCount }] =
    await Promise.all([
      supabase.from('companies').select('*', { count: 'exact', head: true }),
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('projects').select('*', { count: 'exact', head: true }),
      supabase.from('tasks').select('*', { count: 'exact', head: true }),
      supabase.from('company_stats').select('*').order('created_at', { ascending: false }),
      supabase
        .from('activity_log')
        .select('*, actor:profiles(full_name), company:companies(name)')
        .order('created_at', { ascending: false })
        .limit(25),
      supabase.from('bug_reports').select('*', { count: 'exact', head: true }).neq('status', 'resolved'),
    ]);

  const stats = [
    { label: 'Companies', value: companyCount ?? 0 },
    { label: 'Users', value: userCount ?? 0 },
    { label: 'Projects', value: projectCount ?? 0 },
    { label: 'Tasks', value: taskCount ?? 0 },
    { label: 'Open bugs', value: openBugCount ?? 0 },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-6">Platform overview</h1>
        <div className="grid grid-cols-5 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="card p-5">
              <p className="text-sm text-muted">{s.label}</p>
              <p className="text-3xl font-bold mt-1">{s.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="font-semibold mb-3">Companies at a glance</h2>
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted border-b" style={{ borderColor: 'var(--color-border)' }}>
                <th className="p-3 font-medium">Company</th>
                <th className="p-3 font-medium">Status</th>
                <th className="p-3 font-medium">Users</th>
                <th className="p-3 font-medium">Projects</th>
                <th className="p-3 font-medium">Tasks</th>
                <th className="p-3 font-medium">Completed</th>
                <th className="p-3 font-medium">Open bugs</th>
                <th className="p-3 font-medium">Last activity</th>
              </tr>
            </thead>
            <tbody>
              {companyStats?.map((c) => (
                <tr key={c.company_id} className="border-b last:border-0" style={{ borderColor: 'var(--color-border)' }}>
                  <td className="p-3">
                    <Link href={`/super-admin/companies/${c.company_id}`} className="font-medium hover:text-primary">
                      {c.name}
                    </Link>
                  </td>
                  <td className="p-3">
                    <span className={`badge ${c.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                      {c.is_active ? 'Active' : 'Suspended'}
                    </span>
                  </td>
                  <td className="p-3">{c.user_count}</td>
                  <td className="p-3">{c.project_count}</td>
                  <td className="p-3">{c.task_count}</td>
                  <td className="p-3">{c.completed_task_count}</td>
                  <td className="p-3">
                    {c.open_bug_count > 0 ? (
                      <span className="badge bg-red-100 text-red-700">{c.open_bug_count}</span>
                    ) : (
                      <span className="text-muted">0</span>
                    )}
                  </td>
                  <td className="p-3 text-muted">
                    {c.last_activity_at ? new Date(c.last_activity_at).toLocaleString() : 'No activity yet'}
                  </td>
                </tr>
              ))}
              {!companyStats?.length && (
                <tr>
                  <td className="p-4 text-muted" colSpan={8}>
                    No companies yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h2 className="font-semibold mb-3">Recent activity across the platform</h2>
        <div className="card p-4 space-y-2">
          {recentActivity?.length ? (
            recentActivity.map((a) => (
              <div key={a.id} className="text-sm flex items-center justify-between gap-2 py-1 border-b last:border-0" style={{ borderColor: 'var(--color-border)' }}>
                <span>
                  <strong>{a.actor?.full_name ?? 'Someone'}</strong>{' '}
                  {ACTION_LABELS[a.action] ?? a.action}
                  {a.company?.name && (
                    <>
                      {' '}
                      at <strong>{a.company.name}</strong>
                    </>
                  )}
                </span>
                <span className="text-xs text-muted shrink-0">{new Date(a.created_at).toLocaleString()}</span>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted">No activity recorded yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

import { createClient } from '@/lib/supabase/server';
import { buildReportData } from '@/lib/report';
import { emailReportNow } from './actions';
import { EmailReportButton } from '@/components/EmailReportButton';

export default async function ReportsPage() {
  const supabase = createClient();
  const report = await buildReportData(supabase);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Platform report</h1>
          <p className="text-xs text-muted mt-1">Generated {new Date(report.generatedAt).toLocaleString()}</p>
        </div>
        <EmailReportButton action={emailReportNow} />
      </div>

      <p className="text-sm text-muted">
        A copy of this same report is emailed automatically every Monday. Use the button above to get one on demand.
      </p>

      <div className="grid grid-cols-6 gap-4">
        {[
          { label: 'Companies', value: report.totals.companies },
          { label: 'Users', value: report.totals.users },
          { label: 'Projects', value: report.totals.projects },
          { label: 'Tasks', value: report.totals.tasks },
          { label: 'Completed', value: report.totals.tasksCompleted },
          { label: 'Open bugs', value: report.totals.openBugs },
        ].map((s) => (
          <div key={s.label} className="card p-4">
            <p className="text-xs text-muted">{s.label}</p>
            <p className="text-2xl font-bold mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      <div>
        <h2 className="font-semibold mb-3">Companies</h2>
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted border-b" style={{ borderColor: 'var(--color-border)' }}>
                <th className="p-3 font-medium">Company</th>
                <th className="p-3 font-medium">Status</th>
                <th className="p-3 font-medium">Users</th>
                <th className="p-3 font-medium">Projects</th>
                <th className="p-3 font-medium">Tasks</th>
                <th className="p-3 font-medium">Done</th>
                <th className="p-3 font-medium">Open bugs</th>
              </tr>
            </thead>
            <tbody>
              {report.companies.map((c) => (
                <tr key={c.company_id} className="border-b last:border-0" style={{ borderColor: 'var(--color-border)' }}>
                  <td className="p-3 font-medium">{c.name}</td>
                  <td className="p-3">{c.is_active ? 'Active' : 'Suspended'}</td>
                  <td className="p-3">{c.user_count}</td>
                  <td className="p-3">{c.project_count}</td>
                  <td className="p-3">{c.task_count}</td>
                  <td className="p-3">{c.completed_task_count}</td>
                  <td className="p-3">{c.open_bug_count}</td>
                </tr>
              ))}
              {!report.companies.length && (
                <tr>
                  <td className="p-4 text-muted" colSpan={7}>
                    No companies yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h2 className="font-semibold mb-3">Recent bug reports</h2>
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted border-b" style={{ borderColor: 'var(--color-border)' }}>
                <th className="p-3 font-medium">Title</th>
                <th className="p-3 font-medium">Company</th>
                <th className="p-3 font-medium">Severity</th>
                <th className="p-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {report.recentBugs.map((b) => (
                <tr key={b.id} className="border-b last:border-0" style={{ borderColor: 'var(--color-border)' }}>
                  <td className="p-3">{b.title}</td>
                  <td className="p-3">{b.company_name ?? '—'}</td>
                  <td className="p-3 capitalize">{b.severity}</td>
                  <td className="p-3 capitalize">{b.status.replace('_', ' ')}</td>
                </tr>
              ))}
              {!report.recentBugs.length && (
                <tr>
                  <td className="p-4 text-muted" colSpan={4}>
                    No bug reports yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

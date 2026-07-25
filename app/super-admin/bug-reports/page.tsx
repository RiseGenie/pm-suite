import { createClient } from '@/lib/supabase/server';
import { updateBugReportStatus } from './actions';
import { RoleSelect } from '@/components/RoleSelect';

const SEVERITY_BADGE: Record<string, string> = {
  low: 'bg-slate-100 text-slate-600',
  medium: 'bg-blue-100 text-blue-700',
  high: 'bg-amber-100 text-amber-700',
  critical: 'bg-red-100 text-red-700',
};

const STATUS_OPTIONS = [
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'resolved', label: 'Resolved' },
];

export default async function BugReportsPage() {
  const supabase = createClient();
  const { data: reports } = await supabase
    .from('bug_reports')
    .select('*, company:companies(name), reporter:profiles!bug_reports_reported_by_fkey(full_name)')
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Bug reports</h1>

      <div className="space-y-3">
        {reports?.length ? (
          reports.map((r) => (
            <div key={r.id} className="card p-4">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="font-medium">{r.title}</p>
                  <p className="text-xs text-muted mt-0.5">
                    {r.company?.name ?? 'Unknown company'} · {r.reporter?.full_name ?? 'Unknown'} ·{' '}
                    {new Date(r.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`badge ${SEVERITY_BADGE[r.severity]}`}>{r.severity}</span>
                  <RoleSelect
                    action={updateBugReportStatus.bind(null, r.id)}
                    currentRole={r.status}
                    options={STATUS_OPTIONS}
                    fieldName="status"
                  />
                </div>
              </div>
              <p className="text-sm text-muted mt-2 whitespace-pre-wrap">{r.description}</p>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted">No bug reports yet.</p>
        )}
      </div>
    </div>
  );
}

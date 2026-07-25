import { createClient } from '@/lib/supabase/server';
import { getCurrentProfile } from '@/lib/auth';
import { submitBugReport } from './actions';
import { SubmitButton } from '@/components/SubmitButton';

const SEVERITY_BADGE: Record<string, string> = {
  low: 'bg-slate-100 text-slate-600',
  medium: 'bg-blue-100 text-blue-700',
  high: 'bg-amber-100 text-amber-700',
  critical: 'bg-red-100 text-red-700',
};

const STATUS_BADGE: Record<string, string> = {
  open: 'bg-amber-100 text-amber-700',
  in_progress: 'bg-blue-100 text-blue-700',
  resolved: 'bg-green-100 text-green-700',
};

export default async function SupportPage() {
  const { profile } = await getCurrentProfile();
  const supabase = createClient();
  const { data: reports } = await supabase
    .from('bug_reports')
    .select('*')
    .eq('company_id', profile!.company_id)
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Report a bug</h1>
      <p className="text-sm text-muted -mt-4">
        Bug reports go straight to the PM Suite team by email, and you can track their status here.
      </p>

      <div className="grid grid-cols-3 gap-6">
        <form action={submitBugReport} className="card p-5 space-y-3 h-fit">
          <div>
            <label className="text-sm font-medium">Title</label>
            <input name="title" required className="input mt-1" placeholder="Short summary" />
          </div>
          <div>
            <label className="text-sm font-medium">Description</label>
            <textarea
              name="description"
              required
              rows={5}
              className="input mt-1"
              placeholder="What happened, what you expected, steps to reproduce…"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Severity</label>
            <select name="severity" defaultValue="medium" className="input mt-1">
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
          <SubmitButton className="btn btn-primary w-full" pendingText="Sending…">
            Submit report
          </SubmitButton>
        </form>

        <div className="col-span-2 space-y-2">
          {reports?.length ? (
            reports.map((r) => (
              <div key={r.id} className="card p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium">{r.title}</p>
                  <div className="flex gap-2 shrink-0">
                    <span className={`badge ${SEVERITY_BADGE[r.severity]}`}>{r.severity}</span>
                    <span className={`badge ${STATUS_BADGE[r.status]}`}>{r.status.replace('_', ' ')}</span>
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
    </div>
  );
}

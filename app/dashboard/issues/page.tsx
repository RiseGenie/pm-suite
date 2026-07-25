import { createClient } from '@/lib/supabase/server';
import { getCurrentProfile } from '@/lib/auth';
import { createIssue, updateIssueStatus, convertIssueToTodo } from './actions';
import { SubmitButton } from '@/components/SubmitButton';
import { RoleSelect } from '@/components/RoleSelect';

const STATUS_OPTIONS = [
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'resolved', label: 'Resolved' },
];

const PRIORITY_BADGE: Record<string, string> = {
  low: 'bg-slate-100 text-slate-600',
  medium: 'bg-blue-100 text-blue-700',
  high: 'bg-amber-100 text-amber-700',
  urgent: 'bg-red-100 text-red-700',
};

export default async function IssuesPage() {
  const { profile } = await getCurrentProfile();
  const supabase = createClient();

  const [{ data: issues }, { data: members }, { data: convertedTasks }] = await Promise.all([
    supabase
      .from('issues')
      .select('*, assignee:profiles!issues_assignee_id_fkey(full_name)')
      .eq('company_id', profile!.company_id)
      .order('created_at', { ascending: false }),
    supabase.from('profiles').select('id, full_name').eq('company_id', profile!.company_id),
    supabase.from('tasks').select('source_issue_id').eq('company_id', profile!.company_id).not('source_issue_id', 'is', null),
  ]);

  const convertedIssueIds = new Set((convertedTasks ?? []).map((t) => t.source_issue_id));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Issues</h1>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-2">
          {issues?.length ? (
            issues.map((i) => {
              const isConverted = convertedIssueIds.has(i.id);
              return (
                <div key={i.id} className="card p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{i.title}</p>
                      {i.description && <p className="text-sm text-muted mt-1">{i.description}</p>}
                      <div className="flex items-center gap-2 mt-2 text-xs text-muted flex-wrap">
                        <span className={`badge ${PRIORITY_BADGE[i.priority]}`}>{i.priority}</span>
                        {i.deadline && <span>Due {i.deadline}</span>}
                        {i.assignee?.full_name && <span>Assigned to {i.assignee.full_name}</span>}
                        {isConverted && <span className="badge bg-green-100 text-green-700">Converted to todo</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <RoleSelect
                        action={updateIssueStatus.bind(null, i.id)}
                        currentRole={i.status}
                        options={STATUS_OPTIONS}
                        fieldName="status"
                      />
                      {!isConverted && (
                        <form action={convertIssueToTodo.bind(null, i.id)}>
                          <SubmitButton className="btn btn-secondary text-xs" pendingText="Converting…">
                            Convert to todo
                          </SubmitButton>
                        </form>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-sm text-muted">No issues yet.</p>
          )}
        </div>

        <form action={createIssue} className="card p-5 space-y-3 h-fit">
          <h2 className="font-semibold">New issue</h2>
          <div>
            <label className="text-sm font-medium">Title</label>
            <input name="title" required className="input mt-1" />
          </div>
          <div>
            <label className="text-sm font-medium">Description</label>
            <textarea name="description" rows={3} className="input mt-1" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-sm font-medium">Priority</label>
              <select name="priority" defaultValue="medium" className="input mt-1">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Deadline</label>
              <input name="deadline" type="date" className="input mt-1" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Assignee</label>
            <select name="assignee_id" defaultValue="" className="input mt-1">
              <option value="">Unassigned</option>
              {members?.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.full_name ?? m.id}
                </option>
              ))}
            </select>
          </div>
          <SubmitButton className="btn btn-primary w-full" pendingText="Creating…">
            Create issue
          </SubmitButton>
        </form>
      </div>
    </div>
  );
}

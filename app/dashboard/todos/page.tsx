import { createClient } from '@/lib/supabase/server';
import { getCurrentProfile } from '@/lib/auth';
import { createTodo, updateTodoStatus } from './actions';
import { convertTaskToIssue } from '@/app/dashboard/issues/actions';
import { SubmitButton } from '@/components/SubmitButton';
import { RoleSelect } from '@/components/RoleSelect';

const STATUS_OPTIONS = [
  { value: 'todo', label: 'To do' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'in_review', label: 'In review' },
  { value: 'done', label: 'Done' },
];

const PRIORITY_BADGE: Record<string, string> = {
  low: 'bg-slate-100 text-slate-600',
  medium: 'bg-blue-100 text-blue-700',
  high: 'bg-amber-100 text-amber-700',
  urgent: 'bg-red-100 text-red-700',
};

export default async function TodosPage() {
  const { profile } = await getCurrentProfile();
  const supabase = createClient();

  const [{ data: todos }, { data: members }] = await Promise.all([
    supabase
      .from('tasks')
      .select('*, assignee:profiles!tasks_assignee_id_fkey(full_name)')
      .eq('company_id', profile!.company_id)
      .is('project_id', null)
      .order('created_at', { ascending: false }),
    supabase.from('profiles').select('id, full_name').eq('company_id', profile!.company_id),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Todos</h1>
        <p className="text-sm text-muted mt-1">
          Company-wide todos, not tied to any specific project. Project tasks live on each project&apos;s board.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-2">
          {todos?.length ? (
            todos.map((t) => (
              <div key={t.id} className="card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{t.title}</p>
                    {t.description && <p className="text-sm text-muted mt-1">{t.description}</p>}
                    <div className="flex items-center gap-2 mt-2 text-xs text-muted flex-wrap">
                      <span className={`badge ${PRIORITY_BADGE[t.priority]}`}>{t.priority}</span>
                      {t.due_date && <span>Due {t.due_date}</span>}
                      {t.assignee?.full_name && <span>Assigned to {t.assignee.full_name}</span>}
                      {t.source_issue_id && <span className="badge bg-blue-100 text-blue-700">From an issue</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <RoleSelect
                      action={updateTodoStatus.bind(null, t.id)}
                      currentRole={t.status}
                      options={STATUS_OPTIONS}
                      fieldName="status"
                    />
                    <form action={convertTaskToIssue.bind(null, t.id)}>
                      <SubmitButton className="btn btn-secondary text-xs" pendingText="Converting…">
                        Convert to issue
                      </SubmitButton>
                    </form>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted">No company-wide todos yet.</p>
          )}
        </div>

        <form action={createTodo} className="card p-5 space-y-3 h-fit">
          <h2 className="font-semibold">New todo</h2>
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
            Create todo
          </SubmitButton>
        </form>
      </div>
    </div>
  );
}

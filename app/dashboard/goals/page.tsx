import { createClient } from '@/lib/supabase/server';
import { getCurrentProfile } from '@/lib/auth';
import { createGoal, updateGoalStatus } from './actions';
import { SubmitButton } from '@/components/SubmitButton';
import { RoleSelect } from '@/components/RoleSelect';

const STATUS_OPTIONS = [
  { value: 'on_track', label: 'On track' },
  { value: 'at_risk', label: 'At risk' },
  { value: 'completed', label: 'Completed' },
];

const STATUS_BADGE: Record<string, string> = {
  on_track: 'bg-green-100 text-green-700',
  at_risk: 'bg-amber-100 text-amber-700',
  completed: 'bg-blue-100 text-blue-700',
};

export default async function GoalsPage() {
  const { profile } = await getCurrentProfile();
  const supabase = createClient();
  const { data: goals } = await supabase
    .from('goals')
    .select('*')
    .eq('company_id', profile!.company_id)
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Company goals</h1>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-2">
          {goals?.length ? (
            goals.map((g) => (
              <div key={g.id} className="card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{g.title}</p>
                    {g.description && <p className="text-sm text-muted mt-1">{g.description}</p>}
                    <div className="flex items-center gap-2 mt-2 text-xs">
                      <span className={`badge ${STATUS_BADGE[g.status]}`}>{g.status.replace('_', ' ')}</span>
                      {g.deadline && <span className="text-muted">Target {g.deadline}</span>}
                    </div>
                  </div>
                  <RoleSelect
                    action={updateGoalStatus.bind(null, g.id)}
                    currentRole={g.status}
                    options={STATUS_OPTIONS}
                  />
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted">No goals yet.</p>
          )}
        </div>

        <form action={createGoal} className="card p-5 space-y-3 h-fit">
          <h2 className="font-semibold">New goal</h2>
          <div>
            <label className="text-sm font-medium">Title</label>
            <input name="title" required className="input mt-1" />
          </div>
          <div>
            <label className="text-sm font-medium">Description</label>
            <textarea name="description" rows={3} className="input mt-1" />
          </div>
          <div>
            <label className="text-sm font-medium">Target date</label>
            <input name="deadline" type="date" className="input mt-1" />
          </div>
          <SubmitButton className="btn btn-primary w-full" pendingText="Creating…">
            Create goal
          </SubmitButton>
        </form>
      </div>
    </div>
  );
}

import { createClient } from '@/lib/supabase/server';
import { getCurrentProfile } from '@/lib/auth';
import { inviteMember, toggleMemberActive } from './actions';

export default async function TeamPage() {
  const { profile } = await getCurrentProfile();
  const supabase = createClient();

  const [{ data: members }, { data: invites }] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, full_name, role, is_active')
      .eq('company_id', profile!.company_id)
      .order('created_at'),
    supabase
      .from('invites')
      .select('*')
      .eq('company_id', profile!.company_id)
      .order('created_at', { ascending: false }),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Team</h1>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 card p-5">
          <h2 className="font-semibold mb-3">Members ({members?.length ?? 0})</h2>
          <div className="space-y-2">
            {members?.map((m) => {
              const toggle = toggleMemberActive.bind(null, m.id, m.is_active);
              return (
                <div key={m.id} className="flex items-center justify-between text-sm py-2 border-b last:border-0">
                  <div>
                    <p className="font-medium">{m.full_name ?? 'Unnamed user'}</p>
                    <span className="badge bg-slate-100 text-slate-600">{m.role}</span>
                  </div>
                  <form action={toggle}>
                    <button className="text-xs text-muted hover:text-danger" type="submit">
                      {m.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                  </form>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card p-5 h-fit">
          <h2 className="font-semibold mb-3">Invite someone</h2>
          <form action={inviteMember} className="space-y-3">
            <div>
              <label className="text-sm font-medium">Email</label>
              <input name="email" type="email" required className="input mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Role</label>
              <select name="role" className="input mt-1">
                <option value="member">Member</option>
                <option value="company_admin">Company admin</option>
              </select>
            </div>
            <button className="btn btn-primary w-full" type="submit">
              Send invite
            </button>
          </form>
          <div className="mt-4 space-y-1">
            {invites?.map((i) => (
              <div key={i.id} className="flex items-center justify-between text-xs py-1">
                <span>{i.email}</span>
                <span className={`badge ${i.accepted_at ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                  {i.accepted_at ? 'Accepted' : 'Pending'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

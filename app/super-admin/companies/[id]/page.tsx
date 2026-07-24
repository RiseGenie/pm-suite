import { createClient } from '@/lib/supabase/server';
import { inviteCompanyAdmin, toggleCompanyActive } from '../actions';
import { updateCompanyTheme } from '@/app/_actions/theme';
import { ThemeCustomizerForm } from '@/components/ThemeCustomizerForm';
import type { CompanyTheme } from '@/lib/types';

export default async function CompanyDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const [{ data: company }, { data: theme }, { data: members }, { data: invites }] = await Promise.all([
    supabase.from('companies').select('*').eq('id', params.id).single(),
    supabase.from('company_themes').select('*').eq('company_id', params.id).single(),
    supabase.from('profiles').select('id, full_name, role, is_active').eq('company_id', params.id),
    supabase.from('invites').select('*').eq('company_id', params.id).order('created_at', { ascending: false }),
  ]);

  if (!company) return <p>Company not found.</p>;

  const toggleAction = toggleCompanyActive.bind(null, company.id, company.is_active);
  const inviteAction = inviteCompanyAdmin.bind(null, company.id);
  const themeAction = updateCompanyTheme.bind(null, company.id);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{company.name}</h1>
          <p className="text-sm text-muted">{company.slug}</p>
        </div>
        <form action={toggleAction}>
          <button className={`btn ${company.is_active ? 'btn-danger' : 'btn-primary'}`} type="submit">
            {company.is_active ? 'Suspend company' : 'Reactivate company'}
          </button>
        </form>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="card p-5">
          <h2 className="font-semibold mb-3">Team ({members?.length ?? 0})</h2>
          <div className="space-y-2">
            {members?.map((m) => (
              <div key={m.id} className="flex items-center justify-between text-sm py-1 border-b last:border-0">
                <span>{m.full_name ?? 'Unnamed user'}</span>
                <span className="badge bg-slate-100 text-slate-600">{m.role}</span>
              </div>
            ))}
            {!members?.length && <p className="text-sm text-muted">No members yet.</p>}
          </div>
        </div>

        <div className="card p-5">
          <h2 className="font-semibold mb-3">Invite a company admin</h2>
          <form action={inviteAction} className="flex gap-2">
            <input name="admin_email" type="email" required placeholder="admin@client.com" className="input" />
            <button className="btn btn-primary shrink-0" type="submit">
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

      <div>
        <h2 className="font-semibold mb-3">Theme (owner override)</h2>
        {theme && <ThemeCustomizerForm theme={theme as CompanyTheme} action={themeAction} />}
      </div>
    </div>
  );
}

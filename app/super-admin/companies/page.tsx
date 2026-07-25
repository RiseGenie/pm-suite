import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { createCompany } from './actions';
import { SubmitButton } from '@/components/SubmitButton';

export default async function CompaniesPage({ searchParams }: { searchParams: { error?: string } }) {
  const supabase = createClient();
  const { data: companies } = await supabase
    .from('companies')
    .select('id, name, slug, is_active, created_at')
    .order('created_at', { ascending: false });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Companies</h1>

      {searchParams.error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-2 mb-4">
          {searchParams.error}
        </p>
      )}

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-2">
          {companies?.length ? (
            companies.map((c) => (
              <Link
                key={c.id}
                href={`/super-admin/companies/${c.id}`}
                className="card p-4 flex items-center justify-between hover:border-primary block"
              >
                <div>
                  <p className="font-medium">{c.name}</p>
                  <p className="text-xs text-muted">{c.slug}</p>
                </div>
                <span className={`badge ${c.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                  {c.is_active ? 'Active' : 'Suspended'}
                </span>
              </Link>
            ))
          ) : (
            <p className="text-muted text-sm">No companies yet. Add your first client on the right.</p>
          )}
        </div>

        <form action={createCompany} className="card p-5 space-y-3 h-fit">
          <h2 className="font-semibold">Add a company</h2>
          <div>
            <label className="text-sm font-medium">Company name</label>
            <input name="name" required className="input mt-1" />
          </div>
          <div>
            <label className="text-sm font-medium">Admin email (optional)</label>
            <input name="admin_email" type="email" className="input mt-1" placeholder="admin@client.com" />
            <p className="text-xs text-muted mt-1">Sends an invite link to become the company admin.</p>
          </div>
          <SubmitButton className="btn btn-primary w-full" pendingText="Creating…">
            Create company
          </SubmitButton>
        </form>
      </div>
    </div>
  );
}

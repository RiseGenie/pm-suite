import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getCurrentProfile } from '@/lib/auth';
import { createProject } from './actions';
import { SubmitButton } from '@/components/SubmitButton';

export default async function ProjectsPage() {
  const { profile } = await getCurrentProfile();
  const supabase = createClient();
  const { data: projects } = await supabase
    .from('projects')
    .select('id, name, description, color, status')
    .eq('company_id', profile!.company_id)
    .neq('status', 'archived')
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Projects</h1>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 grid grid-cols-2 gap-4">
          {projects?.map((p) => (
            <Link key={p.id} href={`/dashboard/projects/${p.id}`} className="card p-4 block hover:border-primary">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color }} />
                <p className="font-medium">{p.name}</p>
              </div>
              <p className="text-xs text-muted line-clamp-2">{p.description || 'No description'}</p>
              <span className="badge bg-slate-100 text-slate-600 mt-3">{p.status}</span>
            </Link>
          ))}
          {!projects?.length && <p className="text-sm text-muted">No projects yet. Create one to get started.</p>}
        </div>

        <form action={createProject} className="card p-5 space-y-3 h-fit">
          <h2 className="font-semibold">New project</h2>
          <div>
            <label className="text-sm font-medium">Name</label>
            <input name="name" required className="input mt-1" />
          </div>
          <div>
            <label className="text-sm font-medium">Description</label>
            <textarea name="description" rows={3} className="input mt-1" />
          </div>
          <div>
            <label className="text-sm font-medium">Color</label>
            <input name="color" type="color" defaultValue="#4f46e5" className="h-9 w-16 mt-1" />
          </div>
          <SubmitButton className="btn btn-primary w-full" pendingText="Creating…">
            Create project
          </SubmitButton>
        </form>
      </div>
    </div>
  );
}

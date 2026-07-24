import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getCurrentProfile } from '@/lib/auth';
import { Board } from '@/components/kanban/Board';
import { ListView } from '@/components/kanban/ListView';
import { TaskDrawer } from '@/components/TaskDrawer';
import type { Profile, Task, TaskComment } from '@/lib/types';

export default async function ProjectDetailPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { view?: string; task?: string };
}) {
  const { profile } = await getCurrentProfile();
  const supabase = createClient();

  const [{ data: project }, { data: tasks }, { data: members }] = await Promise.all([
    supabase.from('projects').select('*').eq('id', params.id).single(),
    supabase
      .from('tasks')
      .select('*, assignee:profiles!tasks_assignee_id_fkey(full_name)')
      .eq('project_id', params.id),
    supabase.from('profiles').select('*').eq('company_id', profile!.company_id),
  ]);

  if (!project) return <p>Project not found.</p>;

  const view = searchParams.view === 'list' ? 'list' : 'board';

  let drawer = null;
  if (searchParams.task) {
    const [{ data: task }, { data: comments }, { data: attachments }] = await Promise.all([
      supabase.from('tasks').select('*').eq('id', searchParams.task).single(),
      supabase
        .from('task_comments')
        .select('*')
        .eq('task_id', searchParams.task)
        .order('created_at', { ascending: true }),
      supabase.from('task_attachments').select('*').eq('task_id', searchParams.task),
    ]);

    if (task) {
      const authorIds = Array.from(new Set((comments ?? []).map((c) => c.author_id).filter(Boolean))) as string[];
      const authors: Record<string, string> = {};
      if (authorIds.length) {
        const { data: authorProfiles } = await supabase.from('profiles').select('id, full_name').in('id', authorIds);
        authorProfiles?.forEach((a) => (authors[a.id] = a.full_name ?? 'Someone'));
      }

      const attachmentsWithUrl = await Promise.all(
        (attachments ?? []).map(async (a) => {
          const { data: signed } = await supabase.storage.from('attachments').createSignedUrl(a.file_path, 3600);
          return { ...a, url: signed?.signedUrl ?? null };
        })
      );

      drawer = (
        <TaskDrawer
          task={task as Task}
          comments={(comments ?? []) as TaskComment[]}
          authors={authors}
          attachments={attachmentsWithUrl}
          members={(members ?? []) as Profile[]}
          projectId={params.id}
          companyId={profile!.company_id!}
        />
      );
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: project.color }} />
            <h1 className="text-2xl font-bold">{project.name}</h1>
          </div>
          {project.description && <p className="text-sm text-muted mt-1">{project.description}</p>}
        </div>
        <div className="flex gap-2 text-xs">
          <Link
            href={`/dashboard/projects/${params.id}?view=board`}
            className={`btn ${view === 'board' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Board
          </Link>
          <Link
            href={`/dashboard/projects/${params.id}?view=list`}
            className={`btn ${view === 'list' ? 'btn-primary' : 'btn-secondary'}`}
          >
            List
          </Link>
        </div>
      </div>

      {view === 'board' ? (
        <Board tasks={(tasks ?? []) as never} projectId={params.id} />
      ) : (
        <ListView tasks={(tasks ?? []) as never} projectId={params.id} />
      )}

      {drawer}
    </div>
  );
}

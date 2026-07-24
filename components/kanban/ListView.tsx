import Link from 'next/link';
import type { Task } from '@/lib/types';

type TaskWithAssignee = Task & { assignee?: { full_name: string | null } | null };

const STATUS_LABEL: Record<string, string> = {
  todo: 'To do',
  in_progress: 'In progress',
  in_review: 'In review',
  done: 'Done',
};

export function ListView({ tasks, projectId }: { tasks: TaskWithAssignee[]; projectId: string }) {
  return (
    <div className="card overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-muted border-b" style={{ borderColor: 'var(--color-border)' }}>
            <th className="p-3 font-medium">Task</th>
            <th className="p-3 font-medium">Status</th>
            <th className="p-3 font-medium">Priority</th>
            <th className="p-3 font-medium">Assignee</th>
            <th className="p-3 font-medium">Due</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((t) => (
            <tr key={t.id} className="border-b last:border-0" style={{ borderColor: 'var(--color-border)' }}>
              <td className="p-3">
                <Link href={`/dashboard/projects/${projectId}?task=${t.id}`} className="hover:text-primary">
                  {t.title}
                </Link>
              </td>
              <td className="p-3">
                <span className="badge bg-slate-100 text-slate-600">{STATUS_LABEL[t.status]}</span>
              </td>
              <td className="p-3 capitalize">{t.priority}</td>
              <td className="p-3">{t.assignee?.full_name ?? '—'}</td>
              <td className="p-3">{t.due_date ?? '—'}</td>
            </tr>
          ))}
          {!tasks.length && (
            <tr>
              <td className="p-4 text-muted" colSpan={5}>
                No tasks yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

import Link from 'next/link';
import type { Task, TaskComment, Profile } from '@/lib/types';
import { updateTask, deleteTask, addComment, deleteAttachment } from '@/app/dashboard/projects/[id]/actions';
import { convertTaskToIssue } from '@/app/dashboard/issues/actions';
import { AttachmentUploader } from '@/components/AttachmentUploader';
import { SubmitButton } from '@/components/SubmitButton';

interface AttachmentWithUrl {
  id: string;
  file_name: string;
  file_size: number | null;
  file_path: string;
  url: string | null;
}

export function TaskDrawer({
  task,
  comments,
  authors,
  attachments,
  members,
  projectId,
  companyId,
}: {
  task: Task;
  comments: TaskComment[];
  authors: Record<string, string>;
  attachments: AttachmentWithUrl[];
  members: Profile[];
  projectId: string;
  companyId: string;
}) {
  const updateAction = updateTask.bind(null, task.id, projectId);
  const deleteAction = deleteTask.bind(null, task.id, projectId);
  const commentAction = addComment.bind(null, task.id, projectId);

  return (
    <div className="fixed inset-0 bg-black/30 flex justify-end z-50">
      <div className="w-full max-w-lg h-full overflow-y-auto p-6 space-y-6" style={{ backgroundColor: 'var(--color-surface)' }}>
        <div className="flex items-center justify-between">
          <Link href={`/dashboard/projects/${projectId}`} className="text-sm text-muted hover:text-text">
            ← Close
          </Link>
          <div className="flex items-center gap-3">
            {task.source_issue_id ? (
              <span className="badge bg-blue-100 text-blue-700">From an issue</span>
            ) : (
              <form action={convertTaskToIssue.bind(null, task.id)}>
                <SubmitButton className="text-xs text-muted hover:text-primary" pendingText="Converting…">
                  Convert to issue
                </SubmitButton>
              </form>
            )}
            <form action={deleteAction}>
              <SubmitButton className="text-xs text-danger" pendingText="Deleting…">
                Delete task
              </SubmitButton>
            </form>
          </div>
        </div>

        <form action={updateAction} className="space-y-3">
          <input name="title" defaultValue={task.title} className="input text-lg font-semibold" />
          <textarea
            name="description"
            defaultValue={task.description ?? ''}
            rows={4}
            placeholder="Description"
            className="input"
          />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted">Priority</label>
              <select name="priority" defaultValue={task.priority} className="input mt-1">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted">Due date</label>
              <input name="due_date" type="date" defaultValue={task.due_date ?? ''} className="input mt-1" />
            </div>
            <div className="col-span-2">
              <label className="text-xs font-medium text-muted">Assignee</label>
              <select name="assignee_id" defaultValue={task.assignee_id ?? ''} className="input mt-1">
                <option value="">Unassigned</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.full_name ?? m.id}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <SubmitButton pendingText="Saving…">Save changes</SubmitButton>
        </form>

        <div>
          <h3 className="text-sm font-semibold mb-2">Attachments</h3>
          <div className="space-y-1 mb-2">
            {attachments.map((a) => (
              <div key={a.id} className="flex items-center justify-between text-xs">
                <a href={a.url ?? '#'} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                  {a.file_name}
                </a>
                <form action={deleteAttachment.bind(null, a.id, a.file_path, projectId)}>
                  <SubmitButton className="text-muted hover:text-danger" pendingText="Removing…">
                    Remove
                  </SubmitButton>
                </form>
              </div>
            ))}
            {!attachments.length && <p className="text-xs text-muted">No files yet.</p>}
          </div>
          <AttachmentUploader taskId={task.id} projectId={projectId} companyId={companyId} />
        </div>

        <div>
          <h3 className="text-sm font-semibold mb-2">Comments</h3>
          <div className="space-y-3 mb-3">
            {comments.map((c) => (
              <div key={c.id} className="text-sm">
                <p className="font-medium text-xs">{authors[c.author_id ?? ''] ?? 'Someone'}</p>
                <p className="text-sm">{c.body}</p>
              </div>
            ))}
            {!comments.length && <p className="text-xs text-muted">No comments yet.</p>}
          </div>
          <form action={commentAction} className="flex gap-2">
            <input name="body" placeholder="Write a comment…" className="input" />
            <SubmitButton className="btn btn-primary shrink-0" pendingText="Posting…">
              Post
            </SubmitButton>
          </form>
        </div>
      </div>
    </div>
  );
}

'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getCurrentProfile } from '@/lib/auth';
import type { TaskStatus } from '@/lib/types';

export async function createTask(projectId: string, status: TaskStatus, formData: FormData) {
  const title = String(formData.get('title') ?? '').trim();
  if (!title) return;

  const { profile, userId } = await getCurrentProfile();
  if (!profile?.company_id) return;

  const supabase = createClient();
  const { count } = await supabase
    .from('tasks')
    .select('*', { count: 'exact', head: true })
    .eq('project_id', projectId)
    .eq('status', status);

  await supabase.from('tasks').insert({
    project_id: projectId,
    company_id: profile.company_id,
    title,
    status,
    position: count ?? 0,
    created_by: userId,
  });

  revalidatePath(`/dashboard/projects/${projectId}`);
}

export async function updateTaskStatus(taskId: string, projectId: string, status: TaskStatus, position: number) {
  const supabase = createClient();
  await supabase.from('tasks').update({ status, position }).eq('id', taskId);
  revalidatePath(`/dashboard/projects/${projectId}`);
}

export async function updateTask(taskId: string, projectId: string, formData: FormData) {
  const supabase = createClient();
  const update: Record<string, unknown> = {
    title: String(formData.get('title') ?? '').trim(),
    description: String(formData.get('description') ?? ''),
    priority: String(formData.get('priority') ?? 'medium'),
    assignee_id: formData.get('assignee_id') ? String(formData.get('assignee_id')) : null,
    due_date: formData.get('due_date') ? String(formData.get('due_date')) : null,
  };
  await supabase.from('tasks').update(update).eq('id', taskId);
  revalidatePath(`/dashboard/projects/${projectId}`);
}

export async function deleteTask(taskId: string, projectId: string) {
  const supabase = createClient();
  await supabase.from('tasks').delete().eq('id', taskId);
  revalidatePath(`/dashboard/projects/${projectId}`);
}

export async function addComment(taskId: string, projectId: string, formData: FormData) {
  const body = String(formData.get('body') ?? '').trim();
  if (!body) return;
  const { userId } = await getCurrentProfile();
  const supabase = createClient();
  await supabase.from('task_comments').insert({ task_id: taskId, author_id: userId, body });
  revalidatePath(`/dashboard/projects/${projectId}`);
}

export async function recordAttachment(
  taskId: string,
  projectId: string,
  filePath: string,
  fileName: string,
  fileSize: number,
  contentType: string
) {
  const { userId } = await getCurrentProfile();
  const supabase = createClient();
  await supabase.from('task_attachments').insert({
    task_id: taskId,
    uploaded_by: userId,
    file_path: filePath,
    file_name: fileName,
    file_size: fileSize,
    content_type: contentType,
  });
  revalidatePath(`/dashboard/projects/${projectId}`);
}

export async function deleteAttachment(attachmentId: string, filePath: string, projectId: string) {
  const supabase = createClient();
  await supabase.storage.from('attachments').remove([filePath]);
  await supabase.from('task_attachments').delete().eq('id', attachmentId);
  revalidatePath(`/dashboard/projects/${projectId}`);
}

'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getCurrentProfile } from '@/lib/auth';
import { logActivity } from '@/lib/activity';
import type { TaskPriority, TaskStatus } from '@/lib/types';

export async function createTodo(formData: FormData) {
  const title = String(formData.get('title') ?? '').trim();
  if (!title) return;
  const description = String(formData.get('description') ?? '').trim();
  const priority = String(formData.get('priority') ?? 'medium') as TaskPriority;
  const deadline = formData.get('deadline') ? String(formData.get('deadline')) : null;
  const assigneeId = formData.get('assignee_id') ? String(formData.get('assignee_id')) : null;

  const { profile, userId } = await getCurrentProfile();
  if (!profile?.company_id) return;

  const supabase = createClient();
  const { data: task } = await supabase
    .from('tasks')
    .insert({
      company_id: profile.company_id,
      project_id: null,
      title,
      description,
      priority,
      due_date: deadline,
      assignee_id: assigneeId,
      created_by: userId,
    })
    .select()
    .single();

  if (task) {
    await logActivity({
      companyId: profile.company_id,
      actorId: userId,
      action: 'task.created',
      entityType: 'task',
      entityId: task.id,
      metadata: { title, company_level: true },
    });
  }

  revalidatePath('/dashboard/todos');
}

export async function updateTodoStatus(taskId: string, formData: FormData) {
  const status = String(formData.get('status') ?? 'todo') as TaskStatus;
  const { profile, userId } = await getCurrentProfile();
  const supabase = createClient();
  await supabase.from('tasks').update({ status }).eq('id', taskId);
  await logActivity({
    companyId: profile?.company_id ?? null,
    actorId: userId,
    action: 'task.status_changed',
    entityType: 'task',
    entityId: taskId,
    metadata: { status },
  });
  revalidatePath('/dashboard/todos');
}

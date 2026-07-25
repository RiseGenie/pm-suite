'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getCurrentProfile } from '@/lib/auth';
import { logActivity } from '@/lib/activity';
import type { IssueStatus, TaskPriority } from '@/lib/types';

export async function createIssue(formData: FormData) {
  const title = String(formData.get('title') ?? '').trim();
  if (!title) return;
  const description = String(formData.get('description') ?? '').trim();
  const priority = String(formData.get('priority') ?? 'medium') as TaskPriority;
  const deadline = formData.get('deadline') ? String(formData.get('deadline')) : null;
  const assigneeId = formData.get('assignee_id') ? String(formData.get('assignee_id')) : null;

  const { profile, userId } = await getCurrentProfile();
  if (!profile?.company_id) return;

  const supabase = createClient();
  const { data: issue } = await supabase
    .from('issues')
    .insert({
      company_id: profile.company_id,
      title,
      description,
      priority,
      deadline,
      assignee_id: assigneeId,
      created_by: userId,
    })
    .select()
    .single();

  if (issue) {
    await logActivity({
      companyId: profile.company_id,
      actorId: userId,
      action: 'issue.created',
      entityType: 'issue',
      entityId: issue.id,
      metadata: { title },
    });
  }

  revalidatePath('/dashboard/issues');
}

export async function updateIssueStatus(issueId: string, formData: FormData) {
  const status = String(formData.get('status') ?? 'open') as IssueStatus;
  const { profile, userId } = await getCurrentProfile();
  const supabase = createClient();
  await supabase.from('issues').update({ status }).eq('id', issueId);
  await logActivity({
    companyId: profile?.company_id ?? null,
    actorId: userId,
    action: 'issue.status_changed',
    entityType: 'issue',
    entityId: issueId,
    metadata: { status },
  });
  revalidatePath('/dashboard/issues');
}

export async function convertIssueToTodo(issueId: string) {
  const { profile, userId } = await getCurrentProfile();
  if (!profile?.company_id) return;
  const supabase = createClient();

  const { data: issue } = await supabase.from('issues').select('*').eq('id', issueId).single();
  if (!issue) return;

  const { data: task } = await supabase
    .from('tasks')
    .insert({
      company_id: profile.company_id,
      project_id: null,
      title: issue.title,
      description: issue.description,
      priority: issue.priority,
      assignee_id: issue.assignee_id,
      due_date: issue.deadline,
      source_issue_id: issue.id,
      created_by: userId,
    })
    .select()
    .single();

  if (task) {
    await logActivity({
      companyId: profile.company_id,
      actorId: userId,
      action: 'issue.converted_to_todo',
      entityType: 'issue',
      entityId: issueId,
      metadata: { task_id: task.id },
    });
  }

  revalidatePath('/dashboard/issues');
  revalidatePath('/dashboard/todos');
}

export async function convertTaskToIssue(taskId: string) {
  const { profile, userId } = await getCurrentProfile();
  if (!profile?.company_id) return;
  const supabase = createClient();

  const { data: task } = await supabase.from('tasks').select('*').eq('id', taskId).single();
  if (!task) return;

  const { data: issue } = await supabase
    .from('issues')
    .insert({
      company_id: profile.company_id,
      title: task.title,
      description: task.description,
      priority: task.priority,
      assignee_id: task.assignee_id,
      deadline: task.due_date,
      source_task_id: task.id,
      created_by: userId,
    })
    .select()
    .single();

  if (issue) {
    await logActivity({
      companyId: profile.company_id,
      actorId: userId,
      action: 'task.converted_to_issue',
      entityType: 'task',
      entityId: taskId,
      metadata: { issue_id: issue.id },
    });
  }

  revalidatePath('/dashboard/issues');
  revalidatePath('/dashboard/todos');
  revalidatePath('/dashboard/projects');
}

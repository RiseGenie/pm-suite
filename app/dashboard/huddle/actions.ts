'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getCurrentProfile } from '@/lib/auth';
import { logActivity } from '@/lib/activity';
import { sendHuddleRecapEmail } from '@/lib/email';
import type { HuddleItemType } from '@/lib/types';

export async function startHuddle() {
  const { profile, userId } = await getCurrentProfile();
  if (!profile?.company_id) return;

  const supabase = createClient();
  const { data: huddle, error } = await supabase
    .from('huddles')
    .insert({ company_id: profile.company_id, started_by: userId })
    .select()
    .single();

  if (huddle) {
    await logActivity({
      companyId: profile.company_id,
      actorId: userId,
      action: 'huddle.started',
      entityType: 'huddle',
      entityId: huddle.id,
    });
  }
  if (error) {
    console.error('startHuddle failed', error.message);
  }

  revalidatePath('/dashboard/huddle');
}

export async function attachToHuddle(huddleId: string, itemType: HuddleItemType, itemId: string) {
  const { userId } = await getCurrentProfile();
  const supabase = createClient();
  await supabase.from('huddle_discussion_items').insert({
    huddle_id: huddleId,
    item_type: itemType,
    item_id: itemId,
    added_by: userId,
  });
  revalidatePath('/dashboard/huddle');
}

export async function removeFromHuddle(discussionItemId: string) {
  const supabase = createClient();
  await supabase.from('huddle_discussion_items').delete().eq('id', discussionItemId);
  revalidatePath('/dashboard/huddle');
}

export async function saveDiscussionNotes(discussionItemId: string, formData: FormData) {
  const notes = String(formData.get('notes') ?? '');
  const supabase = createClient();
  await supabase.from('huddle_discussion_items').update({ notes }).eq('id', discussionItemId);
  revalidatePath('/dashboard/huddle');
}

export async function createHuddleTodo(huddleId: string, formData: FormData) {
  const title = String(formData.get('title') ?? '').trim();
  if (!title) return;
  const assigneeId = formData.get('assignee_id') ? String(formData.get('assignee_id')) : null;
  const deadline = formData.get('deadline') ? String(formData.get('deadline')) : null;

  const { profile, userId } = await getCurrentProfile();
  if (!profile?.company_id) return;

  const supabase = createClient();
  await supabase.from('tasks').insert({
    company_id: profile.company_id,
    project_id: null,
    title,
    assignee_id: assigneeId,
    due_date: deadline,
    huddle_id: huddleId,
    created_by: userId,
  });

  revalidatePath('/dashboard/huddle');
}

export async function stopHuddle(huddleId: string) {
  const { profile, userId } = await getCurrentProfile();
  if (!profile?.company_id) return;
  const supabase = createClient();

  const [{ data: discussionItems }, { data: newTodos }, { data: members }] = await Promise.all([
    supabase.from('huddle_discussion_items').select('*').eq('huddle_id', huddleId),
    supabase
      .from('tasks')
      .select('id, title, due_date, assignee:profiles!tasks_assignee_id_fkey(full_name)')
      .eq('huddle_id', huddleId),
    supabase
      .from('profiles')
      .select('email, full_name')
      .eq('company_id', profile.company_id)
      .eq('is_active', true)
      .not('email', 'is', null),
  ]);

  const issueIds = (discussionItems ?? []).filter((d) => d.item_type === 'issue').map((d) => d.item_id);
  const todoIds = (discussionItems ?? []).filter((d) => d.item_type === 'todo').map((d) => d.item_id);
  const goalIds = (discussionItems ?? []).filter((d) => d.item_type === 'goal').map((d) => d.item_id);

  const [{ data: issues }, { data: todos }, { data: goals }] = await Promise.all([
    issueIds.length ? supabase.from('issues').select('id, title').in('id', issueIds) : Promise.resolve({ data: [] }),
    todoIds.length ? supabase.from('tasks').select('id, title').in('id', todoIds) : Promise.resolve({ data: [] }),
    goalIds.length ? supabase.from('goals').select('id, title').in('id', goalIds) : Promise.resolve({ data: [] }),
  ]);

  const titleFor = (type: string, id: string) => {
    if (type === 'issue') return issues?.find((i) => i.id === id)?.title ?? 'Untitled issue';
    if (type === 'todo') return todos?.find((t) => t.id === id)?.title ?? 'Untitled todo';
    return goals?.find((g) => g.id === id)?.title ?? 'Untitled goal';
  };

  const discussionSummary = (discussionItems ?? []).map((d) => ({
    type: d.item_type,
    title: titleFor(d.item_type, d.item_id),
    notes: d.notes,
  }));

  const { data: huddle } = await supabase
    .from('huddles')
    .update({
      ended_at: new Date().toISOString(),
      summary: JSON.stringify(discussionSummary),
    })
    .eq('id', huddleId)
    .select()
    .single();

  const recipients = (members ?? []).map((m) => m.email).filter((e): e is string => !!e);

  if (huddle && recipients.length) {
    const { sent } = await sendHuddleRecapEmail({
      recipients,
      startedAt: huddle.started_at,
      endedAt: huddle.ended_at!,
      discussionItems: discussionSummary,
      newTodos: (newTodos ?? []).map((t) => ({
        title: t.title,
        dueDate: t.due_date,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        assignee: (t as any).assignee?.full_name ?? null,
      })),
    });
    if (sent) {
      await supabase.from('huddles').update({ email_sent_at: new Date().toISOString() }).eq('id', huddleId);
    }
  }

  await logActivity({
    companyId: profile.company_id,
    actorId: userId,
    action: 'huddle.stopped',
    entityType: 'huddle',
    entityId: huddleId,
    metadata: { discussed: discussionSummary.length, new_todos: newTodos?.length ?? 0 },
  });

  revalidatePath('/dashboard/huddle');
}

'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getCurrentProfile } from '@/lib/auth';
import { logActivity } from '@/lib/activity';
import type { GoalStatus } from '@/lib/types';

export async function createGoal(formData: FormData) {
  const title = String(formData.get('title') ?? '').trim();
  if (!title) return;
  const description = String(formData.get('description') ?? '').trim();
  const deadline = formData.get('deadline') ? String(formData.get('deadline')) : null;

  const { profile, userId } = await getCurrentProfile();
  if (!profile?.company_id) return;

  const supabase = createClient();
  const { data: goal } = await supabase
    .from('goals')
    .insert({
      company_id: profile.company_id,
      title,
      description,
      deadline,
      created_by: userId,
    })
    .select()
    .single();

  if (goal) {
    await logActivity({
      companyId: profile.company_id,
      actorId: userId,
      action: 'goal.created',
      entityType: 'goal',
      entityId: goal.id,
      metadata: { title },
    });
  }

  revalidatePath('/dashboard/goals');
}

export async function updateGoalStatus(goalId: string, formData: FormData) {
  const status = String(formData.get('status') ?? 'on_track') as GoalStatus;
  const { profile, userId } = await getCurrentProfile();
  const supabase = createClient();
  await supabase.from('goals').update({ status }).eq('id', goalId);
  await logActivity({
    companyId: profile?.company_id ?? null,
    actorId: userId,
    action: 'goal.status_changed',
    entityType: 'goal',
    entityId: goalId,
    metadata: { status },
  });
  revalidatePath('/dashboard/goals');
}

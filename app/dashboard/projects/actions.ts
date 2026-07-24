'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getCurrentProfile } from '@/lib/auth';

export async function createProject(formData: FormData) {
  const name = String(formData.get('name') ?? '').trim();
  const description = String(formData.get('description') ?? '').trim();
  const color = String(formData.get('color') ?? '#4f46e5');
  if (!name) return;

  const { profile, userId } = await getCurrentProfile();
  if (!profile?.company_id) return;

  const supabase = createClient();
  const { data: project, error } = await supabase
    .from('projects')
    .insert({ name, description, color, company_id: profile.company_id, created_by: userId })
    .select()
    .single();

  if (error || !project) return;

  revalidatePath('/dashboard/projects');
  redirect(`/dashboard/projects/${project.id}`);
}

export async function archiveProject(projectId: string) {
  'use server';
  const supabase = createClient();
  await supabase.from('projects').update({ status: 'archived' }).eq('id', projectId);
  revalidatePath('/dashboard/projects');
}

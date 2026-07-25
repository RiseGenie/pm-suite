'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getCurrentProfile } from '@/lib/auth';

export async function updateMyTimezone(formData: FormData) {
  const raw = String(formData.get('timezone') ?? '');
  const timezone = raw ? raw : null;

  const { userId } = await getCurrentProfile();
  if (!userId) return;

  const supabase = createClient();
  await supabase.from('profiles').update({ timezone }).eq('id', userId);

  revalidatePath('/dashboard', 'layout');
  revalidatePath('/admin', 'layout');
  revalidatePath('/super-admin', 'layout');
}

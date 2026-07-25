'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export async function updateAgencyLogo(logoUrl: string) {
  'use server';
  const supabase = createClient();
  await supabase.from('platform_settings').update({ logo_url: logoUrl }).eq('id', true);
  revalidatePath('/super-admin');
  revalidatePath('/super-admin/settings');
}

export async function updateAgencyTimezone(formData: FormData) {
  const timezone = String(formData.get('timezone') ?? 'UTC');
  const supabase = createClient();
  await supabase.from('platform_settings').update({ timezone }).eq('id', true);
  revalidatePath('/super-admin');
  revalidatePath('/super-admin/settings');
}

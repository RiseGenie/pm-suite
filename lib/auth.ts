import { createClient } from '@/lib/supabase/server';
import type { Profile } from '@/lib/types';

export async function getCurrentProfile(): Promise<{ profile: Profile | null; userId: string | null }> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { profile: null, userId: null };

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
  return { profile: profile as Profile | null, userId: user.id };
}

'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getCurrentProfile } from '@/lib/auth';
import { siteOrigin } from '@/lib/site';
import { sendInviteEmail } from '@/lib/email';

export async function inviteMember(formData: FormData) {
  const email = String(formData.get('email') ?? '').trim();
  const role = String(formData.get('role') ?? 'member') as 'member' | 'company_admin';
  if (!email) return;

  const { profile, userId } = await getCurrentProfile();
  if (!profile?.company_id) return;

  const supabase = createClient();
  const [{ data: invite }, { data: company }] = await Promise.all([
    supabase
      .from('invites')
      .insert({
        company_id: profile.company_id,
        email,
        role,
        invited_by: userId,
      })
      .select()
      .single(),
    supabase.from('companies').select('name').eq('id', profile.company_id).single(),
  ]);

  if (invite && company) {
    await sendInviteEmail({
      to: email,
      companyName: company.name,
      role,
      joinUrl: `${siteOrigin()}/join/${invite.token}`,
    });
  }

  revalidatePath('/admin/users');
}

export async function updateMemberRole(memberId: string, role: 'member' | 'company_admin') {
  'use server';
  const supabase = createClient();
  await supabase.from('profiles').update({ role }).eq('id', memberId);
  revalidatePath('/admin/users');
}

export async function toggleMemberActive(memberId: string, isActive: boolean) {
  'use server';
  const supabase = createClient();
  await supabase.from('profiles').update({ is_active: !isActive }).eq('id', memberId);
  revalidatePath('/admin/users');
}

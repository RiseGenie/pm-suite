'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { siteOrigin } from '@/lib/site';

export async function acceptInvite(token: string, formData: FormData) {
  const fullName = String(formData.get('full_name') ?? '');
  const password = String(formData.get('password') ?? '');
  const supabase = createClient();

  const { data: invite, error: lookupError } = (await supabase
    .rpc('get_invite_by_token', { p_token: token })
    .maybeSingle()) as {
    data: { email: string; role: string; company_id: string; company_name: string; accepted_at: string | null } | null;
    error: unknown;
  };

  if (lookupError || !invite) {
    redirect(`/join/${token}?error=${encodeURIComponent('This invite link is invalid.')}`);
  }
  if (invite!.accepted_at) {
    redirect(`/join/${token}?error=${encodeURIComponent('This invite has already been used.')}`);
  }

  const { error: signUpError, data: signUpData } = await supabase.auth.signUp({
    email: invite!.email,
    password,
    options: {
      data: {
        full_name: fullName,
        role: invite!.role,
        company_id: invite!.company_id,
      },
      emailRedirectTo: `${siteOrigin()}/auth/callback`,
    },
  });

  if (signUpError) {
    redirect(`/join/${token}?error=${encodeURIComponent(signUpError.message)}`);
  }

  if (signUpData.session) {
    await supabase.rpc('accept_invite', { p_token: token });
    redirect('/');
  }

  redirect('/login?message=Check your email to confirm your account, then sign in.');
}

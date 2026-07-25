'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { siteOrigin } from '@/lib/site';
import { sendInviteEmail } from '@/lib/email';

function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export async function createCompany(formData: FormData) {
  const name = String(formData.get('name') ?? '').trim();
  const adminEmail = String(formData.get('admin_email') ?? '').trim();
  if (!name) return;

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: company, error } = await supabase
    .from('companies')
    .insert({ name, slug: slugify(name) + '-' + Math.random().toString(36).slice(2, 6), created_by: user?.id })
    .select()
    .single();

  if (error || !company) {
    redirect(`/super-admin/companies?error=${encodeURIComponent(error?.message ?? 'Could not create company')}`);
  }

  await supabase.from('company_themes').insert({ company_id: company.id });

  if (adminEmail) {
    const { data: invite } = await supabase
      .from('invites')
      .insert({
        company_id: company.id,
        email: adminEmail,
        role: 'company_admin',
        invited_by: user?.id,
      })
      .select()
      .single();

    if (invite) {
      await sendInviteEmail({
        to: adminEmail,
        companyName: company.name,
        role: 'company_admin',
        joinUrl: `${siteOrigin()}/join/${invite.token}`,
      });
    }
  }

  revalidatePath('/super-admin/companies');
  redirect(`/super-admin/companies/${company.id}`);
}

export async function toggleCompanyActive(companyId: string, isActive: boolean) {
  'use server';
  const supabase = createClient();
  await supabase.from('companies').update({ is_active: !isActive }).eq('id', companyId);
  revalidatePath('/super-admin/companies');
  revalidatePath(`/super-admin/companies/${companyId}`);
}

export async function inviteCompanyAdmin(companyId: string, formData: FormData) {
  const email = String(formData.get('admin_email') ?? '').trim();
  if (!email) return;
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: invite }, { data: company }] = await Promise.all([
    supabase
      .from('invites')
      .insert({
        company_id: companyId,
        email,
        role: 'company_admin',
        invited_by: user?.id,
      })
      .select()
      .single(),
    supabase.from('companies').select('name').eq('id', companyId).single(),
  ]);

  if (invite && company) {
    await sendInviteEmail({
      to: email,
      companyName: company.name,
      role: 'company_admin',
      joinUrl: `${siteOrigin()}/join/${invite.token}`,
    });
  }

  revalidatePath(`/super-admin/companies/${companyId}`);
}

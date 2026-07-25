'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getCurrentProfile } from '@/lib/auth';
import { sendBugReportEmail } from '@/lib/email';
import { logActivity } from '@/lib/activity';

export async function submitBugReport(formData: FormData) {
  const title = String(formData.get('title') ?? '').trim();
  const description = String(formData.get('description') ?? '').trim();
  const severity = String(formData.get('severity') ?? 'medium') as 'low' | 'medium' | 'high' | 'critical';
  if (!title || !description) return;

  const { profile, userId } = await getCurrentProfile();
  if (!profile?.company_id) return;

  const supabase = createClient();
  const [{ data: report }, { data: company }] = await Promise.all([
    supabase
      .from('bug_reports')
      .insert({
        company_id: profile.company_id,
        reported_by: userId,
        title,
        description,
        severity,
      })
      .select()
      .single(),
    supabase.from('companies').select('name').eq('id', profile.company_id).single(),
  ]);

  if (report && company) {
    await sendBugReportEmail({
      companyName: company.name,
      reporterName: profile.full_name ?? 'A company admin',
      title,
      description,
      severity,
    });
    await logActivity({
      companyId: profile.company_id,
      actorId: userId,
      action: 'bug.reported',
      entityType: 'bug_report',
      entityId: report.id,
      metadata: { title, severity },
    });
  }

  revalidatePath('/admin/support');
}

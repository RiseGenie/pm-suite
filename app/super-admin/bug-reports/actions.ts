'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export async function updateBugReportStatus(reportId: string, formData: FormData) {
  const status = String(formData.get('status') ?? 'open') as 'open' | 'in_progress' | 'resolved';
  const supabase = createClient();
  await supabase.from('bug_reports').update({ status }).eq('id', reportId);
  revalidatePath('/super-admin/bug-reports');
}

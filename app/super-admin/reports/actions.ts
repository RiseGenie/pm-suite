'use server';

import { createClient } from '@/lib/supabase/server';
import { buildReportData, reportToHtml } from '@/lib/report';
import { sendReportEmail } from '@/lib/email';

export async function emailReportNow() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) return { sent: false };

  const report = await buildReportData(supabase);
  const result = await sendReportEmail({
    to: user.email,
    subject: `PM Suite platform report — ${new Date().toLocaleDateString()}`,
    html: reportToHtml(report),
  });
  return result;
}

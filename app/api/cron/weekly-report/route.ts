import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { buildReportData, reportToHtml } from '@/lib/report';
import { sendReportEmail, OWNER_EMAIL } from '@/lib/email';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const auth = request.headers.get('authorization');
    if (auth !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    console.error('SUPABASE_SERVICE_ROLE_KEY is not set; cannot run scheduled report');
    return NextResponse.json({ error: 'Service role key not configured' }, { status: 500 });
  }

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceRoleKey);

  const report = await buildReportData(supabase);
  const result = await sendReportEmail({
    to: OWNER_EMAIL,
    subject: `PM Suite weekly report — ${new Date().toLocaleDateString()}`,
    html: reportToHtml(report),
  });

  return NextResponse.json({ sent: result.sent, totals: report.totals });
}

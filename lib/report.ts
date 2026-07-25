import type { SupabaseClient } from '@supabase/supabase-js';

export interface ReportData {
  generatedAt: string;
  totals: {
    companies: number;
    users: number;
    projects: number;
    tasks: number;
    tasksCompleted: number;
    openBugs: number;
  };
  companies: {
    company_id: string;
    name: string;
    is_active: boolean;
    user_count: number;
    project_count: number;
    task_count: number;
    completed_task_count: number;
    open_bug_count: number;
    last_activity_at: string | null;
  }[];
  recentBugs: {
    id: string;
    title: string;
    severity: string;
    status: string;
    created_at: string;
    company_name: string | null;
  }[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function buildReportData(supabase: SupabaseClient<any>): Promise<ReportData> {
  const [
    { count: companies },
    { count: users },
    { count: projects },
    { count: tasks },
    { count: tasksCompleted },
    { count: openBugs },
    { data: companyStats },
    { data: bugRows },
  ] = await Promise.all([
    supabase.from('companies').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('projects').select('*', { count: 'exact', head: true }),
    supabase.from('tasks').select('*', { count: 'exact', head: true }),
    supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('status', 'done'),
    supabase.from('bug_reports').select('*', { count: 'exact', head: true }).neq('status', 'resolved'),
    supabase.from('company_stats').select('*').order('name'),
    supabase
      .from('bug_reports')
      .select('id, title, severity, status, created_at, company:companies(name)')
      .order('created_at', { ascending: false })
      .limit(10),
  ]);

  return {
    generatedAt: new Date().toISOString(),
    totals: {
      companies: companies ?? 0,
      users: users ?? 0,
      projects: projects ?? 0,
      tasks: tasks ?? 0,
      tasksCompleted: tasksCompleted ?? 0,
      openBugs: openBugs ?? 0,
    },
    companies: companyStats ?? [],
    recentBugs: (bugRows ?? []).map((b) => ({
      id: b.id,
      title: b.title,
      severity: b.severity,
      status: b.status,
      created_at: b.created_at,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      company_name: (b as any).company?.name ?? null,
    })),
  };
}

export function reportToHtml(report: ReportData) {
  const companyRows = report.companies
    .map(
      (c) => `
        <tr>
          <td style="padding:6px 10px; border-bottom:1px solid #e2e8f0;">${c.name}</td>
          <td style="padding:6px 10px; border-bottom:1px solid #e2e8f0;">${c.is_active ? 'Active' : 'Suspended'}</td>
          <td style="padding:6px 10px; border-bottom:1px solid #e2e8f0;">${c.user_count}</td>
          <td style="padding:6px 10px; border-bottom:1px solid #e2e8f0;">${c.project_count}</td>
          <td style="padding:6px 10px; border-bottom:1px solid #e2e8f0;">${c.task_count}</td>
          <td style="padding:6px 10px; border-bottom:1px solid #e2e8f0;">${c.completed_task_count}</td>
          <td style="padding:6px 10px; border-bottom:1px solid #e2e8f0;">${c.open_bug_count}</td>
        </tr>`
    )
    .join('');

  const bugRows = report.recentBugs
    .map(
      (b) => `
        <tr>
          <td style="padding:6px 10px; border-bottom:1px solid #e2e8f0;">${b.title}</td>
          <td style="padding:6px 10px; border-bottom:1px solid #e2e8f0;">${b.company_name ?? '—'}</td>
          <td style="padding:6px 10px; border-bottom:1px solid #e2e8f0; text-transform:capitalize;">${b.severity}</td>
          <td style="padding:6px 10px; border-bottom:1px solid #e2e8f0; text-transform:capitalize;">${b.status.replace('_', ' ')}</td>
        </tr>`
    )
    .join('');

  return `
    <div style="font-family: system-ui, sans-serif; max-width: 640px; margin: 0 auto;">
      <h2 style="color:#0f172a;">PM Suite platform report</h2>
      <p style="color:#64748b; font-size:12px;">Generated ${new Date(report.generatedAt).toLocaleString()}</p>

      <table style="border-collapse:collapse; width:100%; margin:16px 0;">
        <tr>
          <td style="padding:8px; background:#f8fafc; font-weight:600;">Companies</td><td style="padding:8px;">${report.totals.companies}</td>
          <td style="padding:8px; background:#f8fafc; font-weight:600;">Users</td><td style="padding:8px;">${report.totals.users}</td>
        </tr>
        <tr>
          <td style="padding:8px; background:#f8fafc; font-weight:600;">Projects</td><td style="padding:8px;">${report.totals.projects}</td>
          <td style="padding:8px; background:#f8fafc; font-weight:600;">Tasks</td><td style="padding:8px;">${report.totals.tasks} (${report.totals.tasksCompleted} done)</td>
        </tr>
        <tr>
          <td style="padding:8px; background:#f8fafc; font-weight:600;">Open bugs</td><td style="padding:8px;" colspan="3">${report.totals.openBugs}</td>
        </tr>
      </table>

      <h3 style="color:#0f172a;">Companies</h3>
      <table style="border-collapse:collapse; width:100%; font-size:13px;">
        <thead>
          <tr style="text-align:left; color:#64748b;">
            <th style="padding:6px 10px;">Company</th><th style="padding:6px 10px;">Status</th><th style="padding:6px 10px;">Users</th>
            <th style="padding:6px 10px;">Projects</th><th style="padding:6px 10px;">Tasks</th><th style="padding:6px 10px;">Done</th><th style="padding:6px 10px;">Open bugs</th>
          </tr>
        </thead>
        <tbody>${companyRows || '<tr><td style="padding:8px;" colspan="7">No companies yet.</td></tr>'}</tbody>
      </table>

      <h3 style="color:#0f172a; margin-top:20px;">Recent bug reports</h3>
      <table style="border-collapse:collapse; width:100%; font-size:13px;">
        <thead>
          <tr style="text-align:left; color:#64748b;">
            <th style="padding:6px 10px;">Title</th><th style="padding:6px 10px;">Company</th><th style="padding:6px 10px;">Severity</th><th style="padding:6px 10px;">Status</th>
          </tr>
        </thead>
        <tbody>${bugRows || '<tr><td style="padding:8px;" colspan="4">No bug reports yet.</td></tr>'}</tbody>
      </table>
    </div>
  `;
}

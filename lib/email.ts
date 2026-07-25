const FROM_ADDRESS = 'PM Suite <invites@ml.risegenie.com>';
export const OWNER_EMAIL = process.env.OWNER_EMAIL || 'risegenie@gmail.com';

async function sendEmail({ to, subject, html }: { to: string | string[]; subject: string; html: string }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('RESEND_API_KEY is not set; skipping email to', to);
    return { sent: false };
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from: FROM_ADDRESS, to, subject, html }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    console.error('Resend email failed', res.status, body);
    return { sent: false };
  }

  return { sent: true };
}

export async function sendInviteEmail({
  to,
  companyName,
  role,
  joinUrl,
}: {
  to: string;
  companyName: string;
  role: string;
  joinUrl: string;
}) {
  const roleLabel = role === 'company_admin' ? 'a company admin' : 'a member';

  return sendEmail({
    to,
    subject: `You're invited to join ${companyName} on PM Suite`,
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color:#0f172a;">Join ${companyName} on PM Suite</h2>
        <p style="color:#334155;">You've been invited as ${roleLabel}.</p>
        <p>
          <a href="${joinUrl}" style="display:inline-block; background:#4f46e5; color:#fff; padding:10px 20px; border-radius:6px; text-decoration:none; font-weight:600;">
            Accept invite
          </a>
        </p>
        <p style="color:#94a3b8; font-size:12px;">If the button doesn't work, copy this link: ${joinUrl}</p>
      </div>
    `,
  });
}

export async function sendBugReportEmail({
  companyName,
  reporterName,
  title,
  description,
  severity,
}: {
  companyName: string;
  reporterName: string;
  title: string;
  description: string;
  severity: string;
}) {
  const severityColor: Record<string, string> = {
    low: '#64748b',
    medium: '#2563eb',
    high: '#d97706',
    critical: '#dc2626',
  };

  return sendEmail({
    to: OWNER_EMAIL,
    subject: `[Bug report] ${title} — ${companyName}`,
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 560px; margin: 0 auto;">
        <h2 style="color:#0f172a;">New bug report</h2>
        <p style="color:#334155;">
          <strong>Company:</strong> ${companyName}<br/>
          <strong>Reported by:</strong> ${reporterName}<br/>
          <strong>Severity:</strong> <span style="color:${severityColor[severity] ?? '#334155'}; font-weight:600; text-transform:capitalize;">${severity}</span>
        </p>
        <h3 style="color:#0f172a; margin-bottom:4px;">${title}</h3>
        <p style="color:#334155; white-space:pre-wrap;">${description}</p>
      </div>
    `,
  });
}

export async function sendReportEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  return sendEmail({ to, subject, html });
}

function formatDuration(startedAt: string, endedAt: string) {
  const ms = new Date(endedAt).getTime() - new Date(startedAt).getTime();
  const minutes = Math.max(1, Math.round(ms / 60000));
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
}

export async function sendHuddleRecapEmail({
  recipients,
  startedAt,
  endedAt,
  discussionItems,
  newTodos,
}: {
  recipients: string[];
  startedAt: string;
  endedAt: string;
  discussionItems: { type: string; title: string; notes: string | null }[];
  newTodos: { title: string; dueDate: string | null; assignee: string | null }[];
}) {
  if (!recipients.length) return { sent: false };

  const typeLabel: Record<string, string> = { issue: 'Issue', todo: 'Todo', goal: 'Goal' };

  const discussionRows = discussionItems.length
    ? discussionItems
        .map(
          (d) => `
        <tr>
          <td style="padding:6px 10px; border-bottom:1px solid #e2e8f0;"><span style="background:#f1f5f9; padding:2px 6px; border-radius:4px; font-size:11px;">${typeLabel[d.type] ?? d.type}</span></td>
          <td style="padding:6px 10px; border-bottom:1px solid #e2e8f0; font-weight:600;">${d.title}</td>
          <td style="padding:6px 10px; border-bottom:1px solid #e2e8f0; color:#334155; white-space:pre-wrap;">${d.notes || '—'}</td>
        </tr>`
        )
        .join('')
    : '<tr><td style="padding:8px;" colspan="3">Nothing was brought up in this huddle.</td></tr>';

  const todoRows = newTodos.length
    ? newTodos
        .map(
          (t) => `
        <tr>
          <td style="padding:6px 10px; border-bottom:1px solid #e2e8f0; font-weight:600;">${t.title}</td>
          <td style="padding:6px 10px; border-bottom:1px solid #e2e8f0;">${t.assignee ?? 'Unassigned'}</td>
          <td style="padding:6px 10px; border-bottom:1px solid #e2e8f0;">${t.dueDate ?? '—'}</td>
        </tr>`
        )
        .join('')
    : '<tr><td style="padding:8px;" colspan="3">No new todos were assigned.</td></tr>';

  const html = `
    <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color:#0f172a;">Huddle recap</h2>
      <p style="color:#64748b; font-size:12px;">
        ${new Date(startedAt).toLocaleString()} — ${new Date(endedAt).toLocaleString()}
        (${formatDuration(startedAt, endedAt)})
      </p>

      <h3 style="color:#0f172a; margin-top:20px;">What was discussed</h3>
      <table style="border-collapse:collapse; width:100%; font-size:13px;">
        <thead>
          <tr style="text-align:left; color:#64748b;">
            <th style="padding:6px 10px;">Type</th><th style="padding:6px 10px;">Item</th><th style="padding:6px 10px;">Notes</th>
          </tr>
        </thead>
        <tbody>${discussionRows}</tbody>
      </table>

      <h3 style="color:#0f172a; margin-top:20px;">Newly assigned todos</h3>
      <table style="border-collapse:collapse; width:100%; font-size:13px;">
        <thead>
          <tr style="text-align:left; color:#64748b;">
            <th style="padding:6px 10px;">Todo</th><th style="padding:6px 10px;">Assignee</th><th style="padding:6px 10px;">Due</th>
          </tr>
        </thead>
        <tbody>${todoRows}</tbody>
      </table>
    </div>
  `;

  return sendEmail({
    to: recipients,
    subject: `Huddle recap — ${new Date(startedAt).toLocaleDateString()}`,
    html,
  });
}

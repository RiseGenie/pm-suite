const FROM_ADDRESS = 'PM Suite <invites@ml.risegenie.com>';
export const OWNER_EMAIL = process.env.OWNER_EMAIL || 'risegenie@gmail.com';

async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
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

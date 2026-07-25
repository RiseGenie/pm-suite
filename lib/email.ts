const FROM_ADDRESS = 'PM Suite <invites@ml.risegenie.com>';

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
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('RESEND_API_KEY is not set; skipping invite email to', to);
    return { sent: false };
  }

  const roleLabel = role === 'company_admin' ? 'a company admin' : 'a member';

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: FROM_ADDRESS,
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
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    console.error('Resend invite email failed', res.status, body);
    return { sent: false };
  }

  return { sent: true };
}

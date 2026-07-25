'use client';

import { useState, useTransition } from 'react';

export function EmailReportButton({ action }: { action: () => Promise<{ sent: boolean }> }) {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<'sent' | 'failed' | null>(null);

  return (
    <div className="flex items-center gap-2">
      <button
        className={`btn btn-secondary text-xs ${isPending ? 'opacity-60 cursor-wait' : ''}`}
        disabled={isPending}
        onClick={() => {
          setResult(null);
          startTransition(async () => {
            const res = await action();
            setResult(res.sent ? 'sent' : 'failed');
          });
        }}
      >
        {isPending ? 'Sending…' : 'Email this report to me'}
      </button>
      {result === 'sent' && <span className="text-xs text-success">Sent!</span>}
      {result === 'failed' && <span className="text-xs text-danger">Could not send — check RESEND_API_KEY.</span>}
    </div>
  );
}

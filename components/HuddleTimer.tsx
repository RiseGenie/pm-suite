'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

function formatElapsed(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

export function HuddleTimer({ startedAt }: { startedAt: string }) {
  const [elapsed, setElapsed] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const started = new Date(startedAt).getTime();
    const tick = () => setElapsed(Date.now() - started);
    tick();
    const interval = setInterval(tick, 1000);
    // Refresh server data periodically so everyone sees new discussion items / todos
    const refreshInterval = setInterval(() => router.refresh(), 5000);
    return () => {
      clearInterval(interval);
      clearInterval(refreshInterval);
    };
  }, [startedAt, router]);

  return (
    <span className="font-mono text-3xl font-bold tabular-nums" style={{ color: 'var(--color-primary)' }}>
      {formatElapsed(elapsed)}
    </span>
  );
}

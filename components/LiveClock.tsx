'use client';

import { useEffect, useState } from 'react';

export function LiveClock({ timezone }: { timezone: string }) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  if (!now) return <div className="text-xs text-muted h-8" />;

  let dateStr: string;
  let timeStr: string;
  let tzLabel: string;

  try {
    dateStr = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    }).format(now);
    timeStr = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    }).format(now);
    tzLabel =
      new Intl.DateTimeFormat('en-US', { timeZone: timezone, timeZoneName: 'short' })
        .formatToParts(now)
        .find((p) => p.type === 'timeZoneName')?.value ?? timezone;
  } catch {
    dateStr = now.toDateString();
    timeStr = now.toLocaleTimeString();
    tzLabel = 'UTC';
  }

  return (
    <div className="text-right leading-tight">
      <p className="text-sm font-semibold tabular-nums">{timeStr}</p>
      <p className="text-xs text-muted">
        {dateStr} · {tzLabel}
      </p>
    </div>
  );
}

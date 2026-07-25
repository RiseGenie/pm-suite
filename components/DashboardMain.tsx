import { LiveClock } from '@/components/LiveClock';

export function DashboardMain({ timezone, children }: { timezone: string; children: React.ReactNode }) {
  return (
    <div className="flex-1 flex flex-col min-w-0">
      <header
        className="flex justify-end items-center px-8 py-3 border-b"
        style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}
      >
        <LiveClock timezone={timezone} />
      </header>
      <main className="flex-1 p-8 max-w-6xl">{children}</main>
    </div>
  );
}

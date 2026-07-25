import { LiveClock } from '@/components/LiveClock';
import { RoleSelect } from '@/components/RoleSelect';
import { updateMyTimezone } from '@/app/_actions/profile';
import { listTimezones } from '@/lib/timezones';

export function DashboardMain({
  timezone,
  myTimezone,
  children,
}: {
  timezone: string;
  myTimezone: string | null;
  children: React.ReactNode;
}) {
  const options = [{ value: '', label: 'Use default timezone' }, ...listTimezones().map((tz) => ({ value: tz, label: tz }))];

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <header
        className="flex justify-end items-center gap-3 px-8 py-3 border-b"
        style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}
      >
        <RoleSelect action={updateMyTimezone} currentRole={myTimezone ?? ''} options={options} />
        <LiveClock timezone={timezone} />
      </header>
      <main className="flex-1 p-8 max-w-6xl">{children}</main>
    </div>
  );
}

import { createClient } from '@/lib/supabase/server';
import { updateAgencyLogo, updateAgencyTimezone } from './actions';
import { LogoUploader } from '@/components/LogoUploader';
import { SubmitButton } from '@/components/SubmitButton';
import { listTimezones } from '@/lib/timezones';

export default async function PlatformSettingsPage() {
  const supabase = createClient();
  const { data: settings } = await supabase.from('platform_settings').select('*').eq('id', true).single();
  const timezones = listTimezones();

  return (
    <div className="space-y-6 max-w-lg">
      <h1 className="text-2xl font-bold">Platform settings</h1>
      <p className="text-sm text-muted -mt-4">
        This branding and timezone apply platform-wide — shown alongside each company&apos;s own logo, and used as
        the default clock for any company that hasn&apos;t set its own timezone.
      </p>

      <div className="card p-5">
        <h2 className="font-semibold mb-3">Agency logo</h2>
        <LogoUploader
          scopeFolder="agency"
          currentUrl={settings?.logo_url ?? null}
          action={updateAgencyLogo}
          label="Agency logo"
        />
      </div>

      <div className="card p-5">
        <h2 className="font-semibold mb-3">Default timezone</h2>
        <form action={updateAgencyTimezone} className="flex gap-2">
          <select name="timezone" defaultValue={settings?.timezone ?? 'UTC'} className="input">
            {timezones.map((tz) => (
              <option key={tz} value={tz}>
                {tz}
              </option>
            ))}
          </select>
          <SubmitButton className="btn btn-primary shrink-0" pendingText="Saving…">
            Save
          </SubmitButton>
        </form>
      </div>
    </div>
  );
}

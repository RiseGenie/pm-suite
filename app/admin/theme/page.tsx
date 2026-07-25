import { createClient } from '@/lib/supabase/server';
import { getCurrentProfile } from '@/lib/auth';
import { updateCompanyTheme, resetCompanyTheme } from '@/app/_actions/theme';
import { ThemeCustomizerForm } from '@/components/ThemeCustomizerForm';
import { SubmitButton } from '@/components/SubmitButton';
import type { CompanyTheme } from '@/lib/types';

export default async function ThemePage() {
  const { profile } = await getCurrentProfile();
  const supabase = createClient();
  const { data: theme } = await supabase
    .from('company_themes')
    .select('*')
    .eq('company_id', profile!.company_id)
    .single();

  const action = updateCompanyTheme.bind(null, profile!.company_id!);
  const reset = resetCompanyTheme.bind(null, profile!.company_id!);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Theme customizer</h1>
        <form action={reset}>
          <SubmitButton className="btn btn-secondary text-xs" pendingText="Resetting…">
            Reset to defaults
          </SubmitButton>
        </form>
      </div>
      <p className="text-sm text-muted -mt-2">
        Every color, font and shape here applies instantly across your whole workspace for all your users.
      </p>
      {theme && <ThemeCustomizerForm theme={theme as CompanyTheme} action={action} />}
    </div>
  );
}

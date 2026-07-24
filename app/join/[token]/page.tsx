import { createClient } from '@/lib/supabase/server';
import { acceptInvite } from './actions';

export default async function JoinPage({
  params,
  searchParams,
}: {
  params: { token: string };
  searchParams: { error?: string };
}) {
  const supabase = createClient();
  const { data: invite } = (await supabase
    .rpc('get_invite_by_token', { p_token: params.token })
    .maybeSingle()) as {
    data: { email: string; role: string; company_id: string; company_name: string; accepted_at: string | null } | null;
  };

  if (!invite) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-600">This invite link is invalid or has expired.</p>
      </div>
    );
  }

  if (invite.accepted_at) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-600">This invite has already been used. Try signing in instead.</p>
      </div>
    );
  }

  const boundAction = acceptInvite.bind(null, params.token);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm space-y-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900">Join {invite.company_name}</h1>
          <p className="text-slate-500 text-sm mt-1">
            You&apos;ve been invited as {invite.role === 'company_admin' ? 'a company admin' : 'a member'}
          </p>
        </div>

        {searchParams.error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-2">
            {searchParams.error}
          </p>
        )}

        <form action={boundAction} className="space-y-3 card p-6">
          <div>
            <label className="text-sm font-medium">Email</label>
            <input value={invite.email} disabled className="input mt-1 opacity-60" />
          </div>
          <div>
            <label className="text-sm font-medium">Full name</label>
            <input name="full_name" required className="input mt-1" />
          </div>
          <div>
            <label className="text-sm font-medium">Password</label>
            <input name="password" type="password" required minLength={6} className="input mt-1" />
          </div>
          <button className="btn btn-primary w-full" type="submit">
            Create account
          </button>
        </form>
      </div>
    </div>
  );
}

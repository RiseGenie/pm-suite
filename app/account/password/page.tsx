import { updatePassword } from './actions';

export default function ChangePasswordPage({
  searchParams,
}: {
  searchParams: { error?: string; message?: string };
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900">Change password</h1>
          <p className="text-slate-500 text-sm mt-1">Choose a new password for your account.</p>
        </div>

        {searchParams.error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-2">
            {searchParams.error}
          </p>
        )}
        {searchParams.message && (
          <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-md p-2">
            {searchParams.message}
          </p>
        )}

        <form action={updatePassword} className="space-y-3 card p-6">
          <div>
            <label className="text-sm font-medium">New password</label>
            <input
              name="password"
              type="password"
              required
              minLength={6}
              className="input mt-1"
              autoComplete="new-password"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Confirm new password</label>
            <input
              name="confirm_password"
              type="password"
              required
              minLength={6}
              className="input mt-1"
              autoComplete="new-password"
            />
          </div>
          <button className="btn btn-primary w-full" type="submit">
            Update password
          </button>
        </form>
      </div>
    </div>
  );
}

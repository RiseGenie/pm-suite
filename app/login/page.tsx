import { login, bootstrapSignUp } from './actions';

export default function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string; message?: string };
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900">PM Suite</h1>
          <p className="text-slate-500 text-sm mt-1">Sign in to your workspace</p>
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

        <form action={login} className="space-y-3 card p-6">
          <div>
            <label className="text-sm font-medium">Email</label>
            <input name="email" type="email" required className="input mt-1" />
          </div>
          <div>
            <label className="text-sm font-medium">Password</label>
            <input name="password" type="password" required className="input mt-1" />
          </div>
          <button className="btn btn-primary w-full" type="submit">
            Sign in
          </button>
        </form>

        <details className="text-sm text-slate-500">
          <summary className="cursor-pointer">First time setting up? Create the owner account</summary>
          <form action={bootstrapSignUp} className="space-y-3 mt-3 card p-6">
            <p className="text-xs text-slate-500">
              The very first account created becomes the platform owner (super admin). Everyone else joins via an
              invite link.
            </p>
            <div>
              <label className="text-sm font-medium">Full name</label>
              <input name="full_name" required className="input mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Email</label>
              <input name="email" type="email" required className="input mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Password</label>
              <input name="password" type="password" required minLength={6} className="input mt-1" />
            </div>
            <button className="btn btn-secondary w-full" type="submit">
              Create owner account
            </button>
          </form>
        </details>
      </div>
    </div>
  );
}

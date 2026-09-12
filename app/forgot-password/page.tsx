import Link from 'next/link';
import { requestPasswordReset } from '@/app/login/actions';

export default function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: { error?: string; message?: string };
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900">Reset your password</h1>
          <p className="text-slate-500 text-sm mt-1">
            We&apos;ll email you a link to choose a new one.
          </p>
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

        <form action={requestPasswordReset} className="space-y-3 card p-6">
          <div>
            <label className="text-sm font-medium">Email</label>
            <input name="email" type="email" required className="input mt-1" />
          </div>
          <button className="btn btn-primary w-full" type="submit">
            Send reset link
          </button>
        </form>

        <p className="text-sm text-center text-slate-500">
          <Link href="/login" className="underline">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

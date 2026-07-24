export default function NoAccessPage() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="card p-8 text-center max-w-sm">
        <h1 className="text-lg font-semibold mb-2">No access</h1>
        <p className="text-muted text-sm">
          You don&apos;t have permission to view this page. Contact your admin if you think this is a mistake.
        </p>
        <a href="/" className="btn btn-primary mt-4">
          Go home
        </a>
      </div>
    </div>
  );
}

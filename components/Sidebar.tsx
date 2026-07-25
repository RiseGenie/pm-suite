import Link from 'next/link';
import { signOut } from '@/app/login/actions';

export interface NavLink {
  href: string;
  label: string;
}

export function Sidebar({
  title,
  links,
  agencyLogoUrl,
  companyLogoUrl,
}: {
  title: string;
  links: NavLink[];
  agencyLogoUrl?: string | null;
  companyLogoUrl?: string | null;
}) {
  const hasLogos = agencyLogoUrl || companyLogoUrl;

  return (
    <aside
      className="w-60 shrink-0 flex flex-col justify-between min-h-screen p-4"
      style={{ backgroundColor: 'var(--color-sidebar-bg)', color: 'var(--color-sidebar-text)' }}
    >
      <div>
        {hasLogos ? (
          <div className="flex items-center gap-2 px-2 py-3">
            {agencyLogoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={agencyLogoUrl} alt="Agency logo" className="h-8 w-8 object-contain rounded bg-white/10 p-0.5" />
            )}
            {companyLogoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={companyLogoUrl} alt="Company logo" className="h-8 w-8 object-contain rounded bg-white/10 p-0.5" />
            )}
            <span className="font-bold text-sm truncate">{title}</span>
          </div>
        ) : (
          <div className="px-2 py-3 font-bold text-lg">{title}</div>
        )}
        <nav className="mt-4 space-y-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block px-3 py-2 rounded-theme text-sm opacity-90 hover:opacity-100 hover:bg-white/10"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
      <form action={signOut}>
        <button className="w-full text-left px-3 py-2 rounded-theme text-sm opacity-80 hover:opacity-100 hover:bg-white/10">
          Sign out
        </button>
      </form>
    </aside>
  );
}

import { Sidebar } from '@/components/Sidebar';

const LINKS = [
  { href: '/super-admin', label: 'Overview' },
  { href: '/super-admin/companies', label: 'Companies' },
];

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex">
      <Sidebar title="PM Suite · Owner" links={LINKS} />
      <main className="flex-1 p-8 max-w-6xl">{children}</main>
    </div>
  );
}

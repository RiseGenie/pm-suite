create type public.bug_severity as enum ('low', 'medium', 'high', 'critical');
create type public.bug_status as enum ('open', 'in_progress', 'resolved');

create table public.bug_reports (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  reported_by uuid references public.profiles(id) on delete set null,
  title text not null,
  description text not null,
  severity public.bug_severity not null default 'medium',
  status public.bug_status not null default 'open',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index bug_reports_company_id_idx on public.bug_reports(company_id);

create trigger bug_reports_set_updated_at before update on public.bug_reports
  for each row execute function public.set_updated_at();

alter table public.bug_reports enable row level security;

create policy bug_reports_select on public.bug_reports for select
  using (public.is_super_admin() or company_id = public.current_company_id());
create policy bug_reports_insert on public.bug_reports for insert
  with check (public.is_super_admin() or company_id = public.current_company_id());
create policy bug_reports_update on public.bug_reports for update
  using (public.is_super_admin());

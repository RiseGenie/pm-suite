create table public.platform_settings (
  id boolean primary key default true,
  logo_url text,
  timezone text not null default 'UTC',
  updated_at timestamptz not null default now(),
  constraint platform_settings_singleton check (id)
);
insert into public.platform_settings (id) values (true);

create trigger platform_settings_set_updated_at before update on public.platform_settings
  for each row execute function public.set_updated_at();

alter table public.platform_settings enable row level security;

create policy platform_settings_select on public.platform_settings for select
  using (true);
create policy platform_settings_update on public.platform_settings for update
  using (public.is_super_admin());

alter table public.company_themes add column timezone text not null default 'UTC';

-- ============================================================
-- pm-suite core schema: multi-tenant PM tool with 3-tier roles
-- ============================================================

create extension if not exists pgcrypto;

create type public.user_role as enum ('super_admin', 'company_admin', 'member');
create type public.task_status as enum ('todo', 'in_progress', 'in_review', 'done');
create type public.task_priority as enum ('low', 'medium', 'high', 'urgent');
create type public.project_status as enum ('active', 'on_hold', 'completed', 'archived');

-- ------------------------------------------------------------
-- Companies (tenants)
-- ------------------------------------------------------------
create table public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  is_active boolean not null default true,
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- Profiles (extends auth.users)
-- ------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  company_id uuid references public.companies(id) on delete set null,
  role public.user_role not null default 'member',
  full_name text,
  avatar_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- Company theme settings ("every element is theme customizer")
-- ------------------------------------------------------------
create table public.company_themes (
  company_id uuid primary key references public.companies(id) on delete cascade,
  logo_url text,
  favicon_url text,
  primary_color text not null default '#4f46e5',
  secondary_color text not null default '#7c3aed',
  accent_color text not null default '#06b6d4',
  background_color text not null default '#f8fafc',
  surface_color text not null default '#ffffff',
  text_color text not null default '#0f172a',
  muted_text_color text not null default '#64748b',
  border_color text not null default '#e2e8f0',
  success_color text not null default '#16a34a',
  warning_color text not null default '#d97706',
  danger_color text not null default '#dc2626',
  sidebar_bg_color text not null default '#111827',
  sidebar_text_color text not null default '#f9fafb',
  font_family text not null default 'Inter, system-ui, sans-serif',
  radius text not null default '0.5rem',
  density text not null default 'comfortable',
  custom_css text,
  extra jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- Projects
-- ------------------------------------------------------------
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  name text not null,
  description text,
  color text not null default '#4f46e5',
  status public.project_status not null default 'active',
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.project_members (
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  added_at timestamptz not null default now(),
  primary key (project_id, user_id)
);

-- ------------------------------------------------------------
-- Tasks
-- ------------------------------------------------------------
create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null,
  description text,
  status public.task_status not null default 'todo',
  priority public.task_priority not null default 'medium',
  assignee_id uuid references public.profiles(id) on delete set null,
  due_date date,
  position double precision not null default 0,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index tasks_project_id_idx on public.tasks(project_id);
create index tasks_company_id_idx on public.tasks(company_id);
create index tasks_assignee_id_idx on public.tasks(assignee_id);

create table public.task_comments (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  author_id uuid references public.profiles(id) on delete set null,
  body text not null,
  created_at timestamptz not null default now()
);

create table public.task_attachments (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  uploaded_by uuid references public.profiles(id) on delete set null,
  file_path text not null,
  file_name text not null,
  file_size bigint,
  content_type text,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- Company invites
-- ------------------------------------------------------------
create table public.invites (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  email text not null,
  role public.user_role not null default 'member',
  token uuid not null default gen_random_uuid(),
  invited_by uuid references public.profiles(id) on delete set null,
  accepted_at timestamptz,
  created_at timestamptz not null default now(),
  unique (company_id, email)
);

-- ------------------------------------------------------------
-- Activity log
-- ------------------------------------------------------------
create table public.activity_log (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.companies(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- ============================================================
-- Helper functions (security definer to avoid RLS recursion)
-- ============================================================
create or replace function public.current_role()
returns public.user_role
language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.current_company_id()
returns uuid
language sql stable security definer set search_path = public as $$
  select company_id from public.profiles where id = auth.uid();
$$;

create or replace function public.is_super_admin()
returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select role = 'super_admin' from public.profiles where id = auth.uid()), false);
$$;

create or replace function public.is_company_admin()
returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select role = 'company_admin' from public.profiles where id = auth.uid()), false);
$$;

-- auto-create profile row on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, role, company_id)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    coalesce((new.raw_user_meta_data->>'role')::public.user_role, 'member'),
    nullif(new.raw_user_meta_data->>'company_id', '')::uuid
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- updated_at bump helper
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger companies_set_updated_at before update on public.companies
  for each row execute function public.set_updated_at();
create trigger profiles_set_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger projects_set_updated_at before update on public.projects
  for each row execute function public.set_updated_at();
create trigger tasks_set_updated_at before update on public.tasks
  for each row execute function public.set_updated_at();
create trigger company_themes_set_updated_at before update on public.company_themes
  for each row execute function public.set_updated_at();

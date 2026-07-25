-- profiles need an email column for huddle recap emails
alter table public.profiles add column email text;
update public.profiles p set email = u.email from auth.users u where u.id = p.id and p.email is null;

create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public as $$
declare
  v_role public.user_role;
begin
  if not exists (select 1 from public.profiles where role = 'super_admin') then
    v_role := 'super_admin';
  else
    v_role := coalesce((new.raw_user_meta_data->>'role')::public.user_role, 'member');
  end if;

  insert into public.profiles (id, full_name, role, company_id, email)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    v_role,
    nullif(new.raw_user_meta_data->>'company_id', '')::uuid,
    new.email
  );
  return new;
end;
$$;

-- allow company-level todos not tied to a project
alter table public.tasks alter column project_id drop not null;

create type public.issue_status as enum ('open', 'in_progress', 'resolved');
create type public.goal_status as enum ('on_track', 'at_risk', 'completed');
create type public.huddle_item_type as enum ('issue', 'todo', 'goal');

create table public.issues (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  title text not null,
  description text,
  status public.issue_status not null default 'open',
  priority public.task_priority not null default 'medium',
  deadline date,
  assignee_id uuid references public.profiles(id) on delete set null,
  source_task_id uuid references public.tasks(id) on delete set null,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index issues_company_id_idx on public.issues(company_id);
create trigger issues_set_updated_at before update on public.issues
  for each row execute function public.set_updated_at();

alter table public.tasks add column source_issue_id uuid references public.issues(id) on delete set null;
alter table public.tasks add column deadline date;

create table public.goals (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  title text not null,
  description text,
  status public.goal_status not null default 'on_track',
  deadline date,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index goals_company_id_idx on public.goals(company_id);
create trigger goals_set_updated_at before update on public.goals
  for each row execute function public.set_updated_at();

create table public.huddles (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  started_by uuid references public.profiles(id) on delete set null,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  summary text,
  email_sent_at timestamptz,
  created_at timestamptz not null default now()
);
create index huddles_company_id_idx on public.huddles(company_id);
create unique index huddles_one_active_per_company on public.huddles(company_id) where ended_at is null;

alter table public.tasks add column huddle_id uuid references public.huddles(id) on delete set null;

create table public.huddle_discussion_items (
  id uuid primary key default gen_random_uuid(),
  huddle_id uuid not null references public.huddles(id) on delete cascade,
  item_type public.huddle_item_type not null,
  item_id uuid not null,
  notes text,
  added_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);
create index huddle_discussion_items_huddle_id_idx on public.huddle_discussion_items(huddle_id);

-- RLS
alter table public.issues enable row level security;
alter table public.goals enable row level security;
alter table public.huddles enable row level security;
alter table public.huddle_discussion_items enable row level security;

create policy issues_select on public.issues for select
  using (public.is_super_admin() or company_id = public.current_company_id());
create policy issues_insert on public.issues for insert
  with check (public.is_super_admin() or company_id = public.current_company_id());
create policy issues_update on public.issues for update
  using (public.is_super_admin() or company_id = public.current_company_id());
create policy issues_delete on public.issues for delete
  using (public.is_super_admin() or (public.is_company_admin() and company_id = public.current_company_id()));

create policy goals_select on public.goals for select
  using (public.is_super_admin() or company_id = public.current_company_id());
create policy goals_insert on public.goals for insert
  with check (public.is_super_admin() or company_id = public.current_company_id());
create policy goals_update on public.goals for update
  using (public.is_super_admin() or company_id = public.current_company_id());
create policy goals_delete on public.goals for delete
  using (public.is_super_admin() or (public.is_company_admin() and company_id = public.current_company_id()));

create policy huddles_select on public.huddles for select
  using (public.is_super_admin() or company_id = public.current_company_id());
create policy huddles_insert on public.huddles for insert
  with check (public.is_super_admin() or company_id = public.current_company_id());
create policy huddles_update on public.huddles for update
  using (public.is_super_admin() or company_id = public.current_company_id());

create policy huddle_discussion_items_select on public.huddle_discussion_items for select
  using (
    public.is_super_admin()
    or exists (select 1 from public.huddles h where h.id = huddle_id and h.company_id = public.current_company_id())
  );
create policy huddle_discussion_items_insert on public.huddle_discussion_items for insert
  with check (
    public.is_super_admin()
    or exists (select 1 from public.huddles h where h.id = huddle_id and h.company_id = public.current_company_id())
  );
create policy huddle_discussion_items_delete on public.huddle_discussion_items for delete
  using (
    public.is_super_admin()
    or exists (select 1 from public.huddles h where h.id = huddle_id and h.company_id = public.current_company_id())
  );

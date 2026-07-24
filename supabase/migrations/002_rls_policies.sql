alter table public.companies enable row level security;
alter table public.profiles enable row level security;
alter table public.company_themes enable row level security;
alter table public.projects enable row level security;
alter table public.project_members enable row level security;
alter table public.tasks enable row level security;
alter table public.task_comments enable row level security;
alter table public.task_attachments enable row level security;
alter table public.invites enable row level security;
alter table public.activity_log enable row level security;

-- companies
create policy companies_select on public.companies for select
  using (public.is_super_admin() or id = public.current_company_id());
create policy companies_insert on public.companies for insert
  with check (public.is_super_admin());
create policy companies_update on public.companies for update
  using (public.is_super_admin() or (id = public.current_company_id() and public.is_company_admin()));
create policy companies_delete on public.companies for delete
  using (public.is_super_admin());

-- profiles
create policy profiles_select on public.profiles for select
  using (
    public.is_super_admin()
    or id = auth.uid()
    or company_id = public.current_company_id()
  );
create policy profiles_insert on public.profiles for insert
  with check (
    public.is_super_admin()
    or id = auth.uid()
    or (public.is_company_admin() and company_id = public.current_company_id())
  );
create policy profiles_update on public.profiles for update
  using (
    public.is_super_admin()
    or id = auth.uid()
    or (public.is_company_admin() and company_id = public.current_company_id())
  );
create policy profiles_delete on public.profiles for delete
  using (
    public.is_super_admin()
    or (public.is_company_admin() and company_id = public.current_company_id())
  );

-- company_themes
create policy company_themes_select on public.company_themes for select
  using (public.is_super_admin() or company_id = public.current_company_id());
create policy company_themes_insert on public.company_themes for insert
  with check (public.is_super_admin() or (public.is_company_admin() and company_id = public.current_company_id()));
create policy company_themes_update on public.company_themes for update
  using (public.is_super_admin() or (public.is_company_admin() and company_id = public.current_company_id()));
create policy company_themes_delete on public.company_themes for delete
  using (public.is_super_admin());

-- projects
create policy projects_select on public.projects for select
  using (public.is_super_admin() or company_id = public.current_company_id());
create policy projects_insert on public.projects for insert
  with check (public.is_super_admin() or (company_id = public.current_company_id() and public.current_role() in ('company_admin','member')));
create policy projects_update on public.projects for update
  using (public.is_super_admin() or company_id = public.current_company_id());
create policy projects_delete on public.projects for delete
  using (public.is_super_admin() or (public.is_company_admin() and company_id = public.current_company_id()));

-- project_members
create policy project_members_select on public.project_members for select
  using (
    public.is_super_admin()
    or exists (select 1 from public.projects p where p.id = project_id and p.company_id = public.current_company_id())
  );
create policy project_members_write on public.project_members for all
  using (
    public.is_super_admin()
    or exists (select 1 from public.projects p where p.id = project_id and p.company_id = public.current_company_id())
  )
  with check (
    public.is_super_admin()
    or exists (select 1 from public.projects p where p.id = project_id and p.company_id = public.current_company_id())
  );

-- tasks
create policy tasks_select on public.tasks for select
  using (public.is_super_admin() or company_id = public.current_company_id());
create policy tasks_insert on public.tasks for insert
  with check (public.is_super_admin() or company_id = public.current_company_id());
create policy tasks_update on public.tasks for update
  using (public.is_super_admin() or company_id = public.current_company_id());
create policy tasks_delete on public.tasks for delete
  using (public.is_super_admin() or company_id = public.current_company_id());

-- task_comments
create policy task_comments_select on public.task_comments for select
  using (
    public.is_super_admin()
    or exists (select 1 from public.tasks t where t.id = task_id and t.company_id = public.current_company_id())
  );
create policy task_comments_insert on public.task_comments for insert
  with check (
    public.is_super_admin()
    or exists (select 1 from public.tasks t where t.id = task_id and t.company_id = public.current_company_id())
  );
create policy task_comments_delete on public.task_comments for delete
  using (
    public.is_super_admin()
    or author_id = auth.uid()
    or (public.is_company_admin() and exists (select 1 from public.tasks t where t.id = task_id and t.company_id = public.current_company_id()))
  );

-- task_attachments
create policy task_attachments_select on public.task_attachments for select
  using (
    public.is_super_admin()
    or exists (select 1 from public.tasks t where t.id = task_id and t.company_id = public.current_company_id())
  );
create policy task_attachments_insert on public.task_attachments for insert
  with check (
    public.is_super_admin()
    or exists (select 1 from public.tasks t where t.id = task_id and t.company_id = public.current_company_id())
  );
create policy task_attachments_delete on public.task_attachments for delete
  using (
    public.is_super_admin()
    or uploaded_by = auth.uid()
    or (public.is_company_admin() and exists (select 1 from public.tasks t where t.id = task_id and t.company_id = public.current_company_id()))
  );

-- invites
create policy invites_select on public.invites for select
  using (public.is_super_admin() or company_id = public.current_company_id());
create policy invites_insert on public.invites for insert
  with check (public.is_super_admin() or (public.is_company_admin() and company_id = public.current_company_id()));
create policy invites_delete on public.invites for delete
  using (public.is_super_admin() or (public.is_company_admin() and company_id = public.current_company_id()));

-- activity_log
create policy activity_log_select on public.activity_log for select
  using (public.is_super_admin() or company_id = public.current_company_id());
create policy activity_log_insert on public.activity_log for insert
  with check (public.is_super_admin() or company_id = public.current_company_id());

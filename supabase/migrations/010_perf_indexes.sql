create index if not exists tasks_source_issue_id_idx on public.tasks(source_issue_id) where source_issue_id is not null;
create index if not exists tasks_huddle_id_idx on public.tasks(huddle_id) where huddle_id is not null;
create index if not exists issues_source_task_id_idx on public.issues(source_task_id) where source_task_id is not null;
create index if not exists activity_log_company_created_idx on public.activity_log(company_id, created_at desc);
create index if not exists activity_log_created_idx on public.activity_log(created_at desc);

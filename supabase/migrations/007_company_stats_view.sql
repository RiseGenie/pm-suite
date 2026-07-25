create view public.company_stats
with (security_invoker = true) as
select
  c.id as company_id,
  c.name,
  c.is_active,
  c.created_at,
  (select count(*) from public.profiles p where p.company_id = c.id) as user_count,
  (select count(*) from public.projects pr where pr.company_id = c.id) as project_count,
  (select count(*) from public.tasks t where t.company_id = c.id) as task_count,
  (select count(*) from public.tasks t where t.company_id = c.id and t.status = 'done') as completed_task_count,
  (select count(*) from public.bug_reports b where b.company_id = c.id and b.status <> 'resolved') as open_bug_count,
  (select max(a.created_at) from public.activity_log a where a.company_id = c.id) as last_activity_at
from public.companies c;

grant select on public.company_stats to authenticated;

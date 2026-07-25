-- tasks already has due_date; the deadline column added in 008 was redundant, drop it
alter table public.tasks drop column if exists deadline;

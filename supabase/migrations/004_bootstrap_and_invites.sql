-- First-ever signup becomes super_admin; everyone else joins via invite metadata
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

  insert into public.profiles (id, full_name, role, company_id)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    v_role,
    nullif(new.raw_user_meta_data->>'company_id', '')::uuid
  );
  return new;
end;
$$;

-- Public, safe lookup of an invite by its token (doesn't expose the whole table)
create or replace function public.get_invite_by_token(p_token uuid)
returns table (
  email text,
  role public.user_role,
  company_id uuid,
  company_name text,
  accepted_at timestamptz
)
language sql stable security definer set search_path = public as $$
  select i.email, i.role, i.company_id, c.name, i.accepted_at
  from public.invites i
  join public.companies c on c.id = i.company_id
  where i.token = p_token;
$$;

grant execute on function public.get_invite_by_token(uuid) to anon, authenticated;

-- Mark an invite accepted; caller must be signed in as the invited email
create or replace function public.accept_invite(p_token uuid)
returns void
language plpgsql security definer set search_path = public as $$
begin
  update public.invites
  set accepted_at = now()
  where token = p_token
    and accepted_at is null
    and email = (select email from auth.users where id = auth.uid());
end;
$$;

grant execute on function public.accept_invite(uuid) to authenticated;

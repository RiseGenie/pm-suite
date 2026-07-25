create policy invites_update on public.invites for update
  using (public.is_super_admin() or (public.is_company_admin() and company_id = public.current_company_id()))
  with check (public.is_super_admin() or (public.is_company_admin() and company_id = public.current_company_id()));

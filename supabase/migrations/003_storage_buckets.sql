insert into storage.buckets (id, name, public) values
  ('attachments', 'attachments', false),
  ('branding', 'branding', true)
on conflict (id) do nothing;

create policy attachments_select on storage.objects for select
  using (
    bucket_id = 'attachments'
    and (
      public.is_super_admin()
      or (storage.foldername(name))[1] = public.current_company_id()::text
    )
  );
create policy attachments_insert on storage.objects for insert
  with check (
    bucket_id = 'attachments'
    and (
      public.is_super_admin()
      or (storage.foldername(name))[1] = public.current_company_id()::text
    )
  );
create policy attachments_delete on storage.objects for delete
  using (
    bucket_id = 'attachments'
    and (
      public.is_super_admin()
      or (storage.foldername(name))[1] = public.current_company_id()::text
    )
  );

create policy branding_public_read on storage.objects for select
  using (bucket_id = 'branding');
create policy branding_write on storage.objects for insert
  with check (
    bucket_id = 'branding'
    and (
      public.is_super_admin()
      or (public.is_company_admin() and (storage.foldername(name))[1] = public.current_company_id()::text)
    )
  );
create policy branding_update on storage.objects for update
  using (
    bucket_id = 'branding'
    and (
      public.is_super_admin()
      or (public.is_company_admin() and (storage.foldername(name))[1] = public.current_company_id()::text)
    )
  );

-- Student portal (5.4): what a student may touch in the private `private` bucket (staff keep full access).

-- The director's signature, so it shows on the student's own report card. Only the one file named in school_settings.
create policy student_read_signature on storage.objects for select to authenticated
  using (
    bucket_id = 'private'
    and public.my_student_id() is not null
    and exists (select 1 from public.school_settings s where s.signature_path = objects.name)
  );

-- Proof-of-payment files live under proofs/<student id>/. A student can add and read files in their own folder only
-- (no update, no delete).
create policy student_proofs_insert on storage.objects for insert to authenticated
  with check (
    bucket_id = 'private'
    and public.my_student_id() is not null
    and (storage.foldername(name))[1] = 'proofs'
    and (storage.foldername(name))[2] = public.my_student_id()::text
  );

create policy student_proofs_read on storage.objects for select to authenticated
  using (
    bucket_id = 'private'
    and public.my_student_id() is not null
    and (storage.foldername(name))[1] = 'proofs'
    and (storage.foldername(name))[2] = public.my_student_id()::text
  );

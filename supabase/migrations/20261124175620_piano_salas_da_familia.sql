create policy piano_familia_recebe
on realtime.messages for select to authenticated
using (
  extension = 'broadcast'
  and (select realtime.topic()) ~ '^piano:[0-9a-f-]{36}:[0-9a-f]{32}$'
  and exists (
    select 1 from public.membros
    where id = (select auth.uid())
      and familia_id::text = split_part((select realtime.topic()), ':', 2)
  )
);

create policy piano_familia_envia
on realtime.messages for insert to authenticated
with check (
  extension = 'broadcast'
  and (select realtime.topic()) ~ '^piano:[0-9a-f-]{36}:[0-9a-f]{32}$'
  and exists (
    select 1 from public.membros
    where id = (select auth.uid())
      and familia_id::text = split_part((select realtime.topic()), ':', 2)
  )
);

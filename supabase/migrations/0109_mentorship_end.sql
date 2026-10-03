-- ============================================================================
-- worklife-iq-finland — 0109 Ending a mentorship
--
-- Either participant can end an active mentorship. The match keeps its history
-- (messages stay readable for both, read-only) and both users are free to
-- start a new match.
--
-- Run in Supabase Dashboard → SQL Editor. Idempotent.
-- ============================================================================

-- Allow status = 'ended'. mentorship_matches was created in the dashboard, so
-- handle both a text column with a CHECK constraint and a Postgres enum.
do $$
declare
  v_type text;
  v_udt  text;
  c      record;
begin
  select data_type, udt_name into v_type, v_udt
  from information_schema.columns
  where table_schema = 'public' and table_name = 'mentorship_matches' and column_name = 'status';

  if v_type = 'USER-DEFINED' then
    execute format('alter type public.%I add value if not exists %L', v_udt, 'ended');
  else
    for c in
      select conname from pg_constraint
      where conrelid = 'public.mentorship_matches'::regclass
        and contype = 'c'
        and pg_get_constraintdef(oid) ilike '%status%'
    loop
      execute format('alter table public.mentorship_matches drop constraint %I', c.conname);
    end loop;
    alter table public.mentorship_matches
      add constraint mentorship_matches_status_check
      check (status in ('pending', 'active', 'rejected', 'ended'));
  end if;
end $$;

alter table public.mentorship_matches add column if not exists ended_at timestamptz;
alter table public.mentorship_matches add column if not exists ended_by uuid references auth.users(id) on delete set null;

-- Ended chats are read-only: messages can only be sent while the match is active.
drop policy if exists "Match participants can send messages" on public.mentorship_messages;
create policy "Match participants can send messages"
    on public.mentorship_messages for insert
    with check (
        auth.uid() = sender_id
        and exists (
            select 1 from public.mentorship_matches
            where mentorship_matches.id = mentorship_messages.match_id
            and (mentorship_matches.mentor_id = auth.uid() or mentorship_matches.mentee_id = auth.uid())
            and mentorship_matches.mentee_agreed = true
            and mentorship_matches.mentor_agreed = true
            and mentorship_matches.status = 'active'
        )
    );

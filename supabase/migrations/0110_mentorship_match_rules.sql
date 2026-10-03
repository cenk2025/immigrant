-- ============================================================================
-- worklife-iq-finland — 0110 Mentorship match rules
--
-- The RLS policies only check that the caller is a participant, so a mentee
-- could accept their own request or create a match that is already "active"
-- and agreed. This trigger enforces who may do what:
--
--   create     mentee only; must be 'pending' with no agreements; the other
--              user must be a mentor; at most one open match per mentee
--   accept /   mentor only (pending → active / rejected)
--   decline
--   agree      each side sets only their own flag, only to true, only while active
--   end        either side (pending/active → ended); ended_by = caller, ended_at = now()
--   always     participants and created_at never change; rejected/ended are final
--
-- Calls without a signed-in user (SQL editor, service role) are not checked.
-- Run in Supabase Dashboard → SQL Editor after 0109. Idempotent.
-- ============================================================================

create or replace function public.enforce_mentorship_match_rules()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    return new;
  end if;

  if tg_op = 'INSERT' then
    if new.mentee_id is distinct from v_uid then
      raise exception 'Only the mentee can create a match request';
    end if;
    if new.mentor_id is null or new.mentor_id = new.mentee_id then
      raise exception 'Choose another user as mentor';
    end if;
    if new.status::text <> 'pending' or coalesce(new.mentee_agreed, false) or coalesce(new.mentor_agreed, false)
       or new.ended_at is not null or new.ended_by is not null then
      raise exception 'A new match request must be pending and not yet agreed';
    end if;
    if not exists (select 1 from mentorship_profiles where user_id = new.mentor_id and role = 'mentor') then
      raise exception 'That user is not a mentor';
    end if;
    if exists (select 1 from mentorship_matches
               where mentee_id = new.mentee_id and status::text in ('pending', 'active')) then
      raise exception 'You already have an open mentorship';
    end if;
    return new;
  end if;

  -- UPDATE
  if new.id is distinct from old.id
     or new.mentee_id is distinct from old.mentee_id
     or new.mentor_id is distinct from old.mentor_id
     or new.created_at is distinct from old.created_at then
    raise exception 'Match participants cannot be changed';
  end if;

  if new.mentee_agreed is distinct from old.mentee_agreed
     and not (v_uid = old.mentee_id and new.mentee_agreed and old.status::text = 'active') then
    raise exception 'Only the mentee can accept the agreement for themselves';
  end if;

  if new.mentor_agreed is distinct from old.mentor_agreed
     and not (v_uid = old.mentor_id and new.mentor_agreed and old.status::text = 'active') then
    raise exception 'Only the mentor can accept the agreement for themselves';
  end if;

  if new.status is distinct from old.status then
    if old.status::text = 'pending' and new.status::text in ('active', 'rejected') then
      if v_uid is distinct from old.mentor_id then
        raise exception 'Only the mentor can accept or decline a request';
      end if;
    elsif old.status::text in ('pending', 'active') and new.status::text = 'ended' then
      if new.ended_by is distinct from v_uid then
        raise exception 'ended_by must be the user ending the mentorship';
      end if;
      new.ended_at := now();
    else
      raise exception 'Invalid status change: % → %', old.status, new.status;
    end if;
  elsif new.ended_at is distinct from old.ended_at or new.ended_by is distinct from old.ended_by then
    raise exception 'End details can only be set when ending a mentorship';
  end if;

  return new;
end;
$$;

drop trigger if exists mentorship_match_rules on public.mentorship_matches;
create trigger mentorship_match_rules
  before insert or update on public.mentorship_matches
  for each row execute function public.enforce_mentorship_match_rules();

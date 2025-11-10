-- Fix the search path for update_conversation_timestamp function
drop function if exists public.update_conversation_timestamp() cascade;

create or replace function public.update_conversation_timestamp()
returns trigger
language plpgsql
security definer 
set search_path = public
as $$
begin
  update public.conversations
  set updated_at = now()
  where id = new.conversation_id;
  return new;
end;
$$;

-- Recreate the trigger
create trigger update_conversation_timestamp_trigger
after insert on public.messages
for each row
execute function public.update_conversation_timestamp();
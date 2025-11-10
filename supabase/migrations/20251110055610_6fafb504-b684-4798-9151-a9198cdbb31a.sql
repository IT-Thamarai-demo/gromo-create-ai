-- Create profiles table to store user information
create table public.profiles (
  id uuid not null references auth.users on delete cascade,
  email text,
  display_name text,
  avatar_url text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  
  primary key (id)
);

-- Enable Row Level Security
alter table public.profiles enable row level security;

-- Create policies for profiles
create policy "Profiles are viewable by everyone" 
on public.profiles 
for select 
using (true);

create policy "Users can update their own profile" 
on public.profiles 
for update 
using (auth.uid() = id);

create policy "Users can insert their own profile" 
on public.profiles 
for insert 
with check (auth.uid() = id);

-- Create function to handle new user signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name, avatar_url)
  values (
    new.id, 
    new.email,
    coalesce(new.raw_user_meta_data->>'display_name', new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

-- Trigger the function every time a user is created
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Create function to update timestamps
create or replace function public.update_profile_updated_at()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Trigger for automatic timestamp updates
create trigger update_profiles_updated_at
before update on public.profiles
for each row
execute function public.update_profile_updated_at();
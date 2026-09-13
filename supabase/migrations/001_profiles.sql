-- Módulo 1.2: cadastro de usuários e perfis (admin x paciente)
create type public.user_role as enum ('admin', 'paciente');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '',
  role public.user_role not null default 'paciente',
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles: user reads own row"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles: user updates own row"
  on public.profiles for update
  using (auth.uid() = id);

-- trava escalação de privilégio: usuário só pode alterar full_name,
-- nunca a própria role (Supabase concede UPDATE em todas as colunas por
-- padrão via "alter default privileges", então isso precisa ser revogado
-- explicitamente).
revoke update on public.profiles from authenticated;
grant update (full_name) on public.profiles to authenticated;

create function public.is_admin()
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$;

create policy "profiles: admin reads all rows"
  on public.profiles for select
  using (public.is_admin());

-- cria profile automaticamente quando um usuário se cadastra
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

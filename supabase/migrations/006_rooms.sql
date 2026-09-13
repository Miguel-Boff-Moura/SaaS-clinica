-- Salas de atendimento, usadas pelo agendamento.
create type public.room_type as enum ('Consultório', 'Sala de procedimentos', 'Sala de laser');

create table public.rooms (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  tipo public.room_type not null default 'Consultório',
  created_at timestamptz not null default now()
);

alter table public.rooms enable row level security;

create policy "rooms: qualquer usuário autenticado lê"
  on public.rooms for select
  to authenticated
  using (true);

create policy "rooms: só admin escreve"
  on public.rooms for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

insert into public.rooms (nome, tipo) values
  ('Consultório 1', 'Consultório'),
  ('Consultório 2', 'Consultório'),
  ('Sala de Procedimentos', 'Sala de procedimentos'),
  ('Sala de Laser', 'Sala de laser');

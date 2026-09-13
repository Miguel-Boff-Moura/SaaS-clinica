-- Módulo 2.1: CRUD de agendamento com trava de conflito de horário.
create extension if not exists btree_gist;

create type public.appointment_status as enum (
  'confirmado', 'aguardando', 'em_atendimento', 'concluido', 'cancelado', 'faltou'
);

create type public.appointment_tipo as enum (
  'Consulta', 'Retorno', 'Procedimento', 'Avaliação', 'Sessão de pacote'
);

create type public.appointment_origem as enum (
  'Agendamento online', 'Recepção', 'WhatsApp', 'Telefone'
);

create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  inicio timestamptz not null,
  fim timestamptz not null,
  paciente_id uuid not null references public.patients (id),
  profissional_id uuid not null references public.professionals (id),
  procedimento_id uuid not null references public.procedures (id),
  sala_id uuid not null references public.rooms (id),
  status public.appointment_status not null default 'aguardando',
  tipo public.appointment_tipo not null default 'Procedimento',
  origem public.appointment_origem not null default 'Recepção',
  observacao text,
  created_by uuid not null default auth.uid() references auth.users (id),
  created_at timestamptz not null default now(),
  constraint appointments_periodo_valido check (fim > inicio),

  -- impede dois agendamentos sobrepostos pro mesmo profissional
  -- (ignora cancelados/faltou, que liberam o horário)
  exclude using gist (
    profissional_id with =,
    tstzrange(inicio, fim) with &&
  ) where (status not in ('cancelado', 'faltou')),

  -- mesma trava pra sala (não dá pra usar a mesma sala em dois atendimentos)
  exclude using gist (
    sala_id with =,
    tstzrange(inicio, fim) with &&
  ) where (status not in ('cancelado', 'faltou'))
);

alter table public.appointments enable row level security;

-- Somente equipe (admin) acessa por enquanto — portal do próprio paciente
-- (leitura restrita ao próprio registro) é módulo 2.3, ainda não implementado.
create policy "appointments: só admin lê"
  on public.appointments for select
  to authenticated
  using (public.is_admin());

create policy "appointments: só admin cria"
  on public.appointments for insert
  to authenticated
  with check (public.is_admin());

create policy "appointments: só admin atualiza"
  on public.appointments for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

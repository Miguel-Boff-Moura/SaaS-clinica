-- Módulo 1.4: cadastro de profissionais/atendentes
create table public.professionals (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  especialidade text not null default '',
  created_at timestamptz not null default now()
);

alter table public.professionals enable row level security;

create policy "professionals: qualquer usuário autenticado lê"
  on public.professionals for select
  to authenticated
  using (true);

create policy "professionals: só admin escreve"
  on public.professionals for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Módulo 1.5: catálogo de procedimentos (nome, preço, duração, categoria/sessão)
create table public.procedures (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  categoria text not null default '',
  duracao_min integer not null check (duracao_min > 0),
  preco numeric(10, 2) not null check (preco >= 0),
  created_at timestamptz not null default now()
);

alter table public.procedures enable row level security;

create policy "procedures: qualquer usuário autenticado lê"
  on public.procedures for select
  to authenticated
  using (true);

create policy "procedures: só admin escreve"
  on public.procedures for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

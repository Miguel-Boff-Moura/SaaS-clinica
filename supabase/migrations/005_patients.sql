-- Cadastro mínimo de pacientes, necessário pro agendamento (módulo 2.1).
-- Só identidade básica — o prontuário/CRM completo (pacotes, financeiro,
-- galeria, anamnese) é módulo separado e continua mockado por enquanto.
create table public.patients (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  telefone text not null,
  email text not null default '',
  nascimento date,
  created_at timestamptz not null default now()
);

alter table public.patients enable row level security;

-- Somente equipe (admin) acessa por enquanto — portal do próprio paciente
-- (leitura restrita ao próprio registro) é módulo 2.3, ainda não implementado.
create policy "patients: só admin lê"
  on public.patients for select
  to authenticated
  using (public.is_admin());

create policy "patients: só admin escreve"
  on public.patients for insert
  to authenticated
  with check (public.is_admin());

create policy "patients: só admin atualiza"
  on public.patients for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Módulo 1.3: dados da clínica (registro único)
create table public.clinic_settings (
  id boolean primary key default true,
  nome text not null default '',
  cnpj text not null default '',
  responsavel text not null default '',
  telefone text not null default '',
  email text not null default '',
  updated_at timestamptz not null default now(),
  constraint clinic_settings_singleton check (id)
);

insert into public.clinic_settings (id) values (true);

alter table public.clinic_settings enable row level security;

create policy "clinic_settings: qualquer usuário autenticado lê"
  on public.clinic_settings for select
  to authenticated
  using (true);

create policy "clinic_settings: só admin atualiza"
  on public.clinic_settings for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Módulo 5.3: controle de pendências informais (parcelamento sem contrato
-- fixo — valor e frequência variáveis, baixa manual com comprovante).
create table public.pendencias (
  id uuid primary key default gen_random_uuid(),
  paciente_id uuid not null references public.patients (id),
  descricao text not null,
  valor_total numeric(10, 2) not null check (valor_total > 0),
  valor_pago numeric(10, 2) not null default 0 check (valor_pago >= 0),
  data_vencimento date not null,
  created_at timestamptz not null default now()
);

create table public.pendencia_baixas (
  id uuid primary key default gen_random_uuid(),
  pendencia_id uuid not null references public.pendencias (id) on delete cascade,
  valor numeric(10, 2) not null check (valor > 0),
  data date not null default current_date,
  comprovante text,
  created_at timestamptz not null default now()
);

-- valor_pago é sempre a soma das baixas — recalculado automaticamente,
-- nunca editado direto, pra não desincronizar do histórico.
create function public.recalc_pendencia_valor_pago()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  novo_total numeric(10, 2);
  limite numeric(10, 2);
begin
  select coalesce(sum(valor), 0) into novo_total
  from public.pendencia_baixas
  where pendencia_id = coalesce(new.pendencia_id, old.pendencia_id);

  select valor_total into limite
  from public.pendencias
  where id = coalesce(new.pendencia_id, old.pendencia_id);

  if novo_total > limite then
    raise exception 'Soma das baixas (%) excede o valor total da pendência (%)', novo_total, limite;
  end if;

  update public.pendencias set valor_pago = novo_total
  where id = coalesce(new.pendencia_id, old.pendencia_id);
  return coalesce(new, old);
end;
$$;

create trigger on_pendencia_baixa_change
  after insert or update or delete on public.pendencia_baixas
  for each row execute function public.recalc_pendencia_valor_pago();

alter table public.pendencias enable row level security;
alter table public.pendencia_baixas enable row level security;

-- Dado financeiro sensível — só admin acessa.
create policy "pendencias: só admin lê"
  on public.pendencias for select
  to authenticated
  using (public.is_admin());

create policy "pendencias: só admin escreve"
  on public.pendencias for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- valor_pago só é escrito pela trigger (security definer) — impede admin
-- de editar isso direto pela API e desincronizar do histórico de baixas.
revoke update on public.pendencias from authenticated;
grant update (descricao, valor_total, data_vencimento) on public.pendencias to authenticated;

create policy "pendencia_baixas: só admin lê"
  on public.pendencia_baixas for select
  to authenticated
  using (public.is_admin());

create policy "pendencia_baixas: só admin escreve"
  on public.pendencia_baixas for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

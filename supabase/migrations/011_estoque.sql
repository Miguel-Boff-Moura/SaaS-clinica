-- Módulo 7: estoque simples (~8 itens — toxina botulínica e preenchedores).
create table public.stock_items (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  categoria text not null default '',
  unidade text not null default 'un',
  quantidade integer not null default 0 check (quantidade >= 0),
  estoque_minimo integer not null default 0 check (estoque_minimo >= 0),
  validade date,
  created_at timestamptz not null default now()
);

create type public.stock_movement_tipo as enum ('entrada', 'saida');

create table public.stock_movements (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.stock_items (id) on delete cascade,
  tipo public.stock_movement_tipo not null,
  quantidade integer not null check (quantidade > 0),
  motivo text not null default '',
  created_by uuid not null default auth.uid() references auth.users (id),
  created_at timestamptz not null default now()
);

-- quantidade do item é sempre recalculada a partir do histórico de
-- movimentações — nunca editada direto, e nunca fica negativa.
create function public.recalc_stock_quantidade()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  saldo integer;
begin
  select coalesce(sum(case when tipo = 'entrada' then quantidade else -quantidade end), 0) into saldo
  from public.stock_movements
  where item_id = coalesce(new.item_id, old.item_id);

  if saldo < 0 then
    raise exception 'Movimentação deixaria o estoque negativo (saldo calculado: %)', saldo;
  end if;

  update public.stock_items set quantidade = saldo
  where id = coalesce(new.item_id, old.item_id);
  return coalesce(new, old);
end;
$$;

create trigger on_stock_movement_change
  after insert or update or delete on public.stock_movements
  for each row execute function public.recalc_stock_quantidade();

alter table public.stock_items enable row level security;
alter table public.stock_movements enable row level security;

create policy "stock_items: qualquer usuário autenticado lê"
  on public.stock_items for select
  to authenticated
  using (true);

create policy "stock_items: só admin escreve"
  on public.stock_items for insert
  to authenticated
  with check (public.is_admin());

create policy "stock_items: só admin atualiza"
  on public.stock_items for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

revoke update on public.stock_items from authenticated;
grant update (nome, categoria, unidade, estoque_minimo, validade) on public.stock_items to authenticated;

create policy "stock_movements: qualquer usuário autenticado lê"
  on public.stock_movements for select
  to authenticated
  using (true);

create policy "stock_movements: só admin registra"
  on public.stock_movements for insert
  to authenticated
  with check (public.is_admin());

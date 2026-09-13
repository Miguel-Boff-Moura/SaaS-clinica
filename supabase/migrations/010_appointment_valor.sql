-- Módulo 5.1: relatório financeiro real precisa saber quanto foi cobrado
-- em cada atendimento (snapshot do preço do procedimento no momento do
-- agendamento — preço do catálogo pode mudar depois sem afetar histórico).
alter table public.appointments
  add column valor numeric(10, 2) not null default 0 check (valor >= 0);

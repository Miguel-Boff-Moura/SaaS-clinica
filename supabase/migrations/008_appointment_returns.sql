-- Módulo 2.4: registro manual de retorno/manutenção por atendimento.
-- Datas preenchidas manualmente pela equipe (a regra de negócio da doutora
-- é que o sistema NÃO calcula isso sozinho a partir do procedimento).
alter table public.appointments
  add column data_retorno date,
  add column data_manutencao date;


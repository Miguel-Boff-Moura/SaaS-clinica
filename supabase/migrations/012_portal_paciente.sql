-- Módulo 2.3: portal do paciente — liga uma conta de login (profiles,
-- role='paciente') a um cadastro de paciente (patients), pra restringir
-- o acesso só à própria agenda.
alter table public.patients
  add column profile_id uuid unique references public.profiles (id);

-- resolve o patients.id do usuário logado, se ele tiver vínculo.
create function public.my_patient_id()
returns uuid
language sql
security definer set search_path = public
stable
as $$
  select id from public.patients where profile_id = auth.uid();
$$;

-- paciente lê o próprio cadastro
create policy "patients: paciente lê o próprio cadastro"
  on public.patients for select
  to authenticated
  using (profile_id = auth.uid());

-- paciente lê os próprios agendamentos
create policy "appointments: paciente lê os próprios agendamentos"
  on public.appointments for select
  to authenticated
  using (paciente_id = public.my_patient_id());

-- remarcação do próprio paciente — função dedicada (não RLS de coluna)
-- pra controlar exatamente o que pode mudar: só data/hora, nunca valor,
-- status final, ou agendamento de outro paciente. A trava de conflito
-- de horário (exclusion constraint da migration 007) continua valendo.
create function public.reagendar_meu_atendimento(p_appointment_id uuid, p_novo_inicio timestamptz)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  v_paciente_id uuid;
  v_status public.appointment_status;
  v_procedimento_id uuid;
  v_duracao_min integer;
begin
  select paciente_id, status, procedimento_id into v_paciente_id, v_status, v_procedimento_id
  from public.appointments where id = p_appointment_id;

  if v_paciente_id is null then
    raise exception 'Agendamento não encontrado';
  end if;

  if v_paciente_id <> public.my_patient_id() then
    raise exception 'Esse agendamento não é seu';
  end if;

  if v_status in ('cancelado', 'concluido', 'em_atendimento') then
    raise exception 'Esse agendamento não pode mais ser remarcado';
  end if;

  select duracao_min into v_duracao_min from public.procedures where id = v_procedimento_id;

  update public.appointments
  set inicio = p_novo_inicio,
      fim = p_novo_inicio + (v_duracao_min || ' minutes')::interval,
      status = 'aguardando'
  where id = p_appointment_id;
end;
$$;

grant execute on function public.reagendar_meu_atendimento(uuid, timestamptz) to authenticated;

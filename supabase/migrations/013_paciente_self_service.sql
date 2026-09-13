-- Módulo 2.3 (ajuste): paciente cria a própria conta e o próprio cadastro
-- de paciente, sem precisar que o admin vincule manualmente depois.
-- Também pode criar (não só remarcar) o próprio agendamento.
create policy "patients: paciente cria o próprio cadastro"
  on public.patients for insert
  to authenticated
  with check (profile_id = auth.uid());

create policy "appointments: paciente cria pro próprio cadastro"
  on public.appointments for insert
  to authenticated
  with check (paciente_id = public.my_patient_id() and status = 'aguardando');

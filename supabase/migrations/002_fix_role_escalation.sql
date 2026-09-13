-- Corrige falha de segurança: policy de update permitia usuário alterar
-- a própria coluna role (paciente virava admin sozinho). Restringe UPDATE
-- em public.profiles à coluna full_name apenas.
revoke update on public.profiles from authenticated;
grant update (full_name) on public.profiles to authenticated;

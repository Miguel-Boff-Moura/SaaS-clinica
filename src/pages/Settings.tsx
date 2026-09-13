import { useState, type FormEvent } from "react";
import {
  Building2,
  CreditCard,
  DoorOpen,
  Plug,
  ShieldCheck,
  Stethoscope,
  UsersRound,
} from "lucide-react";
import { PageHeader, SkeletonRows, EmptyState } from "@/components/ui/Misc";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { useProfessionals } from "@/hooks/useProfessionals";
import { useClinicSettings, type ClinicSettings } from "@/hooks/useClinicSettings";
import { useProfiles } from "@/hooks/useProfiles";
import { usePatients } from "@/hooks/usePatients";
import { useAuth } from "@/lib/auth";
import {
  ROLE_PERMISSIONS,
  ROOMS,
  UNITS,
} from "@/data";
import { maskCNPJ, maskPhone, isValidCNPJ, isValidPhone, isValidEmail } from "@/lib/masks";
import { cn } from "@/lib/cn";

const SECTIONS = [
  { key: "clinica", label: "Dados da clínica", icon: Building2 },
  { key: "profissionais", label: "Profissionais", icon: Stethoscope },
  { key: "usuarios", label: "Usuários", icon: UsersRound },
  { key: "permissoes", label: "Permissões", icon: ShieldCheck },
  { key: "estrutura", label: "Salas e unidades", icon: DoorOpen },
  { key: "pagamentos", label: "Formas de pagamento", icon: CreditCard },
  { key: "integracoes", label: "Integrações", icon: Plug },
];

const ACCESS_TONE = { total: "ok", leitura: "warn", nenhum: "neutral" } as const;

export function Settings() {
  const toast = useToast();
  const { profile } = useAuth();
  const isAdmin = profile?.role === "admin";
  const { data: professionals, loading: loadingProfessionals, error: professionalsError, create: createProfessional } = useProfessionals();
  const { data: clinic, loading: loadingClinic, error: clinicError, update: updateClinic } = useClinicSettings();
  const { data: profiles, loading: loadingProfiles } = useProfiles();
  const { data: patients, linkProfile } = usePatients();
  const [section, setSection] = useState("clinica");
  const [profModalOpen, setProfModalOpen] = useState(false);

  return (
    <div className="fade-in">
      <PageHeader title="Configurações" subtitle="Clínica, equipe, permissões e integrações" />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[220px_1fr]">
        <nav className="flex gap-1 overflow-x-auto scroll-thin lg:flex-col">
          {SECTIONS.map((s) => (
            <button
              key={s.key}
              onClick={() => setSection(s.key)}
              className={cn(
                "focusable flex shrink-0 items-center gap-2.5 rounded-[10px] px-3 py-2 text-[13px] font-medium transition-colors",
                section === s.key ? "bg-primary text-white" : "text-muted hover:bg-surface-2"
              )}
            >
              <s.icon size={16} /> {s.label}
            </button>
          ))}
        </nav>

        <div className="space-y-4">
          {section === "clinica" && (
            <Card>
              <div className="p-5">
                {loadingClinic && <SkeletonRows rows={3} />}
                {!loadingClinic && clinicError && (
                  <p className="text-sm text-danger">Erro ao carregar dados da clínica: {clinicError}</p>
                )}
                {!loadingClinic && clinic && (
                  <ClinicForm
                    clinic={clinic}
                    readOnly={!isAdmin}
                    onSave={async (input) => {
                      const { error } = await updateClinic(input);
                      if (error) {
                        toast.warning("Erro ao salvar alterações");
                        return;
                      }
                      toast.success("Alterações salvas");
                    }}
                  />
                )}
              </div>
            </Card>
          )}

          {section === "profissionais" && (
            <div className="space-y-3">
              {isAdmin && (
                <div className="flex justify-end">
                  <Button size="sm" onClick={() => setProfModalOpen(true)}>Novo profissional</Button>
                </div>
              )}
              {loadingProfessionals && <SkeletonRows rows={3} />}
              {!loadingProfessionals && professionalsError && (
                <p className="text-sm text-danger">Erro ao carregar profissionais: {professionalsError}</p>
              )}
              {!loadingProfessionals && !professionalsError && professionals.length === 0 && (
                <EmptyState title="Nenhum profissional cadastrado" />
              )}
              {professionals.length > 0 && (
                <Card className="divide-y divide-line">
                  {professionals.map((p) => (
                    <div key={p.id} className="flex items-center gap-3 p-4">
                      <div className="flex-1">
                        <p className="text-[13px] font-medium text-ink">{p.nome}</p>
                        <p className="text-[11px] text-faint">{p.especialidade}</p>
                      </div>
                    </div>
                  ))}
                </Card>
              )}
            </div>
          )}

          {section === "usuarios" && (
            <div className="space-y-3">
              {loadingProfiles && <SkeletonRows rows={3} />}
              {!loadingProfiles && (
                <Card className="overflow-hidden">
                  <table className="w-full text-left text-[13px]">
                    <thead>
                      <tr className="border-b border-line bg-surface-2/50 text-[11px] font-semibold uppercase text-faint">
                        <th className="px-5 py-3">Usuário</th>
                        <th className="px-3 py-3">Papel</th>
                        <th className="px-3 py-3">Vínculo com cadastro de paciente</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line">
                      {profiles.map((p) => (
                        <tr key={p.id} className="hover:bg-surface-2/60">
                          <td className="px-5 py-3 font-medium text-ink">{p.full_name || "(sem nome)"}</td>
                          <td className="px-3 py-3"><Badge tone="primary" size="sm">{p.role}</Badge></td>
                          <td className="px-3 py-3">
                            {p.role === "paciente" && (
                              <select
                                className="focusable h-8 rounded-lg border border-line bg-white px-2 text-[12.5px]"
                                value={patients.find((pt) => pt.profile_id === p.id)?.id ?? ""}
                                onChange={async (e) => {
                                  const atual = patients.find((pt) => pt.profile_id === p.id);
                                  if (atual) await linkProfile(atual.id, null);
                                  if (e.target.value) await linkProfile(e.target.value, p.id);
                                }}
                              >
                                <option value="">Sem vínculo</option>
                                {patients
                                  .filter((pt) => !pt.profile_id || pt.profile_id === p.id)
                                  .map((pt) => (
                                    <option key={pt.id} value={pt.id}>{pt.nome} · {pt.telefone}</option>
                                  ))}
                              </select>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Card>
              )}
            </div>
          )}

          {section === "permissoes" && (
            <div className="space-y-4">
              {ROLE_PERMISSIONS.map((r) => (
                <Card key={r.papel}>
                  <div className="p-5">
                    <CardHeader title={r.papel} subtitle={r.descricao} />
                    <div className="mt-3 flex flex-wrap gap-2">
                      {r.modulos.map((m) => (
                        <span key={m.modulo} className="inline-flex items-center gap-1.5 rounded-lg border border-line px-2.5 py-1 text-[12px]">
                          {m.modulo}
                          <Badge tone={ACCESS_TONE[m.acesso]} size="sm">{m.acesso}</Badge>
                        </span>
                      ))}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {section === "estrutura" && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Card>
                <div className="p-5"><CardHeader title="Unidades" /></div>
                <ul className="divide-y divide-line">
                  {UNITS.map((u) => (
                    <li key={u.id} className="px-5 py-3"><p className="text-[13px] font-medium text-ink">{u.nome}</p><p className="text-[11px] text-faint">{u.endereco}</p></li>
                  ))}
                </ul>
              </Card>
              <Card>
                <div className="p-5"><CardHeader title="Salas" /></div>
                <ul className="divide-y divide-line">
                  {ROOMS.map((r) => (
                    <li key={r.id} className="flex items-center justify-between px-5 py-3"><span className="text-[13px] text-ink">{r.nome}</span><Badge tone="neutral" size="sm">{r.tipo}</Badge></li>
                  ))}
                </ul>
              </Card>
            </div>
          )}

          {section === "pagamentos" && (
            <Card>
              <div className="p-5"><CardHeader title="Formas de pagamento aceitas" /></div>
              <ul className="divide-y divide-line">
                {["Pix", "Cartão de crédito", "Cartão de débito", "Dinheiro", "Boleto", "Link de pagamento"].map((f, i) => (
                  <li key={f} className="flex items-center justify-between px-5 py-3">
                    <span className="text-[13px] text-ink">{f}</span>
                    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold", i < 5 ? "bg-ok-soft text-ok" : "bg-surface-2 text-faint")}>
                      {i < 5 ? "Habilitada" : "Desabilitada"}
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {section === "integracoes" && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {[
                { nome: "WhatsApp Business API", desc: "Confirmações, lembretes e campanhas", on: true },
                { nome: "Agendamento online", desc: "Página pública de auto-agendamento", on: true },
                { nome: "Gateway de pagamento", desc: "Links e cartão em maquininha virtual", on: true },
                { nome: "Emissão de NF-e", desc: "Nota fiscal de serviço automática", on: false },
                { nome: "Google Calendar", desc: "Espelhar agenda dos profissionais", on: false },
                { nome: "Assinatura digital", desc: "Termos e contratos com validade jurídica", on: true },
              ].map((it) => (
                <Card key={it.nome}>
                  <div className="flex items-center justify-between gap-3 p-4">
                    <div>
                      <p className="text-[13px] font-semibold text-ink">{it.nome}</p>
                      <p className="text-[11px] text-muted">{it.desc}</p>
                    </div>
                    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold", it.on ? "bg-ok-soft text-ok" : "bg-surface-2 text-faint")}>
                      {it.on ? "Conectada" : "Conectar"}
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <NewProfessionalModal
        open={profModalOpen}
        onClose={() => setProfModalOpen(false)}
        onCreate={async (input) => {
          const { error } = await createProfessional(input);
          if (error) {
            toast.warning("Erro ao criar profissional");
            return false;
          }
          toast.success("Profissional criado");
          setProfModalOpen(false);
          return true;
        }}
      />
    </div>
  );
}

function ClinicForm({
  clinic,
  readOnly,
  onSave,
}: {
  clinic: ClinicSettings;
  readOnly: boolean;
  onSave: (input: ClinicSettings) => Promise<void>;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [nome, setNome] = useState(clinic.nome);
  const [cnpj, setCnpj] = useState(clinic.cnpj);
  const [responsavel, setResponsavel] = useState(clinic.responsavel);
  const [telefone, setTelefone] = useState(clinic.telefone);
  const [email, setEmail] = useState(clinic.email);
  const [formError, setFormError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);

    if (!isValidCNPJ(cnpj)) return setFormError("CNPJ inválido — precisa ter 14 dígitos.");
    if (!isValidPhone(telefone)) return setFormError("Telefone inválido — use DDD + número.");
    if (!isValidEmail(email)) return setFormError("E-mail inválido.");

    setSubmitting(true);
    await onSave({ nome, cnpj, responsavel, telefone, email });
    setSubmitting(false);
  }

  return (
    <form onSubmit={handleSubmit}>
      <CardHeader
        title="Dados da clínica"
        action={
          !readOnly && (
            <Button size="sm" variant="secondary" type="submit" disabled={submitting}>
              {submitting ? "Salvando..." : "Salvar"}
            </Button>
          )
        }
      />
      {formError && <p className="mt-3 text-[13px] text-danger">{formError}</p>}
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 [&_input]:mt-1 [&_input]:w-full [&_input]:rounded-[10px] [&_input]:border [&_input]:border-line [&_input]:px-3 [&_input]:py-2 [&_input]:text-[13px] [&_input]:disabled:bg-surface-2">
        <label className="text-[12px] font-medium text-muted">
          Razão social
          <input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome da clínica" disabled={readOnly} />
        </label>
        <label className="text-[12px] font-medium text-muted">
          CNPJ
          <input
            value={cnpj}
            onChange={(e) => setCnpj(maskCNPJ(e.target.value))}
            placeholder="00.000.000/0000-00"
            inputMode="numeric"
            disabled={readOnly}
          />
        </label>
        <label className="text-[12px] font-medium text-muted">
          Responsável técnica
          <input value={responsavel} onChange={(e) => setResponsavel(e.target.value)} placeholder="Nome do responsável" disabled={readOnly} />
        </label>
        <label className="text-[12px] font-medium text-muted">
          Telefone
          <input
            value={telefone}
            onChange={(e) => setTelefone(maskPhone(e.target.value))}
            placeholder="(00) 00000-0000"
            inputMode="numeric"
            disabled={readOnly}
          />
        </label>
        <label className="text-[12px] font-medium text-muted sm:col-span-2">
          E-mail
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="contato@clinica.com.br"
            disabled={readOnly}
          />
        </label>
      </div>
    </form>
  );
}

function NewProfessionalModal({
  open,
  onClose,
  onCreate,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (input: { nome: string; especialidade: string }) => Promise<boolean>;
}) {
  const [nome, setNome] = useState("");
  const [especialidade, setEspecialidade] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const ok = await onCreate({ nome, especialidade });
    setSubmitting(false);
    if (ok) {
      setNome("");
      setEspecialidade("");
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Novo profissional"
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit" form="new-professional-form" disabled={submitting}>
            {submitting ? "Salvando..." : "Salvar"}
          </Button>
        </>
      }
    >
      <form id="new-professional-form" onSubmit={handleSubmit} className="flex flex-col gap-4 [&_input]:mt-1 [&_input]:w-full [&_input]:rounded-[10px] [&_input]:border [&_input]:border-line [&_input]:px-3 [&_input]:py-2 [&_input]:text-[13px]">
        <label className="text-[12px] font-medium text-muted">
          Nome
          <input required value={nome} onChange={(e) => setNome(e.target.value)} />
        </label>
        <label className="text-[12px] font-medium text-muted">
          Especialidade
          <input required value={especialidade} onChange={(e) => setEspecialidade(e.target.value)} />
        </label>
      </form>
    </Modal>
  );
}

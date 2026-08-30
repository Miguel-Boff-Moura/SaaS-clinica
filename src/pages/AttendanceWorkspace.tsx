import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Camera,
  CircleAlert,
  ClipboardList,
  FileText,
  Pill,
  Save,
  Stethoscope,
  Syringe,
  CheckCircle2,
} from "lucide-react";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Tabs } from "@/components/ui/Tabs";
import { EmptyState, ProgressBar } from "@/components/ui/Misc";
import { useToast } from "@/components/ui/Toast";
import {
  APPOINTMENTS,
  patientById,
  procedureById,
  professionalById,
  roomById,
} from "@/data";
import { age, currency, mediumDate, time } from "@/lib/format";

const TABS = [
  { key: "anamnese", label: "Anamnese", icon: <ClipboardList size={14} /> },
  { key: "avaliacao", label: "Avaliação", icon: <Stethoscope size={14} /> },
  { key: "procedimento", label: "Procedimento", icon: <Syringe size={14} /> },
  { key: "prescricao", label: "Prescrição", icon: <Pill size={14} /> },
  { key: "documentos", label: "Documentos", icon: <FileText size={14} /> },
  { key: "fotos", label: "Fotos", icon: <Camera size={14} /> },
  { key: "observacoes", label: "Observações", icon: <FileText size={14} /> },
];

const TA =
  "w-full rounded-xl border border-line bg-white p-3 text-[13px] text-ink outline-none focus:outline-2 focus:outline-primary resize-y placeholder:text-faint";

export function AttendanceWorkspace() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [tab, setTab] = useState("avaliacao");
  const [finished, setFinished] = useState(false);

  const appt = useMemo(() => APPOINTMENTS.find((a) => a.id === id), [id]);
  const patient = appt ? patientById(appt.pacienteId) : undefined;

  if (!appt || !patient) {
    return <EmptyState title="Atendimento não encontrado" action={<Button onClick={() => navigate("/atendimentos")}>Voltar</Button>} />;
  }

  const proc = procedureById(appt.procedimentoId)!;
  const pro = professionalById(appt.profissionalId)!;
  const room = roomById(appt.salaId)!;
  const pacote = patient.pacotes.find((p) => p.status === "ativo");
  const anteriores = [...patient.procedimentos].sort((a, b) => +b.data - +a.data).slice(0, 4);

  return (
    <div className="fade-in">
      <button onClick={() => navigate("/atendimentos")} className="focusable mb-4 inline-flex items-center gap-1.5 text-[13px] text-muted hover:text-ink">
        <ArrowLeft size={15} /> Fila de atendimentos
      </button>

      {/* Header */}
      <Card className="mb-5">
        <div className="flex flex-wrap items-center gap-4 p-4">
          <Avatar name={patient.nome} size="md" />
          <div>
            <p className="text-[15px] font-semibold text-ink">{patient.nome}</p>
            <p className="text-[12px] text-muted">{age(patient.nascimento)} anos · {patient.telefone}</p>
          </div>
          <div className="ml-auto flex flex-wrap items-center gap-x-6 gap-y-1 text-[12px]">
            <Meta label="Profissional" value={pro.nome} />
            <Meta label="Horário" value={`${time(appt.inicio)}–${time(appt.fim)}`} />
            <Meta label="Tipo" value={appt.tipo} />
            <Meta label="Sala" value={room.nome} />
            <Badge tone={finished ? "ok" : "info"}>{finished ? "Concluído" : "Em atendimento"}</Badge>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_300px]">
        {/* Área clínica */}
        <div>
          <Card>
            <Tabs tabs={TABS} value={tab} onChange={setTab} />
            <div className="p-5">
              {tab === "anamnese" && (
                <div className="space-y-3">
                  <p className="text-[13px] text-muted">Ficha de anamnese do paciente (última atualização: {patient.anamnese.length ? "há 2 meses" : "nunca"}).</p>
                  {patient.anamnese.length ? (
                    <ul className="divide-y divide-line rounded-xl border border-line">
                      {patient.anamnese.map((a, i) => (
                        <li key={i} className="flex items-start justify-between gap-4 px-3.5 py-2.5 text-[13px]">
                          <span className="text-muted">{a.pergunta}</span>
                          <span className={a.alerta ? "font-medium text-warn" : "text-ink"}>{a.resposta}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <textarea className={TA} rows={5} placeholder="Preencher anamnese inicial…" />
                  )}
                  <Button size="sm" variant="secondary" onClick={() => toast.success("Anamnese atualizada")}>Atualizar anamnese</Button>
                </div>
              )}

              {tab === "avaliacao" && (
                <div className="space-y-4">
                  <Labeled label="Queixa principal / objetivo do paciente">
                    <textarea className={TA} rows={2} defaultValue={appt.observacao} placeholder="O que o paciente relata…" />
                  </Labeled>
                  <Labeled label="Exame / avaliação clínica">
                    <textarea className={TA} rows={4} placeholder="Fototipo, hidratação, flacidez, marcação…" />
                  </Labeled>
                  <Labeled label="Hipótese e plano terapêutico">
                    <textarea className={TA} rows={3} placeholder="Conduta proposta e cronograma de sessões…" />
                  </Labeled>
                </div>
              )}

              {tab === "procedimento" && (
                <div className="space-y-4">
                  <div className="rounded-xl border border-line bg-surface-2/50 p-4">
                    <p className="text-[13px] font-semibold text-ink">{proc.nome}</p>
                    <p className="mt-0.5 text-[12px] text-muted">Duração prevista {proc.duracaoMin}min · {proc.salaId === room.id ? room.nome : "sala a confirmar"} · {currency(proc.preco)}</p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {proc.materiais.length ? proc.materiais.map((m) => (
                        <span key={m} className="rounded-full bg-white px-2 py-0.5 text-[11px] text-muted ring-1 ring-line">{m}</span>
                      )) : <span className="text-[12px] text-faint">Sem materiais cadastrados</span>}
                    </div>
                  </div>
                  <Labeled label="Registro técnico do procedimento">
                    <textarea className={TA} rows={4} placeholder="Produto, lote, quantidade por região, técnica, intercorrências…" />
                  </Labeled>
                  <label className="flex items-center gap-2 text-[13px] text-muted">
                    <input type="checkbox" defaultChecked className="size-4 rounded border-line accent-[var(--color-primary)]" />
                    Dar baixa automática de materiais no estoque
                  </label>
                  {pacote && (
                    <label className="flex items-center gap-2 text-[13px] text-muted">
                      <input type="checkbox" defaultChecked className="size-4 rounded border-line accent-[var(--color-primary)]" />
                      Consumir 1 sessão de <strong className="font-medium text-ink">{pacote.nome}</strong> ({pacote.sessoesContratadas - pacote.sessoesUsadas} restantes)
                    </label>
                  )}
                </div>
              )}

              {tab === "prescricao" && (
                <div className="space-y-3">
                  <Labeled label="Prescrição / orientações pós-procedimento">
                    <textarea className={TA} rows={6} placeholder={"1. Compressa fria local 10min, 4x/dia por 48h\n2. Evitar exercícios físicos por 24h\n3. Protetor solar FPS 50, reaplicar a cada 3h"} />
                  </Labeled>
                  <div className="flex gap-2">
                    <Button size="sm" variant="secondary" onClick={() => toast.success("Receita gerada", "PDF pronto para assinatura digital.")}>Gerar receita (PDF)</Button>
                    <Button size="sm" variant="secondary" onClick={() => toast.success("Enviado pelo WhatsApp")}>Enviar ao paciente</Button>
                  </div>
                </div>
              )}

              {tab === "documentos" && (
                <div className="space-y-2">
                  {["Termo de consentimento — " + proc.nome, "Orientações pós-procedimento", "Contrato de pacote"].map((d) => (
                    <div key={d} className="flex items-center justify-between rounded-xl border border-line px-3.5 py-2.5">
                      <span className="flex items-center gap-2 text-[13px] text-ink"><FileText size={15} className="text-primary" /> {d}</span>
                      <Button size="sm" variant="ghost" onClick={() => toast.success("Documento anexado")}>Gerar e anexar</Button>
                    </div>
                  ))}
                </div>
              )}

              {tab === "fotos" && (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {["Antes", "Depois"].map((l) => (
                    <button key={l} onClick={() => toast.success("Foto adicionada")} className="focusable flex aspect-square flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-line text-faint hover:border-primary hover:text-primary">
                      <Camera size={22} />
                      <span className="text-[12px] font-medium">{l}</span>
                    </button>
                  ))}
                </div>
              )}

              {tab === "observacoes" && (
                <textarea className={TA} rows={6} placeholder="Anotações internas (não visíveis ao paciente)…" />
              )}
            </div>
          </Card>

          {/* Barra de ações */}
          <div className="sticky bottom-0 z-10 mt-4 flex items-center justify-between gap-3 rounded-xl border border-line bg-white/90 p-3 backdrop-blur">
            <p className="text-[12px] text-faint">Rascunho salvo automaticamente às {time(new Date())}</p>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={() => toast.info("Rascunho salvo")}>
                <Save size={14} /> Salvar rascunho
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  setFinished(true);
                  toast.success("Atendimento finalizado", "Evolução gravada, financeiro e retorno agendados.");
                }}
              >
                <CheckCircle2 size={14} /> Finalizar atendimento
              </Button>
            </div>
          </div>
        </div>

        {/* Resumo lateral do paciente */}
        <aside className="space-y-4">
          {patient.alergias.length > 0 && (
            <Card className="border-warn/30 bg-warn-soft/40">
              <div className="p-4">
                <p className="flex items-center gap-1.5 text-[12px] font-semibold text-warn">
                  <CircleAlert size={14} /> Alergias
                </p>
                <p className="mt-1 text-[13px] text-ink">{patient.alergias.join(", ")}</p>
              </div>
            </Card>
          )}

          {patient.observacoesImportantes.length > 0 && (
            <Card>
              <div className="p-4">
                <CardHeader title="Observações importantes" />
                <ul className="mt-2 space-y-1.5 text-[12.5px] text-muted">
                  {patient.observacoesImportantes.map((o) => <li key={o}>• {o}</li>)}
                </ul>
              </div>
            </Card>
          )}

          {pacote && (
            <Card>
              <div className="p-4">
                <CardHeader title="Pacote ativo" />
                <p className="mt-2 text-[13px] font-medium text-ink">{pacote.nome}</p>
                <p className="text-[12px] text-muted">{pacote.sessoesUsadas}/{pacote.sessoesContratadas} sessões</p>
                <ProgressBar className="mt-2" value={pacote.sessoesUsadas} total={pacote.sessoesContratadas} />
              </div>
            </Card>
          )}

          <Card>
            <div className="p-4">
              <CardHeader title="Procedimentos anteriores" />
              <ul className="mt-2 space-y-2.5">
                {anteriores.map((p) => (
                  <li key={p.id} className="text-[12.5px]">
                    <p className="font-medium text-ink">{p.nome}</p>
                    <p className="text-faint">{mediumDate(p.data)} · {p.profissional}</p>
                  </li>
                ))}
                {anteriores.length === 0 && <p className="text-[12.5px] text-faint">Primeiro atendimento do paciente.</p>}
              </ul>
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <span className="leading-tight">
      <span className="block text-[10px] font-medium uppercase tracking-wide text-faint">{label}</span>
      <span className="block font-medium text-ink">{value}</span>
    </span>
  );
}

function Labeled({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[12px] font-medium text-muted">{label}</span>
      {children}
    </label>
  );
}

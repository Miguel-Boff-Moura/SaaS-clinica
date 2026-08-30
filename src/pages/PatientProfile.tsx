import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CakeSlice,
  CalendarPlus,
  CircleAlert,
  FileText,
  Image as ImageIcon,
  Mail,
  MessageCircle,
  Phone,
  Play,
  Receipt,
  Stethoscope,
} from "lucide-react";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { Badge, BILL_STATUS, PATIENT_STATUS } from "@/components/ui/Badge";
import { Tabs } from "@/components/ui/Tabs";
import { Field, ProgressBar, EmptyState, ReturnRing } from "@/components/ui/Misc";
import { useToast } from "@/components/ui/Toast";
import { TimelineFeed } from "@/components/TimelineFeed";
import { computeReturns, patientById, procedureById, professionalById } from "@/data";
import { age, currency, fullDate, mediumDate, monthYear, relativeFromToday } from "@/lib/format";

const TABS = [
  { key: "resumo", label: "Resumo" },
  { key: "historico", label: "Histórico" },
  { key: "prontuario", label: "Prontuário" },
  { key: "anamnese", label: "Anamnese" },
  { key: "procedimentos", label: "Procedimentos" },
  { key: "pacotes", label: "Pacotes" },
  { key: "financeiro", label: "Financeiro" },
  { key: "documentos", label: "Documentos" },
  { key: "galeria", label: "Galeria" },
];

export function PatientProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [tab, setTab] = useState("resumo");
  const patient = id ? patientById(id) : undefined;

  const ret = useMemo(
    () => computeReturns().find((r) => r.patientId === id),
    [id]
  );

  if (!patient) {
    return (
      <div className="fade-in">
        <EmptyState title="Paciente não encontrado" action={<Button onClick={() => navigate("/pacientes")}>Voltar</Button>} />
      </div>
    );
  }

  const st = PATIENT_STATUS[patient.status];
  const totalPago = patient.financeiro.filter((f) => f.status === "pago").reduce((s, f) => s + f.valor, 0);
  const totalPendente = patient.financeiro.filter((f) => f.status === "pendente").reduce((s, f) => s + f.valor, 0);
  const pacoteAtivo = patient.pacotes.find((p) => p.status === "ativo");

  return (
    <div className="fade-in">
      <Link to="/pacientes" className="focusable mb-4 inline-flex items-center gap-1.5 text-[13px] text-muted hover:text-ink">
        <ArrowLeft size={15} /> Pacientes
      </Link>

      {/* Header */}
      <Card className="mb-5">
        <div className="flex flex-col gap-5 p-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex gap-4">
            <Avatar name={patient.nome} size="lg" color="#0F766E" />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-display text-[24px] leading-tight text-ink">{patient.nome}</h1>
                <Badge tone={st.tone}>{st.label}</Badge>
                {patient.aniversarioEsteMes && (
                  <Badge tone="violet"><CakeSlice size={12} /> Aniversariante</Badge>
                )}
              </div>
              <p className="mt-1 text-[13px] text-muted">
                {age(patient.nascimento)} anos · {fullDate(patient.nascimento)} · cliente desde {monthYear(patient.desde)}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12.5px] text-muted">
                <span className="inline-flex items-center gap-1.5"><Phone size={13} /> {patient.telefone}</span>
                <span className="inline-flex items-center gap-1.5"><Mail size={13} /> {patient.email}</span>
                <span className="inline-flex items-center gap-1.5">Origem: {patient.origem}</span>
              </div>
              {patient.tags.length > 0 && (
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {patient.tags.map((t) => (
                    <span key={t} className="rounded-full bg-surface-2 px-2 py-0.5 text-[11px] font-medium text-muted">{t}</span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={() => navigate(`/atendimentos`)}>
              <Play size={14} /> Iniciar atendimento
            </Button>
            <Button size="sm" variant="secondary" onClick={() => navigate("/agenda?novo=1")}>
              <CalendarPlus size={14} /> Agendar
            </Button>
            <Button size="sm" variant="secondary" onClick={() => toast.success("WhatsApp", `Conversa com ${patient.nome} aberta.`)}>
              <MessageCircle size={14} /> WhatsApp
            </Button>
            <Button size="sm" variant="secondary" onClick={() => navigate("/vendas?novo=1")}>
              <Receipt size={14} /> Orçamento
            </Button>
            <Button size="sm" variant="ghost" onClick={() => toast.success("Pagamento registrado")}>
              Registrar pagamento
            </Button>
          </div>
        </div>

        {(patient.alergias.length > 0 || patient.observacoesImportantes.length > 0) && (
          <div className="flex flex-wrap gap-x-6 gap-y-1.5 border-t border-line bg-warn-soft/40 px-5 py-3 text-[12.5px]">
            {patient.alergias.length > 0 && (
              <span className="inline-flex items-center gap-1.5 font-medium text-warn">
                <CircleAlert size={14} /> Alergias: {patient.alergias.join(", ")}
              </span>
            )}
            {patient.observacoesImportantes.map((o) => (
              <span key={o} className="inline-flex items-center gap-1.5 text-muted">• {o}</span>
            ))}
          </div>
        )}
      </Card>

      <Tabs tabs={TABS} value={tab} onChange={setTab} className="mb-5" />

      {/* ---- RESUMO ---- */}
      {tab === "resumo" && (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <MiniStat label="Total gasto" value={currency(patient.valorGasto)} />
              <MiniStat label="Atendimentos" value={String(patient.procedimentos.length)} />
              <MiniStat label="Pendente" value={currency(totalPendente)} tone={totalPendente > 0 ? "danger" : undefined} />
              <MiniStat label="Faltas" value={String(patient.faltas)} tone={patient.faltas >= 2 ? "danger" : undefined} />
            </div>

            <Card>
              <div className="p-5">
                <CardHeader title="Últimos acontecimentos" />
                <div className="mt-4">
                  <TimelineFeed events={patient.timeline.slice(0, 6)} />
                </div>
              </div>
            </Card>
          </div>

          <div className="space-y-4">
            <Card>
              <div className="p-5">
                <CardHeader title="Agendamentos" />
                <div className="mt-3 space-y-3 text-[13px]">
                  <div>
                    <p className="text-[11px] font-medium uppercase text-faint">Próximo</p>
                    <p className="mt-0.5 text-ink">
                      {patient.proximoAgendamento ? `${fullDate(patient.proximoAgendamento)} · ${relativeFromToday(patient.proximoAgendamento)}` : "Nenhum agendado"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] font-medium uppercase text-faint">Último atendimento</p>
                    <p className="mt-0.5 text-ink">{patient.ultimaVisita ? fullDate(patient.ultimaVisita) : "—"}</p>
                  </div>
                </div>
              </div>
            </Card>

            {ret && (
              <Card>
                <div className="flex items-center gap-4 p-5">
                  <ReturnRing progress={ret.progresso} status={ret.status} size={56} label={ret.diasRestantes < 0 ? "!" : `${ret.diasRestantes}d`} />
                  <div>
                    <p className="text-[13px] font-semibold text-ink">Janela de retorno</p>
                    <p className="text-[12px] text-muted">{ret.procedimento}</p>
                    <p className="mt-0.5 text-[12px] text-muted">
                      {ret.status === "vencido" ? "Venceu" : "Vence"} em {mediumDate(ret.venceEm)}
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {pacoteAtivo && (
              <Card>
                <div className="p-5">
                  <CardHeader title="Pacote ativo" />
                  <p className="mt-2 text-[13px] font-medium text-ink">{pacoteAtivo.nome}</p>
                  <p className="text-[12px] text-muted">
                    {pacoteAtivo.sessoesUsadas} de {pacoteAtivo.sessoesContratadas} sessões usadas
                  </p>
                  <ProgressBar className="mt-2" value={pacoteAtivo.sessoesUsadas} total={pacoteAtivo.sessoesContratadas} />
                  <p className="mt-2 text-[11px] text-faint">Válido até {mediumDate(pacoteAtivo.validadeAte)}</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* ---- HISTÓRICO ---- */}
      {tab === "historico" && (
        <Card>
          <div className="p-5">
            <CardHeader title="Linha do tempo completa" subtitle="Consultas, procedimentos, pagamentos, orçamentos e mensagens" />
            <div className="mt-4">
              <TimelineFeed events={patient.timeline} />
            </div>
          </div>
        </Card>
      )}

      {/* ---- PRONTUÁRIO ---- */}
      {tab === "prontuario" && (
        <div className="space-y-4">
          {patient.prontuario.length === 0 ? (
            <Card><EmptyState icon={<Stethoscope size={20} />} title="Sem evoluções clínicas" description="As anotações de atendimento aparecem aqui." /></Card>
          ) : (
            patient.prontuario.map((e) => (
              <Card key={e.id}>
                <div className="p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-[13px] font-semibold text-ink">{e.tipo}</p>
                    <p className="text-[12px] text-faint">{fullDate(e.data)} · {e.profissional}</p>
                  </div>
                  <dl className="mt-3 space-y-2 text-[13px]">
                    <div><dt className="text-[11px] font-medium uppercase text-faint">Queixa / objetivo</dt><dd className="mt-0.5 text-ink">{e.queixa}</dd></div>
                    <div><dt className="text-[11px] font-medium uppercase text-faint">Conduta</dt><dd className="mt-0.5 text-ink">{e.conduta}</dd></div>
                    {e.prescricao && e.prescricao.length > 0 && (
                      <div>
                        <dt className="text-[11px] font-medium uppercase text-faint">Prescrição</dt>
                        <dd className="mt-1"><ul className="list-inside list-disc space-y-0.5 text-ink">{e.prescricao.map((p, i) => <li key={i}>{p}</li>)}</ul></dd>
                      </div>
                    )}
                  </dl>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* ---- ANAMNESE ---- */}
      {tab === "anamnese" && (
        <Card>
          <div className="p-5">
            <CardHeader title="Ficha de anamnese" subtitle="Respostas destacadas exigem atenção clínica" />
            {patient.anamnese.length === 0 ? (
              <EmptyState className="py-8" title="Anamnese ainda não preenchida" />
            ) : (
              <ul className="mt-4 divide-y divide-line">
                {patient.anamnese.map((a, i) => (
                  <li key={i} className="grid grid-cols-1 gap-1 py-3 sm:grid-cols-[1fr_1.2fr]">
                    <p className="text-[13px] text-muted">{a.pergunta}</p>
                    <p className={`text-[13px] font-medium ${a.alerta ? "text-warn" : "text-ink"}`}>
                      {a.alerta && <CircleAlert size={13} className="mr-1 inline align-[-2px]" />}
                      {a.resposta}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Card>
      )}

      {/* ---- PROCEDIMENTOS ---- */}
      {tab === "procedimentos" && (
        <Card className="overflow-hidden">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="border-b border-line bg-surface-2/50 text-[11px] font-semibold uppercase text-faint">
                <th className="px-5 py-3">Procedimento</th>
                <th className="px-3 py-3">Data</th>
                <th className="px-3 py-3">Profissional</th>
                <th className="px-3 py-3">Região</th>
                <th className="px-3 py-3 text-right">Valor</th>
                <th className="px-3 py-3">Pagamento</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {[...patient.procedimentos].sort((a, b) => +b.data - +a.data).map((p) => (
                <tr key={p.id} className="hover:bg-surface-2/60">
                  <td className="px-5 py-3 font-medium text-ink">
                    {p.nome}
                    {p.pacoteId && <span className="ml-2 rounded bg-primary-soft px-1.5 py-0.5 text-[10px] font-medium text-primary-ink">pacote</span>}
                  </td>
                  <td className="px-3 py-3 text-muted">{mediumDate(p.data)}</td>
                  <td className="px-3 py-3 text-muted">{p.profissional}</td>
                  <td className="px-3 py-3 text-muted">{p.regiao ?? "—"}</td>
                  <td className="px-3 py-3 text-right tabular-nums text-ink">{p.valor > 0 ? currency(p.valor) : "incluído"}</td>
                  <td className="px-3 py-3">
                    <Badge tone={p.pago ? "ok" : "warn"} size="sm">{p.pago ? "Pago" : "Pendente"}</Badge>
                  </td>
                </tr>
              ))}
              {patient.procedimentos.length === 0 && (
                <tr><td colSpan={6}><EmptyState title="Nenhum procedimento registrado" /></td></tr>
              )}
            </tbody>
          </table>
        </Card>
      )}

      {/* ---- PACOTES ---- */}
      {tab === "pacotes" && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {patient.pacotes.length === 0 && (
            <Card className="sm:col-span-2"><EmptyState title="Nenhum pacote adquirido" /></Card>
          )}
          {patient.pacotes.map((pk) => {
            const restante = pk.sessoesContratadas - pk.sessoesUsadas;
            return (
              <Card key={pk.id}>
                <div className="p-5">
                  <div className="flex items-center justify-between">
                    <p className="text-[14px] font-semibold text-ink">{pk.nome}</p>
                    <Badge tone={pk.status === "ativo" ? "ok" : pk.status === "expirado" ? "danger" : "neutral"} size="sm">
                      {pk.status === "ativo" ? "Ativo" : pk.status === "expirado" ? "Expirado" : "Concluído"}
                    </Badge>
                  </div>
                  <p className="mt-1 text-[12px] text-muted">
                    Comprado em {mediumDate(pk.compradoEm)} · {currency(pk.valorPago)}
                  </p>
                  <div className="mt-4 flex items-end justify-between text-[12px]">
                    <span className="text-muted">Sessões utilizadas</span>
                    <span className="font-semibold text-ink">{pk.sessoesUsadas}/{pk.sessoesContratadas}</span>
                  </div>
                  <ProgressBar className="mt-1.5" value={pk.sessoesUsadas} total={pk.sessoesContratadas} tone={restante <= 1 ? "warn" : "primary"} />
                  <div className="mt-3 flex items-center justify-between text-[12px] text-muted">
                    <span>{restante} sessões restantes</span>
                    <span>Validade: {mediumDate(pk.validadeAte)}</span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* ---- FINANCEIRO ---- */}
      {tab === "financeiro" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <MiniStat label="Total pago" value={currency(totalPago)} tone="ok" />
            <MiniStat label="Pendente" value={currency(totalPendente)} tone={totalPendente > 0 ? "danger" : undefined} />
            <MiniStat label="Ticket médio" value={currency(Math.round(patient.valorGasto / Math.max(1, patient.procedimentos.length)))} />
          </div>
          <Card className="overflow-hidden">
            <table className="w-full text-left text-[13px]">
              <thead>
                <tr className="border-b border-line bg-surface-2/50 text-[11px] font-semibold uppercase text-faint">
                  <th className="px-5 py-3">Descrição</th>
                  <th className="px-3 py-3">Data</th>
                  <th className="px-3 py-3">Forma</th>
                  <th className="px-3 py-3 text-right">Valor</th>
                  <th className="px-3 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {[...patient.financeiro].sort((a, b) => +b.data - +a.data).map((f) => {
                  const s = BILL_STATUS[f.status];
                  return (
                    <tr key={f.id} className="hover:bg-surface-2/60">
                      <td className="px-5 py-3 font-medium text-ink">{f.descricao}</td>
                      <td className="px-3 py-3 text-muted">{mediumDate(f.data)}</td>
                      <td className="px-3 py-3 text-muted">{f.forma ?? "—"}</td>
                      <td className="px-3 py-3 text-right tabular-nums text-ink">{currency(f.valor)}</td>
                      <td className="px-3 py-3"><Badge tone={s.tone} size="sm">{s.label}</Badge></td>
                    </tr>
                  );
                })}
                {patient.financeiro.length === 0 && (
                  <tr><td colSpan={5}><EmptyState title="Sem lançamentos financeiros" /></td></tr>
                )}
              </tbody>
            </table>
          </Card>
        </div>
      )}

      {/* ---- DOCUMENTOS ---- */}
      {tab === "documentos" && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {patient.documentos.length === 0 && (
            <Card className="sm:col-span-2 lg:col-span-3"><EmptyState icon={<FileText size={20} />} title="Nenhum documento" description="Receitas, termos e contratos assinados aparecem aqui." /></Card>
          )}
          {patient.documentos.map((d) => (
            <Card key={d.id}>
              <button
                onClick={() => toast.info("Documento", `Abrindo "${d.nome}" (PDF).`)}
                className="focusable flex w-full items-center gap-3 p-4 text-left hover:bg-surface-2/60"
              >
                <span className="flex size-10 items-center justify-center rounded-lg bg-primary-soft text-primary-ink"><FileText size={18} /></span>
                <span className="min-w-0">
                  <span className="block truncate text-[13px] font-medium text-ink">{d.nome}</span>
                  <span className="block text-[11px] text-faint">{d.tipo} · {mediumDate(d.data)}</span>
                </span>
              </button>
            </Card>
          ))}
        </div>
      )}

      {/* ---- GALERIA ---- */}
      {tab === "galeria" && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {patient.galeria.length === 0 && (
            <Card className="sm:col-span-2 lg:col-span-3"><EmptyState icon={<ImageIcon size={20} />} title="Sem fotos" description="Registros de antes/depois aparecem aqui, com consentimento do paciente." /></Card>
          )}
          {patient.galeria.map((g) => (
            <Card key={g.id} className="overflow-hidden">
              <div className="grid grid-cols-2">
                <div className="aspect-square" style={{ background: g.antes }}>
                  <span className="m-2 inline-block rounded bg-white/80 px-1.5 py-0.5 text-[10px] font-semibold text-ink">ANTES</span>
                </div>
                <div className="aspect-square" style={{ background: g.depois }}>
                  <span className="m-2 inline-block rounded bg-white/80 px-1.5 py-0.5 text-[10px] font-semibold text-ink">DEPOIS</span>
                </div>
              </div>
              <div className="p-3">
                <p className="text-[12px] font-medium text-ink">{g.regiao}</p>
                <p className="text-[11px] text-faint">{mediumDate(g.data)}{g.nota ? ` · ${g.nota}` : ""}</p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function MiniStat({ label, value, tone }: { label: string; value: string; tone?: "ok" | "danger" }) {
  return (
    <div className="card p-3.5">
      <p className="text-[11px] font-medium uppercase tracking-wide text-faint">{label}</p>
      <p className={`mt-1 font-display text-[19px] ${tone === "ok" ? "text-ok" : tone === "danger" ? "text-danger" : "text-ink"}`}>{value}</p>
    </div>
  );
}

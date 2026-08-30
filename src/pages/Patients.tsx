import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Download, Plus, Search } from "lucide-react";
import type { Patient } from "@/types";
import { PageHeader, EmptyState } from "@/components/ui/Misc";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { Badge, PATIENT_STATUS } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { PATIENTS, computeReturns, professionalById } from "@/data";
import { cn } from "@/lib/cn";
import { currency, mediumDate, relativeFromToday, TODAY } from "@/lib/format";

const FILTERS = [
  { key: "todos", label: "Todos" },
  { key: "novos", label: "Novos (30d)" },
  { key: "ativos", label: "Ativos" },
  { key: "inativos", label: "Inativos" },
  { key: "retorno", label: "Retorno pendente" },
  { key: "aniversario", label: "Aniversariantes" },
  { key: "faltosos", label: "Faltosos" },
  { key: "leads", label: "Leads" },
  { key: "pacote", label: "Com pacote ativo" },
] as const;

export function Patients() {
  const toast = useToast();
  const [params, setParams] = useSearchParams();
  const [filter, setFilter] = useState<string>(params.get("filtro") ?? "todos");
  const [q, setQ] = useState("");
  const [novoOpen, setNovoOpen] = useState(false);

  const returnsByPatient = useMemo(() => {
    const m = new Map<string, string>();
    computeReturns().forEach((r) => m.set(r.patientId, r.status));
    return m;
  }, []);

  const list = useMemo(() => {
    const t = q.trim().toLowerCase();
    return PATIENTS.filter((p) => {
      if (t && !(p.nome.toLowerCase().includes(t) || p.telefone.includes(t) || p.email.toLowerCase().includes(t)))
        return false;
      switch (filter) {
        case "novos":
          return (TODAY.getTime() - p.desde.getTime()) / 86_400_000 <= 30;
        case "ativos":
          return p.status === "ativo";
        case "inativos":
          return p.status === "inativo";
        case "retorno":
          return (returnsByPatient.get(p.id) ?? "em_dia") !== "em_dia";
        case "aniversario":
          return p.aniversarioEsteMes;
        case "faltosos":
          return p.faltas >= 2;
        case "leads":
          return p.status === "lead";
        case "pacote":
          return p.pacotes.some((pk) => pk.status === "ativo");
        default:
          return true;
      }
    });
  }, [q, filter, returnsByPatient]);

  const setF = (k: string) => {
    setFilter(k);
    if (k === "todos") params.delete("filtro");
    else params.set("filtro", k);
    setParams(params, { replace: true });
  };

  return (
    <div className="fade-in">
      <PageHeader
        title="Pacientes"
        subtitle={`${PATIENTS.length} cadastros · CRM de relacionamento e histórico`}
        actions={
          <>
            <Button variant="secondary" size="sm" onClick={() => toast.info("Exportação", "CSV com os filtros atuais foi gerado.")}>
              <Download size={14} /> Exportar
            </Button>
            <Button size="sm" onClick={() => setNovoOpen(true)}>
              <Plus size={15} /> Novo paciente
            </Button>
          </>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="flex w-full max-w-xs items-center gap-2 rounded-[10px] border border-line bg-white px-3 py-2">
          <Search size={15} className="text-faint" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por nome, telefone ou e-mail"
            className="w-full bg-transparent text-[13px] outline-none placeholder:text-faint"
          />
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-1.5">
        {FILTERS.map((f) => {
          const count =
            f.key === "todos"
              ? PATIENTS.length
              : PATIENTS.filter((p) => {
                  switch (f.key) {
                    case "novos": return (TODAY.getTime() - p.desde.getTime()) / 86_400_000 <= 30;
                    case "ativos": return p.status === "ativo";
                    case "inativos": return p.status === "inativo";
                    case "retorno": return (returnsByPatient.get(p.id) ?? "em_dia") !== "em_dia";
                    case "aniversario": return p.aniversarioEsteMes;
                    case "faltosos": return p.faltas >= 2;
                    case "leads": return p.status === "lead";
                    case "pacote": return p.pacotes.some((pk) => pk.status === "ativo");
                    default: return false;
                  }
                }).length;
          return (
            <button
              key={f.key}
              onClick={() => setF(f.key)}
              className={cn(
                "focusable inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12.5px] font-medium transition-colors",
                filter === f.key
                  ? "border-primary bg-primary text-white"
                  : "border-line bg-white text-muted hover:bg-surface-2"
              )}
            >
              {f.label}
              <span className={cn("text-[11px]", filter === f.key ? "text-white/80" : "text-faint")}>{count}</span>
            </button>
          );
        })}
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto scroll-thin">
          <table className="w-full min-w-[880px] text-left text-[13px]">
            <thead>
              <tr className="border-b border-line bg-surface-2/50 text-[11px] font-semibold uppercase tracking-wide text-faint">
                <th className="px-5 py-3">Paciente</th>
                <th className="px-3 py-3">Última visita</th>
                <th className="px-3 py-3">Próximo agend.</th>
                <th className="px-3 py-3">Profissional</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3 text-right">Valor gasto</th>
                <th className="px-3 py-3">Origem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {list.map((p) => {
                const pro = professionalById(p.profissionalId);
                const st = PATIENT_STATUS[p.status];
                const ret = returnsByPatient.get(p.id);
                return (
                  <tr key={p.id} className="group transition-colors hover:bg-surface-2/60">
                    <td className="px-5 py-3">
                      <Link to={`/pacientes/${p.id}`} className="focusable flex items-center gap-3">
                        <Avatar name={p.nome} size="sm" />
                        <span className="min-w-0">
                          <span className="block font-medium text-ink group-hover:text-primary-ink">{p.nome}</span>
                          <span className="block text-[11px] text-faint">{p.telefone}</span>
                        </span>
                      </Link>
                    </td>
                    <td className="px-3 py-3 text-muted">
                      {p.ultimaVisita ? mediumDate(p.ultimaVisita) : "—"}
                    </td>
                    <td className="px-3 py-3">
                      {p.proximoAgendamento ? (
                        <span className="text-ink">{relativeFromToday(p.proximoAgendamento)}</span>
                      ) : (
                        <span className="text-faint">—</span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-muted">{pro?.nome ?? "—"}</td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-1.5">
                        <Badge tone={st.tone} size="sm">{st.label}</Badge>
                        {ret && ret !== "em_dia" && (
                          <Badge tone={ret === "vencido" ? "danger" : "warn"} size="sm">retorno</Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-right font-medium tabular-nums text-ink">
                      {currency(p.valorGasto)}
                    </td>
                    <td className="px-3 py-3 text-muted">{p.origem}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {list.length === 0 && (
          <EmptyState title="Nenhum paciente encontrado" description="Tente outro termo de busca ou remova os filtros." />
        )}
      </Card>

      <Modal
        open={novoOpen}
        onClose={() => setNovoOpen(false)}
        title="Novo paciente"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setNovoOpen(false)}>Cancelar</Button>
            <Button size="sm" onClick={() => { setNovoOpen(false); toast.success("Paciente cadastrado", "Ficha criada. Você já pode agendar o primeiro atendimento."); }}>
              Cadastrar
            </Button>
          </>
        }
      >
        <div className="grid grid-cols-2 gap-3 [&_input]:w-full [&_input]:rounded-[10px] [&_input]:border [&_input]:border-line [&_input]:px-3 [&_input]:py-2 [&_input]:text-[13px] [&_select]:w-full [&_select]:rounded-[10px] [&_select]:border [&_select]:border-line [&_select]:px-3 [&_select]:py-2 [&_select]:text-[13px]">
          <label className="col-span-2 block"><span className="mb-1 block text-[12px] font-medium text-muted">Nome completo</span><input placeholder="Ex.: Marina Souza" /></label>
          <label className="block"><span className="mb-1 block text-[12px] font-medium text-muted">Telefone / WhatsApp</span><input placeholder="(51) 9…" /></label>
          <label className="block"><span className="mb-1 block text-[12px] font-medium text-muted">Data de nascimento</span><input type="date" /></label>
          <label className="col-span-2 block"><span className="mb-1 block text-[12px] font-medium text-muted">E-mail</span><input type="email" placeholder="nome@email.com" /></label>
          <label className="block"><span className="mb-1 block text-[12px] font-medium text-muted">Origem</span><select><option>Instagram</option><option>Indicação</option><option>Google</option><option>Site</option><option>WhatsApp</option></select></label>
          <label className="block"><span className="mb-1 block text-[12px] font-medium text-muted">Profissional de referência</span><select><option>Dra. Mariana Costa</option><option>Dr. Rafael Mendes</option><option>Dra. Camila Alves</option></select></label>
        </div>
      </Modal>
    </div>
  );
}

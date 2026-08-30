import { useState } from "react";
import { Link } from "react-router-dom";
import { Megaphone, Send, MessageCircle, Power } from "lucide-react";
import { PageHeader, EmptyState } from "@/components/ui/Misc";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Tabs } from "@/components/ui/Tabs";
import { Avatar } from "@/components/ui/Avatar";
import { useToast } from "@/components/ui/Toast";
import { CAMPAIGNS, CONVERSATIONS, MESSAGE_TEMPLATES } from "@/data";
import { mediumDate, relativeFromToday, time } from "@/lib/format";
import { cn } from "@/lib/cn";

const TABS = [
  { key: "conversas", label: "Conversas" },
  { key: "automaticas", label: "Mensagens automáticas" },
  { key: "campanhas", label: "Campanhas" },
];

export function Communication() {
  const toast = useToast();
  const [tab, setTab] = useState("conversas");
  const [activeId, setActiveId] = useState(CONVERSATIONS[1].id);
  const [templates, setTemplates] = useState(MESSAGE_TEMPLATES);
  const [draft, setDraft] = useState("");

  const active = CONVERSATIONS.find((c) => c.id === activeId)!;

  return (
    <div className="fade-in">
      <PageHeader title="Comunicação" subtitle="WhatsApp, mensagens automáticas e campanhas" />

      <Tabs tabs={TABS} value={tab} onChange={setTab} className="mb-5" />

      {tab === "conversas" && (
        <Card className="overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-[300px_1fr]">
            <div className="border-r border-line">
              <div className="border-b border-line px-4 py-3 text-[12px] font-semibold uppercase text-faint">Caixa de entrada</div>
              <ul className="max-h-[520px] divide-y divide-line overflow-y-auto scroll-thin">
                {CONVERSATIONS.map((c) => (
                  <li key={c.id}>
                    <button
                      onClick={() => setActiveId(c.id)}
                      className={cn("focusable flex w-full gap-3 px-4 py-3 text-left hover:bg-surface-2/60", c.id === activeId && "bg-primary-soft/50")}
                    >
                      <Avatar name={c.pacienteNome} size="sm" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="truncate text-[13px] font-medium text-ink">{c.pacienteNome}</p>
                          <span className="text-[10.5px] text-faint">{relativeFromToday(c.ultimaData)}</span>
                        </div>
                        <p className="truncate text-[12px] text-muted">{c.ultimaMensagem}</p>
                      </div>
                      {c.naoLidas > 0 && <span className="mt-1 size-4 shrink-0 rounded-full bg-primary text-center text-[10px] font-semibold leading-4 text-white">{c.naoLidas}</span>}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex min-h-[560px] flex-col">
              <div className="flex items-center justify-between border-b border-line px-5 py-3">
                <div className="flex items-center gap-2.5">
                  <Avatar name={active.pacienteNome} size="sm" />
                  <div>
                    <p className="text-[13px] font-semibold text-ink">{active.pacienteNome}</p>
                    <p className="text-[11px] text-faint">WhatsApp · {active.status}</p>
                  </div>
                </div>
                {active.pacienteId && (
                  <Link to={`/pacientes/${active.pacienteId}`} className="text-[12px] font-medium text-primary-ink hover:underline">Abrir ficha</Link>
                )}
              </div>

              <div className="flex-1 space-y-3 overflow-y-auto scroll-thin bg-surface-2/40 p-5">
                {active.mensagens.map((m, i) => (
                  <div key={i} className={cn("flex", m.de === "clinica" ? "justify-end" : "justify-start")}>
                    <div className={cn("max-w-[75%] rounded-2xl px-3.5 py-2 text-[13px]", m.de === "clinica" ? "bg-primary text-white" : "bg-white text-ink ring-1 ring-line")}>
                      <p>{m.texto}</p>
                      <p className={cn("mt-1 text-[10px]", m.de === "clinica" ? "text-white/70" : "text-faint")}>{time(m.hora)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2 border-t border-line p-3">
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Escreva uma mensagem…"
                  className="flex-1 rounded-full border border-line px-4 py-2 text-[13px] outline-none focus:outline-2 focus:outline-primary"
                />
                <Button size="sm" onClick={() => { if (draft.trim()) { toast.success("Mensagem enviada"); setDraft(""); } }}>
                  <Send size={14} /> Enviar
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {tab === "automaticas" && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {templates.map((t) => (
            <Card key={t.id}>
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[13.5px] font-semibold text-ink">{t.nome}</p>
                    <p className="mt-0.5 text-[12px] text-muted">Gatilho: {t.gatilho}</p>
                  </div>
                  <button
                    onClick={() => setTemplates((p) => p.map((x) => (x.id === t.id ? { ...x, ativo: !x.ativo } : x)))}
                    className={cn(
                      "focusable inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold",
                      t.ativo ? "bg-ok-soft text-ok" : "bg-surface-2 text-faint"
                    )}
                  >
                    <Power size={12} /> {t.ativo ? "Ativa" : "Inativa"}
                  </button>
                </div>
                <p className="mt-3 rounded-xl bg-surface-2/60 p-3 text-[12.5px] italic text-muted">"{t.texto}"</p>
              </div>
            </Card>
          ))}
        </div>
      )}

      {tab === "campanhas" && (
        <div className="space-y-4">
          <Card>
            <div className="flex items-center justify-between p-5">
              <CardHeader title="Campanhas de WhatsApp" subtitle="Disparos segmentados para a base" />
              <Button size="sm" onClick={() => toast.success("Campanha criada", "Configure público e mensagem.")}><Megaphone size={14} /> Nova campanha</Button>
            </div>
            <table className="w-full text-left text-[13px]">
              <thead>
                <tr className="border-y border-line bg-surface-2/50 text-[11px] font-semibold uppercase text-faint">
                  <th className="px-5 py-3">Campanha</th>
                  <th className="px-3 py-3">Público</th>
                  <th className="px-3 py-3 text-right">Enviados</th>
                  <th className="px-3 py-3 text-right">Respostas</th>
                  <th className="px-3 py-3 text-right">Agendamentos</th>
                  <th className="px-3 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {CAMPAIGNS.map((c) => (
                  <tr key={c.id} className="hover:bg-surface-2/60">
                    <td className="px-5 py-3 font-medium text-ink">{c.nome}<p className="text-[11px] font-normal text-faint">{mediumDate(c.data)}</p></td>
                    <td className="px-3 py-3 text-muted">{c.publico}</td>
                    <td className="px-3 py-3 text-right tabular-nums text-muted">{c.enviados || "—"}</td>
                    <td className="px-3 py-3 text-right tabular-nums text-muted">{c.respostas || "—"}</td>
                    <td className="px-3 py-3 text-right tabular-nums font-semibold text-ink">{c.agendamentos || "—"}</td>
                    <td className="px-3 py-3">
                      <Badge tone={c.status === "enviada" ? "ok" : c.status === "agendada" ? "info" : "neutral"} size="sm">
                        {c.status === "enviada" ? "Enviada" : c.status === "agendada" ? "Agendada" : "Rascunho"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      )}
    </div>
  );
}

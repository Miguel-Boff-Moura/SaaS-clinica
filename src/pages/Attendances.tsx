import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, Play } from "lucide-react";
import { PageHeader, EmptyState } from "@/components/ui/Misc";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { Badge, APPOINTMENT_STATUS } from "@/components/ui/Badge";
import { patientById, procedureById, professionalById, roomById, todayAppointments } from "@/data";
import { age, longDate, time, TODAY } from "@/lib/format";
import { cn } from "@/lib/cn";

export function Attendances() {
  const navigate = useNavigate();
  const list = useMemo(() => todayAppointments().filter((a) => !["cancelado"].includes(a.status)), []);

  const fila = list.filter((a) => ["aguardando", "confirmado"].includes(a.status));
  const andamento = list.filter((a) => a.status === "em_atendimento");
  const concluidos = list.filter((a) => ["concluido", "faltou"].includes(a.status));

  return (
    <div className="fade-in">
      <PageHeader title="Atendimentos" subtitle={`Fila clínica de ${longDate(TODAY).toLowerCase()}`} />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Column title="Em atendimento" count={andamento.length} tone="info">
          {andamento.map((a) => <Row key={a.id} a={a} onOpen={() => navigate(`/atendimentos/${a.id}`)} cta="Continuar" />)}
          {andamento.length === 0 && <Empty text="Ninguém em atendimento agora" />}
        </Column>

        <Column title="Aguardando" count={fila.length} tone="warn">
          {fila.map((a) => <Row key={a.id} a={a} onOpen={() => navigate(`/atendimentos/${a.id}`)} cta="Iniciar" />)}
          {fila.length === 0 && <Empty text="Fila vazia" />}
        </Column>

        <Column title="Concluídos hoje" count={concluidos.length} tone="ok">
          {concluidos.map((a) => <Row key={a.id} a={a} onOpen={() => navigate(`/atendimentos/${a.id}`)} cta="Ver" muted />)}
          {concluidos.length === 0 && <Empty text="Nenhum atendimento finalizado" />}
        </Column>
      </div>
    </div>
  );
}

function Column({ title, count, tone, children }: { title: string; count: number; tone: "info" | "warn" | "ok"; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <h2 className="text-[13px] font-semibold text-ink">{title}</h2>
        <Badge tone={tone} size="sm">{count}</Badge>
      </div>
      <div className="space-y-2.5">{children}</div>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <Card><EmptyState className="py-8" title={text} /></Card>;
}

function Row({ a, onOpen, cta, muted }: { a: ReturnType<typeof todayAppointments>[number]; onOpen: () => void; cta: string; muted?: boolean }) {
  const p = patientById(a.pacienteId)!;
  const proc = procedureById(a.procedimentoId)!;
  const pro = professionalById(a.profissionalId)!;
  const room = roomById(a.salaId)!;
  const meta = APPOINTMENT_STATUS[a.status];
  return (
    <Card className={cn(muted && "opacity-70")}>
      <div className="p-4">
        <div className="flex items-center gap-3">
          <Avatar name={p.nome} size="sm" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-semibold text-ink">{p.nome}</p>
            <p className="text-[11px] text-faint">{age(p.nascimento)} anos · {time(a.inicio)} · {room.nome}</p>
          </div>
          <Badge tone={meta.tone} size="sm">{meta.label}</Badge>
        </div>
        <p className="mt-2.5 text-[12px] text-muted">{proc.nome} · {pro.nome}</p>
        <Button size="sm" className="mt-3 w-full" variant={muted ? "secondary" : "primary"} onClick={onOpen}>
          {!muted && <Play size={13} />} {cta} <ChevronRight size={13} />
        </Button>
      </div>
    </Card>
  );
}

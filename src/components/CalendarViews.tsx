import { Card } from "@/components/ui/Card";
import { Badge, APPOINTMENT_STATUS } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { EmptyState } from "@/components/ui/Misc";
import type { AppointmentView } from "@/components/AppointmentDetail";
import { colorForId } from "@/lib/color";
import { addDays, sameDay, startOfWeek, time } from "@/lib/format";
import { cn } from "@/lib/cn";

export const WEEKDAYS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

export interface CalendarLookups {
  patientMap: Map<string, { id: string; nome: string; telefone: string }>;
  professionalMap: Map<string, { id: string; nome: string }>;
  procedureMap: Map<string, { id: string; nome: string; duracao_min: number }>;
  roomMap: Map<string, { id: string; nome: string }>;
}

/* ---- Visão Dia ------------------------------------------------------- */
export function DayView({
  date,
  appts,
  onOpen,
  patientMap,
  professionalMap,
  procedureMap,
  roomMap,
}: { date: Date; appts: AppointmentView[]; onOpen: (id: string) => void } & CalendarLookups) {
  const list = appts.filter((a) => sameDay(a.inicio, date)).sort((a, b) => +a.inicio - +b.inicio);
  if (!list.length)
    return (
      <Card>
        <EmptyState title="Nenhum agendamento neste dia" description="Ajuste os filtros ou crie um novo agendamento." />
      </Card>
    );

  return (
    <Card>
      <div className="divide-y divide-line">
        {list.map((a) => {
          const p = patientMap.get(a.pacienteId);
          const proc = procedureMap.get(a.procedimentoId);
          const pro = professionalMap.get(a.profissionalId);
          const room = roomMap.get(a.salaId);
          const meta = APPOINTMENT_STATUS[a.status];
          const dim = a.status === "cancelado" || a.status === "faltou";
          return (
            <button
              key={a.id}
              onClick={() => onOpen(a.id)}
              className={cn(
                "focusable flex w-full items-center gap-4 px-5 py-3.5 text-left transition-colors hover:bg-surface-2",
                dim && "opacity-55"
              )}
            >
              <div className="w-16 shrink-0">
                <p className="text-[13px] font-semibold tabular-nums text-ink">{time(a.inicio)}</p>
                <p className="text-[11px] text-faint">{time(a.fim)}</p>
              </div>
              <span className="h-10 w-1 shrink-0 rounded-full" style={{ background: colorForId(a.profissionalId) }} />
              <Avatar name={p?.nome ?? "?"} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13.5px] font-medium text-ink">{p?.nome ?? "Paciente removido"}</p>
                <p className="truncate text-[12px] text-muted">{proc?.nome} · {a.tipo}</p>
              </div>
              <div className="hidden text-right sm:block">
                <p className="text-[12px] font-medium text-ink">{pro?.nome}</p>
                <p className="text-[11px] text-faint">{room?.nome}</p>
              </div>
              <Badge tone={meta.tone} size="sm">{meta.label}</Badge>
            </button>
          );
        })}
      </div>
    </Card>
  );
}

/* ---- Visão Semana -------------------------------------------------- */
export function WeekView({
  anchor,
  now,
  appts,
  onOpen,
  patientMap,
}: { anchor: Date; now: Date; appts: AppointmentView[]; onOpen: (id: string) => void } & CalendarLookups) {
  const start = startOfWeek(anchor);
  const days = Array.from({ length: 7 }, (_, i) => addDays(start, i));
  return (
    <Card className="overflow-hidden">
      <div className="grid grid-cols-7 divide-x divide-line">
        {days.map((d, i) => {
          const list = appts.filter((a) => sameDay(a.inicio, d)).sort((a, b) => +a.inicio - +b.inicio);
          const isToday = sameDay(d, now);
          return (
            <div key={i} className="min-h-[420px]">
              <div className={cn("border-b border-line px-2.5 py-2 text-center", isToday && "bg-primary-soft/50")}>
                <p className="text-[11px] font-medium uppercase text-faint">{WEEKDAYS[i]}</p>
                <p className={cn("text-[15px] font-semibold", isToday ? "text-primary-ink" : "text-ink")}>{d.getDate()}</p>
              </div>
              <div className="space-y-1.5 p-1.5">
                {list.map((a) => {
                  const p = patientMap.get(a.pacienteId);
                  const meta = APPOINTMENT_STATUS[a.status];
                  const dim = a.status === "cancelado" || a.status === "faltou";
                  return (
                    <button
                      key={a.id}
                      onClick={() => onOpen(a.id)}
                      className={cn(
                        "focusable w-full rounded-lg border-l-[3px] bg-surface-2 px-2 py-1.5 text-left transition hover:bg-surface-3",
                        dim && "opacity-55 line-through"
                      )}
                      style={{ borderColor: colorForId(a.profissionalId) }}
                    >
                      <p className="text-[11px] font-semibold tabular-nums text-ink">{time(a.inicio)}</p>
                      <p className="truncate text-[11px] text-muted">{(p?.nome ?? "?").split(" ")[0]}</p>
                      <Badge tone={meta.tone} size="sm" className="mt-1 px-1.5 py-0 text-[9px]">{meta.label}</Badge>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

/* ---- Visão Mês --------------------------------------------------- */
export function MonthView({
  anchor,
  now,
  appts,
  onPickDay,
  patientMap,
}: { anchor: Date; now: Date; appts: AppointmentView[]; onPickDay: (d: Date) => void } & CalendarLookups) {
  const first = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
  const gridStart = startOfWeek(first);
  const cells = Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));
  return (
    <Card className="overflow-hidden">
      <div className="grid grid-cols-7 border-b border-line bg-surface-2/60 text-center text-[11px] font-semibold uppercase text-faint">
        {WEEKDAYS.map((w) => (
          <div key={w} className="py-2">{w}</div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {cells.map((d, i) => {
          const inMonth = d.getMonth() === anchor.getMonth();
          const list = appts.filter((a) => sameDay(a.inicio, d));
          const isToday = sameDay(d, now);
          return (
            <button
              key={i}
              onClick={() => onPickDay(d)}
              className={cn(
                "focusable min-h-[92px] border-b border-r border-line p-1.5 text-left transition-colors hover:bg-surface-2",
                !inMonth && "bg-surface-2/40 text-faint"
              )}
            >
              <span
                className={cn(
                  "inline-flex size-6 items-center justify-center rounded-full text-[12px] font-semibold",
                  isToday ? "bg-primary text-white" : inMonth ? "text-ink" : "text-faint"
                )}
              >
                {d.getDate()}
              </span>
              <div className="mt-1 space-y-0.5">
                {list.slice(0, 3).map((a) => (
                  <p key={a.id} className="flex items-center gap-1 truncate text-[10.5px] text-muted">
                    <span className="size-1.5 shrink-0 rounded-full" style={{ background: colorForId(a.profissionalId) }} />
                    {time(a.inicio)} {(patientMap.get(a.pacienteId)?.nome ?? "?").split(" ")[0]}
                  </p>
                ))}
                {list.length > 3 && <p className="text-[10.5px] font-medium text-primary-ink">+{list.length - 3}</p>}
              </div>
            </button>
          );
        })}
      </div>
    </Card>
  );
}

import {
  CalendarClock,
  FileText,
  MessageCircle,
  Package,
  Receipt,
  RotateCcw,
  Stethoscope,
  StickyNote,
  Syringe,
  type LucideIcon,
} from "lucide-react";
import type { TimelineEvent, TimelineKind } from "@/types";
import { currency, fullDate } from "@/lib/format";

const META: Record<TimelineKind, { icon: LucideIcon; tone: string }> = {
  consulta: { icon: Stethoscope, tone: "bg-info-soft text-info" },
  procedimento: { icon: Syringe, tone: "bg-primary-soft text-primary-ink" },
  pagamento: { icon: Receipt, tone: "bg-ok-soft text-ok" },
  orcamento: { icon: FileText, tone: "bg-violet-soft text-violet" },
  mensagem: { icon: MessageCircle, tone: "bg-surface-2 text-muted" },
  retorno: { icon: RotateCcw, tone: "bg-warn-soft text-warn" },
  anamnese: { icon: StickyNote, tone: "bg-surface-2 text-muted" },
  pacote: { icon: Package, tone: "bg-primary-soft text-primary-ink" },
  nota: { icon: CalendarClock, tone: "bg-surface-2 text-muted" },
};

export function TimelineFeed({ events }: { events: TimelineEvent[] }) {
  if (!events.length) return <p className="py-6 text-center text-[13px] text-muted">Nenhum registro ainda.</p>;
  return (
    <ol className="relative">
      {events.map((e, i) => {
        const m = META[e.kind];
        const Icon = m.icon;
        return (
          <li key={e.id} className="relative flex gap-3.5 pb-5 last:pb-0">
            <div className="flex flex-col items-center">
              <span className={`z-10 flex size-8 items-center justify-center rounded-full ${m.tone}`}>
                <Icon size={15} />
              </span>
              {i < events.length - 1 && <span className="w-px flex-1 bg-line" />}
            </div>
            <div className="min-w-0 flex-1 pt-1">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                <p className="text-[13px] font-medium text-ink">{e.titulo}</p>
                <p className="text-[11px] text-faint">{fullDate(e.data)}</p>
              </div>
              {e.descricao && <p className="mt-0.5 text-[12px] text-muted">{e.descricao}</p>}
              <div className="mt-0.5 flex gap-3 text-[11px] text-faint">
                {e.profissional && <span>{e.profissional}</span>}
                {typeof e.valor === "number" && e.valor > 0 && <span className="font-medium text-ok">{currency(e.valor)}</span>}
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

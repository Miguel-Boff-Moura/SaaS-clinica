import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export type Tone =
  | "neutral"
  | "primary"
  | "ok"
  | "warn"
  | "danger"
  | "info"
  | "violet"
  | "accent";

const TONES: Record<Tone, string> = {
  neutral: "bg-surface-2 text-muted",
  primary: "bg-primary-soft text-primary-ink",
  ok: "bg-ok-soft text-ok",
  warn: "bg-warn-soft text-warn",
  danger: "bg-danger-soft text-danger",
  info: "bg-info-soft text-info",
  violet: "bg-violet-soft text-violet",
  accent: "bg-accent-soft text-accent",
};

export function Badge({
  children,
  tone = "neutral",
  dot,
  className,
  size = "md",
}: {
  children: ReactNode;
  tone?: Tone;
  dot?: boolean;
  className?: string;
  size?: "sm" | "md";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full font-medium",
        size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs",
        TONES[tone],
        className
      )}
    >
      {dot && <span className="size-1.5 rounded-full bg-current opacity-80" />}
      {children}
    </span>
  );
}

/* ---- Registros de status do domínio ---------------------------------- */

export const APPOINTMENT_STATUS: Record<string, { label: string; tone: Tone }> = {
  confirmado: { label: "Confirmado", tone: "ok" },
  aguardando: { label: "Aguardando", tone: "warn" },
  em_atendimento: { label: "Em atendimento", tone: "info" },
  concluido: { label: "Concluído", tone: "neutral" },
  cancelado: { label: "Cancelado", tone: "neutral" },
  faltou: { label: "Faltou", tone: "danger" },
};

export const QUOTE_STATUS: Record<string, { label: string; tone: Tone }> = {
  rascunho: { label: "Rascunho", tone: "neutral" },
  enviado: { label: "Enviado", tone: "info" },
  aprovado: { label: "Aprovado", tone: "ok" },
  recusado: { label: "Recusado", tone: "danger" },
  expirado: { label: "Expirado", tone: "warn" },
};

export const PATIENT_STATUS: Record<string, { label: string; tone: Tone }> = {
  ativo: { label: "Ativo", tone: "ok" },
  inativo: { label: "Inativo", tone: "neutral" },
  lead: { label: "Lead", tone: "violet" },
};

export const RETURN_STATUS: Record<string, { label: string; tone: Tone }> = {
  em_dia: { label: "Em dia", tone: "ok" },
  proximo: { label: "Retorno próximo", tone: "warn" },
  vencido: { label: "Retorno vencido", tone: "danger" },
};

export const BILL_STATUS: Record<string, { label: string; tone: Tone }> = {
  em_dia: { label: "Em dia", tone: "neutral" },
  vence_hoje: { label: "Vence hoje", tone: "warn" },
  atrasado: { label: "Atrasado", tone: "danger" },
  pago: { label: "Pago", tone: "ok" },
  pago_status: { label: "Pago", tone: "ok" },
  pendente: { label: "Pendente", tone: "warn" },
  estornado: { label: "Estornado", tone: "neutral" },
};

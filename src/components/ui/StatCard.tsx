import type { ReactNode } from "react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/cn";
import { Sparkline } from "./Misc";

export function StatCard({
  label,
  value,
  icon,
  delta,
  hint,
  spark,
  className,
}: {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
  delta?: number;
  hint?: string;
  spark?: number[];
  className?: string;
}) {
  const up = (delta ?? 0) >= 0;
  return (
    <div className={cn("card p-4", className)}>
      <div className="flex items-start justify-between">
        {icon && (
          <span className="flex size-9 items-center justify-center rounded-[10px] bg-primary-soft text-primary-ink">
            {icon}
          </span>
        )}
        {typeof delta === "number" && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 text-xs font-semibold",
              up ? "text-ok" : "text-danger"
            )}
          >
            {up ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
            {Math.abs(delta).toLocaleString("pt-BR", { minimumFractionDigits: 1 })}%
          </span>
        )}
      </div>
      <p className="mt-3 font-display text-[26px] leading-none text-ink">{value}</p>
      <p className="mt-1.5 text-[13px] text-muted">{label}</p>
      {hint && <p className="mt-0.5 text-[11px] text-faint">{hint}</p>}
      {spark && (
        <div className="mt-2">
          <Sparkline data={spark} width={200} height={30} />
        </div>
      )}
    </div>
  );
}

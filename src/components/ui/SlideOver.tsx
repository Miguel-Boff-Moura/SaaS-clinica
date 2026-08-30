import type { ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";
import { useEscape } from "./Toast";

export function SlideOver({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  width = "md",
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  subtitle?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  width?: "md" | "lg";
}) {
  useEscape(onClose, open);
  return (
    <div
      className={cn(
        "fixed inset-0 z-50 transition-opacity duration-200",
        open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
      )}
    >
      <div className="absolute inset-0 bg-ink/25" onClick={onClose} />
      <div
        className={cn(
          "absolute right-0 top-0 flex h-full flex-col bg-canvas shadow-[var(--shadow-pop)] transition-transform duration-300 ease-[cubic-bezier(.16,1,.3,1)]",
          width === "lg" ? "w-[min(100vw,720px)]" : "w-[min(100vw,460px)]",
          open ? "translate-x-0" : "translate-x-full"
        )}
        role="dialog"
        aria-modal="true"
      >
        <header className="flex items-start justify-between gap-4 border-b border-line bg-white px-5 py-4">
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-ink">{title}</h2>
            {subtitle && <p className="mt-0.5 text-[13px] text-muted">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="focusable -mr-1 mt-0.5 text-faint hover:text-ink">
            <X size={18} />
          </button>
        </header>
        <div className="scroll-thin flex-1 overflow-y-auto px-5 py-5">{children}</div>
        {footer && <footer className="border-t border-line bg-white px-5 py-3.5">{footer}</footer>}
      </div>
    </div>
  );
}

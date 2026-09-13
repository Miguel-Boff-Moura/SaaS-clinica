import type { ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";
import { useEscape } from "./Toast";

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  size = "md",
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg";
}) {
  useEscape(onClose, open);
  if (!open) return null;
  return (
    <div
      className="fixed inset-y-0 right-0 z-50 flex items-center justify-center p-4"
      style={{ left: "var(--sidebar-w, 0px)" }}
    >
      <div className="absolute inset-0 bg-ink/30 fade-in" onClick={onClose} />
      <div
        className={cn(
          "card rise-in relative flex max-h-[88vh] w-full flex-col overflow-hidden shadow-[var(--shadow-pop)]",
          size === "sm" ? "max-w-sm" : size === "lg" ? "max-w-2xl" : "max-w-lg"
        )}
        role="dialog"
        aria-modal="true"
      >
        <header className="flex items-center justify-between gap-4 border-b border-line px-5 py-4">
          <h2 className="text-base font-semibold text-ink">{title}</h2>
          <button onClick={onClose} className="focusable text-faint hover:text-ink">
            <X size={18} />
          </button>
        </header>
        <div className="scroll-thin flex-1 overflow-y-auto px-5 py-5">{children}</div>
        {footer && <footer className="flex justify-end gap-2 border-t border-line bg-surface-2/50 px-5 py-3.5">{footer}</footer>}
      </div>
    </div>
  );
}

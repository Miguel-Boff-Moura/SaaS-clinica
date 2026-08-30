import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { CheckCircle2, Info, TriangleAlert, X } from "lucide-react";
import { cn } from "@/lib/cn";

type ToastKind = "success" | "info" | "warning";
interface ToastItem {
  id: number;
  kind: ToastKind;
  title: string;
  message?: string;
}
interface ToastCtx {
  push: (t: Omit<ToastItem, "id">) => void;
  success: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
}

const Ctx = createContext<ToastCtx | null>(null);

export function useToast(): ToastCtx {
  const c = useContext(Ctx);
  if (!c) throw new Error("useToast precisa de <ToastProvider>");
  return c;
}

const ICONS = {
  success: CheckCircle2,
  info: Info,
  warning: TriangleAlert,
};
const TONE = {
  success: "text-ok bg-ok-soft",
  info: "text-info bg-info-soft",
  warning: "text-warn bg-warn-soft",
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const push = useCallback((t: Omit<ToastItem, "id">) => {
    const id = Date.now() + Math.random();
    setItems((prev) => [...prev, { ...t, id }]);
    setTimeout(() => setItems((prev) => prev.filter((i) => i.id !== id)), 4200);
  }, []);

  const value: ToastCtx = {
    push,
    success: (title, message) => push({ kind: "success", title, message }),
    info: (title, message) => push({ kind: "info", title, message }),
    warning: (title, message) => push({ kind: "warning", title, message }),
  };

  return (
    <Ctx.Provider value={value}>
      {children}
      <div className="fixed bottom-5 right-5 z-[100] flex w-[min(92vw,360px)] flex-col gap-2">
        {items.map((t) => {
          const Icon = ICONS[t.kind];
          return (
            <div key={t.id} className="card rise-in flex items-start gap-3 p-3.5 shadow-[var(--shadow-pop)]">
              <span className={cn("mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full", TONE[t.kind])}>
                <Icon size={15} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-ink">{t.title}</p>
                {t.message && <p className="mt-0.5 text-xs text-muted">{t.message}</p>}
              </div>
              <button
                onClick={() => setItems((prev) => prev.filter((i) => i.id !== t.id))}
                className="focusable text-faint hover:text-ink"
              >
                <X size={15} />
              </button>
            </div>
          );
        })}
      </div>
    </Ctx.Provider>
  );
}

/** Fecha com ESC — utilitário reaproveitado por modais e slide-overs. */
export function useEscape(onClose: () => void, active = true) {
  useEffect(() => {
    if (!active) return;
    const h = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose, active]);
}

import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  Check,
  ChevronDown,
  CircleHelp,
  Plus,
  Search,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { useClickOutside } from "@/hooks/useClickOutside";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { PATIENTS, UNITS, CLINIC } from "@/data";
import { relativeFromToday } from "@/lib/format";
import { TODAY, addDays } from "@/lib/format";

const NOTIFICATIONS = [
  { id: 1, texto: "Beatriz Lima está com pagamento em atraso (R$ 2.600)", quando: addDays(TODAY, 0), tone: "danger" as const },
  { id: 2, texto: "3 produtos abaixo do estoque mínimo", quando: addDays(TODAY, 0), tone: "warn" as const },
  { id: 3, texto: "Renata Bittencourt respondeu no WhatsApp", quando: addDays(TODAY, 0), tone: "info" as const },
  { id: 4, texto: "Orçamento #2026-0170 visualizado por Lucas Martins", quando: addDays(TODAY, -1), tone: "info" as const },
  { id: 5, texto: "Campanha 'Reativação inativos' gerou 6 agendamentos", quando: addDays(TODAY, -1), tone: "ok" as const },
];

export function Topbar({ onQuickAction }: { onQuickAction: () => void }) {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [unitOpen, setUnitOpen] = useState(false);
  const [unit, setUnit] = useState(UNITS[0]);

  const searchRef = useClickOutside<HTMLDivElement>(() => setSearchOpen(false));
  const notifRef = useClickOutside<HTMLDivElement>(() => setNotifOpen(false));
  const unitRef = useClickOutside<HTMLDivElement>(() => setUnitOpen(false));

  const results = useMemo(() => {
    if (!q.trim()) return [];
    const t = q.toLowerCase();
    return PATIENTS.filter((p) => p.nome.toLowerCase().includes(t) || p.telefone.includes(t)).slice(0, 6);
  }, [q]);

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-line bg-canvas/85 px-6 backdrop-blur">
      {/* Busca global */}
      <div ref={searchRef} className="relative w-full max-w-md">
        <div className="flex items-center gap-2 rounded-[10px] border border-line bg-white px-3 py-2">
          <Search size={16} className="text-faint" />
          <input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setSearchOpen(true);
            }}
            onFocus={() => setSearchOpen(true)}
            placeholder="Buscar paciente, telefone, orçamento…"
            className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-faint"
          />
          <kbd className="hidden rounded border border-line bg-surface-2 px-1.5 text-[10px] text-faint sm:block">
            Ctrl K
          </kbd>
        </div>
        {searchOpen && q.trim() && (
          <div className="card absolute mt-1.5 w-full overflow-hidden p-1.5 shadow-[var(--shadow-pop)]">
            {results.length === 0 ? (
              <p className="px-3 py-4 text-center text-[13px] text-muted">Nenhum paciente encontrado.</p>
            ) : (
              results.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    navigate(`/pacientes/${p.id}`);
                    setSearchOpen(false);
                    setQ("");
                  }}
                  className="focusable flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left hover:bg-surface-2"
                >
                  <Avatar name={p.nome} size="xs" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-medium text-ink">{p.nome}</span>
                    <span className="block truncate text-[11px] text-faint">{p.telefone}</span>
                  </span>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      <div className="ml-auto flex items-center gap-2">
        <Button size="sm" onClick={onQuickAction} className="hidden sm:inline-flex">
          <Plus size={15} /> Ação rápida
        </Button>

        {/* Unidade / clínica */}
        <div ref={unitRef} className="relative">
          <button
            onClick={() => setUnitOpen((v) => !v)}
            className="focusable flex items-center gap-2 rounded-[10px] border border-line bg-white px-3 py-2 text-[13px] font-medium text-ink hover:bg-surface-2"
          >
            <span className="size-2 rounded-full bg-primary" />
            <span className="hidden max-w-[130px] truncate md:block">{unit.nome}</span>
            <ChevronDown size={14} className="text-faint" />
          </button>
          {unitOpen && (
            <div className="card absolute right-0 mt-1.5 w-64 overflow-hidden p-1.5 shadow-[var(--shadow-pop)]">
              <p className="px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-faint">
                {CLINIC.nome} · unidades
              </p>
              {UNITS.map((u) => (
                <button
                  key={u.id}
                  onClick={() => {
                    setUnit(u);
                    setUnitOpen(false);
                  }}
                  className="focusable flex w-full items-start gap-2 rounded-lg px-2.5 py-2 text-left hover:bg-surface-2"
                >
                  <Check size={14} className={cn("mt-0.5 shrink-0", u.id === unit.id ? "text-primary" : "opacity-0")} />
                  <span>
                    <span className="block text-[13px] font-medium text-ink">{u.nome}</span>
                    <span className="block text-[11px] text-faint">{u.endereco}</span>
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notificações */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => setNotifOpen((v) => !v)}
            className="focusable relative flex size-10 items-center justify-center rounded-full border border-line bg-white text-muted hover:bg-surface-2"
          >
            <Bell size={17} />
            <span className="absolute right-2.5 top-2.5 size-2 rounded-full bg-danger ring-2 ring-white" />
          </button>
          {notifOpen && (
            <div className="card absolute right-0 mt-1.5 w-80 overflow-hidden shadow-[var(--shadow-pop)]">
              <div className="flex items-center justify-between border-b border-line px-4 py-3">
                <p className="text-[13px] font-semibold text-ink">Notificações</p>
                <button className="text-[11px] font-medium text-primary-ink hover:underline">Marcar como lidas</button>
              </div>
              <ul className="max-h-80 divide-y divide-line overflow-y-auto scroll-thin">
                {NOTIFICATIONS.map((n) => (
                  <li key={n.id} className="flex gap-2.5 px-4 py-3">
                    <span
                      className={cn(
                        "mt-1 size-2 shrink-0 rounded-full",
                        n.tone === "danger" && "bg-danger",
                        n.tone === "warn" && "bg-warn",
                        n.tone === "info" && "bg-info",
                        n.tone === "ok" && "bg-ok"
                      )}
                    />
                    <div className="min-w-0">
                      <p className="text-[13px] leading-snug text-ink">{n.texto}</p>
                      <p className="mt-0.5 text-[11px] text-faint">{relativeFromToday(n.quando)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <button className="focusable hidden size-10 items-center justify-center rounded-full border border-line bg-white text-muted hover:bg-surface-2 lg:flex">
          <CircleHelp size={17} />
        </button>

        {/* Perfil */}
        <button className="focusable flex items-center gap-2 rounded-full py-1 pl-1 pr-2.5 hover:bg-surface-2">
          <Avatar name="Dra. Mariana Costa" size="sm" color="#0F766E" />
          <span className="hidden text-left leading-tight lg:block">
            <span className="block text-[13px] font-semibold text-ink">Dra. Mariana Costa</span>
            <span className="block text-[11px] text-faint">Administradora</span>
          </span>
          <ChevronDown size={14} className="hidden text-faint lg:block" />
        </button>
      </div>
    </header>
  );
}

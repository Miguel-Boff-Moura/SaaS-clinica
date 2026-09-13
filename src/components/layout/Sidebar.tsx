import { NavLink } from "react-router-dom";
import { PanelLeftClose, PanelLeftOpen, Sparkles } from "lucide-react";
import { cn } from "@/lib/cn";
import { NAV } from "./nav";
import { CLINIC } from "@/data";
import { useAuth } from "@/lib/auth";

export function Sidebar({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  const { profile } = useAuth();
  const items = profile?.role === "admin" ? NAV : NAV.filter((i) => i.to === "/agenda");

  return (
    <aside
      className={cn(
        "sticky top-0 z-30 flex h-screen shrink-0 flex-col border-r border-line bg-white transition-[width] duration-200",
        collapsed ? "w-[72px]" : "w-[240px]"
      )}
    >
      <div className={cn("flex items-center gap-2.5 px-4 py-5", collapsed && "justify-center px-0")}>
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary text-white">
          <Sparkles size={18} />
        </span>
        {!collapsed && (
          <div className="leading-tight">
            <p className="font-display text-[15px] text-ink">{CLINIC.nome}</p>
            <p className="text-[11px] text-faint">Gestão &amp; CRM</p>
          </div>
        )}
      </div>

      <nav className="scroll-thin flex-1 overflow-y-auto px-3 pb-4 pt-1">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            title={item.label}
            className={({ isActive }) =>
              cn(
                "focusable mb-0.5 flex items-center gap-3 rounded-[10px] px-3 py-2 text-[13.5px] font-medium transition-colors",
                collapsed && "justify-center px-0",
                isActive
                  ? "bg-primary text-white"
                  : "text-muted hover:bg-primary-soft hover:text-primary-ink"
              )
            }
          >
            <item.icon size={18} className="shrink-0" />
            {!collapsed && <span className="truncate">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-line p-3">
        <button
          onClick={onToggle}
          className="focusable flex w-full items-center justify-center gap-2 rounded-lg py-2 text-xs font-medium text-muted hover:bg-surface-2"
        >
          {collapsed ? <PanelLeftOpen size={16} /> : <><PanelLeftClose size={16} /> Recolher menu</>}
        </button>
      </div>
    </aside>
  );
}

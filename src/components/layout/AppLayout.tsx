import { useEffect, useState, type CSSProperties } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { Modal } from "@/components/ui/Modal";
import { QuickActionGrid } from "@/components/QuickActions";

const KEY = "aurora.sidebar.collapsed";

export function AppLayout() {
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(KEY) === "1";
    } catch {
      return false;
    }
  });
  const [quickOpen, setQuickOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    try {
      localStorage.setItem(KEY, collapsed ? "1" : "0");
    } catch {
      /* ambiente sem storage */
    }
  }, [collapsed]);

  // rola para o topo ao trocar de rota
  useEffect(() => {
    document.getElementById("main-scroll")?.scrollTo({ top: 0 });
  }, [pathname]);

  return (
    <div
      className="flex min-h-screen bg-canvas"
      style={{ "--sidebar-w": collapsed ? "72px" : "240px" } as CSSProperties}
    >
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onQuickAction={() => setQuickOpen(true)} />
        <main id="main-scroll" className="scroll-thin flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-[1360px] px-6 py-7">
            <Outlet />
          </div>
        </main>
      </div>

      <Modal open={quickOpen} onClose={() => setQuickOpen(false)} title="Ações rápidas" size="lg">
        <p className="mb-4 text-[13px] text-muted">
          Atalhos para os fluxos mais frequentes da recepção e do consultório.
        </p>
        <QuickActionGrid columns={3} onRun={() => setQuickOpen(false)} />
      </Modal>
    </div>
  );
}

import type { ReactNode } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Login } from "@/pages/Login";
import { useAuth } from "@/lib/auth";
import { Dashboard } from "@/pages/Dashboard";
import { Agenda } from "@/pages/Agenda";
import { Patients } from "@/pages/Patients";
import { PatientProfile } from "@/pages/PatientProfile";
import { CRM } from "@/pages/CRM";
import { Attendances } from "@/pages/Attendances";
import { AttendanceWorkspace } from "@/pages/AttendanceWorkspace";
import { Records } from "@/pages/Records";
import { Procedures } from "@/pages/Procedures";
import { Packages } from "@/pages/Packages";
import { Sales } from "@/pages/Sales";
import { Finance } from "@/pages/Finance";
import { Inventory } from "@/pages/Inventory";
import { Reports } from "@/pages/Reports";
import { Communication } from "@/pages/Communication";
import { Settings } from "@/pages/Settings";

function RequireAuth({ children }: { children: ReactNode }) {
  const { session, profile, loading, profileLoading } = useAuth();
  const location = useLocation();

  if (loading || profileLoading) return null;
  if (!session) return <Navigate to="/login" state={{ from: location.pathname }} replace />;

  // Paciente usa o mesmo layout, mas só acessa a própria agenda —
  // qualquer outra rota redireciona pra lá.
  if (profile?.role !== "admin" && location.pathname !== "/agenda") {
    return <Navigate to="/agenda" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        element={
          <RequireAuth>
            <AppLayout />
          </RequireAuth>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="agenda" element={<Agenda />} />
        <Route path="pacientes" element={<Patients />} />
        <Route path="pacientes/:id" element={<PatientProfile />} />
        <Route path="crm" element={<CRM />} />
        <Route path="atendimentos" element={<Attendances />} />
        <Route path="atendimentos/:id" element={<AttendanceWorkspace />} />
        <Route path="prontuarios" element={<Records />} />
        <Route path="procedimentos" element={<Procedures />} />
        <Route path="pacotes" element={<Packages />} />
        <Route path="vendas" element={<Sales />} />
        <Route path="financeiro" element={<Finance />} />
        <Route path="estoque" element={<Inventory />} />
        <Route path="relatorios" element={<Reports />} />
        <Route path="comunicacao" element={<Communication />} />
        <Route path="configuracoes" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

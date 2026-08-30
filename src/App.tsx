import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
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

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
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

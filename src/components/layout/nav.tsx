import {
  LayoutDashboard,
  CalendarDays,
  Users,
  KanbanSquare,
  Stethoscope,
  ClipboardList,
  Syringe,
  Layers,
  ReceiptText,
  Wallet,
  Boxes,
  BarChart3,
  MessagesSquare,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  group: "Operação" | "Clínico" | "Comercial" | "Gestão";
  end?: boolean;
}

export const NAV: NavItem[] = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, group: "Operação", end: true },
  { to: "/agenda", label: "Agenda", icon: CalendarDays, group: "Operação" },
  { to: "/pacientes", label: "Pacientes", icon: Users, group: "Operação" },
  { to: "/crm", label: "CRM", icon: KanbanSquare, group: "Comercial" },
  { to: "/atendimentos", label: "Atendimentos", icon: Stethoscope, group: "Clínico" },
  { to: "/prontuarios", label: "Prontuários", icon: ClipboardList, group: "Clínico" },
  { to: "/procedimentos", label: "Procedimentos", icon: Syringe, group: "Clínico" },
  { to: "/pacotes", label: "Pacotes", icon: Layers, group: "Comercial" },
  { to: "/vendas", label: "Vendas & Orçamentos", icon: ReceiptText, group: "Comercial" },
  { to: "/financeiro", label: "Financeiro", icon: Wallet, group: "Gestão" },
  { to: "/estoque", label: "Estoque", icon: Boxes, group: "Gestão" },
  { to: "/relatorios", label: "Relatórios", icon: BarChart3, group: "Gestão" },
  { to: "/comunicacao", label: "Comunicação", icon: MessagesSquare, group: "Comercial" },
  { to: "/configuracoes", label: "Configurações", icon: Settings, group: "Gestão" },
];

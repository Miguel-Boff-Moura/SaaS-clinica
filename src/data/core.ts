import type { Professional, Room, Unit, User, RolePermission } from "@/types";
import { addDays } from "@/lib/format";
import { TODAY } from "@/lib/format";

export const CLINIC = {
  nome: "Clínica Aurora",
  slogan: "Dermatologia & Estética Avançada",
  cnpj: "42.113.908/0001-55",
  responsavel: "Dra. Mariana Costa",
  telefone: "(51) 3221-8080",
  email: "contato@clinicaaurora.com.br",
};

export const UNITS: Unit[] = [
  { id: "u1", nome: "Aurora · Moinhos", endereco: "R. Padre Chagas, 240 — Porto Alegre/RS" },
  { id: "u2", nome: "Aurora · Zona Sul", endereco: "Av. Wenceslau Escobar, 1820 — Porto Alegre/RS" },
];

export const ROOMS: Room[] = [
  { id: "r1", nome: "Consultório 1", tipo: "Consultório" },
  { id: "r2", nome: "Consultório 2", tipo: "Consultório" },
  { id: "r3", nome: "Sala de Procedimentos", tipo: "Sala de procedimentos" },
  { id: "r4", nome: "Sala de Laser", tipo: "Sala de laser" },
];

export const PROFESSIONALS: Professional[] = [
  {
    id: "pro1",
    nome: "Dra. Mariana Costa",
    especialidade: "Dermatologia",
    conselho: "CRM/RS 38.114",
    cor: "#0F766E",
    avatarBg: "#0F766E",
    procedimentos: ["pc1", "pc2", "pc5", "pc6", "pc7", "pc8"],
  },
  {
    id: "pro2",
    nome: "Dr. Rafael Mendes",
    especialidade: "Cirurgia Dermatológica",
    conselho: "CRM/RS 41.907",
    cor: "#2563EB",
    avatarBg: "#2563EB",
    procedimentos: ["pc1", "pc2", "pc6", "pc7", "pc9"],
  },
  {
    id: "pro3",
    nome: "Dra. Camila Alves",
    especialidade: "Esteticista / Biomédica",
    conselho: "CRBM/RS 9.320",
    cor: "#7C3AED",
    avatarBg: "#7C3AED",
    procedimentos: ["pc3", "pc4", "pc5", "pc10"],
  },
];

export function professionalById(id: string): Professional | undefined {
  return PROFESSIONALS.find((p) => p.id === id);
}
export function roomById(id: string): Room | undefined {
  return ROOMS.find((r) => r.id === id);
}

export const USERS: User[] = [
  { id: "us1", nome: "Dra. Mariana Costa", email: "mariana@clinicaaurora.com.br", papel: "Administrador", ativo: true, ultimoAcesso: addDays(TODAY, 0) },
  { id: "us2", nome: "Dr. Rafael Mendes", email: "rafael@clinicaaurora.com.br", papel: "Profissional", ativo: true, ultimoAcesso: addDays(TODAY, -1) },
  { id: "us3", nome: "Dra. Camila Alves", email: "camila@clinicaaurora.com.br", papel: "Profissional", ativo: true, ultimoAcesso: addDays(TODAY, 0) },
  { id: "us4", nome: "Juliana Prado", email: "recepcao@clinicaaurora.com.br", papel: "Recepção", ativo: true, ultimoAcesso: addDays(TODAY, 0) },
  { id: "us5", nome: "André Lima", email: "financeiro@clinicaaurora.com.br", papel: "Financeiro", ativo: true, ultimoAcesso: addDays(TODAY, -2) },
  { id: "us6", nome: "Patrícia Nunes", email: "gerencia@clinicaaurora.com.br", papel: "Gerente", ativo: false, ultimoAcesso: addDays(TODAY, -19) },
];

const MODULES = [
  "Dashboard",
  "Agenda",
  "Pacientes",
  "Prontuário",
  "Financeiro",
  "Estoque",
  "Relatórios",
  "Configurações",
];

export const ROLE_PERMISSIONS: RolePermission[] = [
  {
    papel: "Administrador",
    descricao: "Acesso completo a todos os módulos e configurações.",
    modulos: MODULES.map((m) => ({ modulo: m, acesso: "total" })),
  },
  {
    papel: "Gerente",
    descricao: "Gestão operacional e financeira, sem alterar configurações críticas.",
    modulos: MODULES.map((m) => ({
      modulo: m,
      acesso: m === "Configurações" ? "leitura" : "total",
    })),
  },
  {
    papel: "Profissional",
    descricao: "Agenda própria, prontuário e histórico clínico dos pacientes.",
    modulos: MODULES.map((m) => ({
      modulo: m,
      acesso:
        m === "Agenda" || m === "Pacientes" || m === "Prontuário" || m === "Dashboard"
          ? "total"
          : m === "Financeiro" || m === "Relatórios"
          ? "leitura"
          : "nenhum",
    })),
  },
  {
    papel: "Recepção",
    descricao: "Agendamento, cadastro de pacientes e confirmações.",
    modulos: MODULES.map((m) => ({
      modulo: m,
      acesso:
        m === "Agenda" || m === "Pacientes"
          ? "total"
          : m === "Dashboard" || m === "Financeiro"
          ? "leitura"
          : "nenhum",
    })),
  },
  {
    papel: "Financeiro",
    descricao: "Contas, comissões, transações e relatórios financeiros.",
    modulos: MODULES.map((m) => ({
      modulo: m,
      acesso:
        m === "Financeiro" || m === "Relatórios"
          ? "total"
          : m === "Dashboard" || m === "Estoque"
          ? "leitura"
          : "nenhum",
    })),
  },
];

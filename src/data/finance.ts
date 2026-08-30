import type { Transaction, Receivable, Payable, Commission } from "@/types";
import { TODAY, addDays } from "@/lib/format";

let t = 0;
const tid = () => `tx${++t}`;

export const TRANSACTIONS: Transaction[] = [
  { id: tid(), data: addDays(TODAY, 0), descricao: "Preenchimento labial — Marina Souza", categoria: "Injetáveis", tipo: "receita", valor: 2100, forma: "Cartão de crédito", profissional: "Dra. Mariana Costa", status: "confirmado" },
  { id: tid(), data: addDays(TODAY, 0), descricao: "Limpeza de pele — Camila Ferreira", categoria: "Estética facial", tipo: "receita", valor: 0, profissional: "Dra. Camila Alves", status: "confirmado" },
  { id: tid(), data: addDays(TODAY, 0), descricao: "Microagulhamento — Ana Beatriz", categoria: "Estética facial", tipo: "receita", valor: 620, forma: "Pix", profissional: "Dra. Camila Alves", status: "confirmado" },
  { id: tid(), data: addDays(TODAY, 0), descricao: "Venda — Sérum vitamina C", categoria: "Produtos", tipo: "receita", valor: 210, forma: "Cartão de débito", status: "confirmado" },
  { id: tid(), data: addDays(TODAY, -1), descricao: "Consulta dermatológica — João P.", categoria: "Consulta", tipo: "receita", valor: 450, forma: "Pix", profissional: "Dr. Rafael Mendes", status: "confirmado" },
  { id: tid(), data: addDays(TODAY, -1), descricao: "Toxina botulínica — Helena R.", categoria: "Injetáveis", tipo: "receita", valor: 1350, forma: "Cartão de crédito", profissional: "Dra. Mariana Costa", status: "confirmado" },
  { id: tid(), data: addDays(TODAY, -2), descricao: "Aluguel — Unidade Moinhos", categoria: "Ocupação", tipo: "despesa", valor: 8200, forma: "Boleto", status: "confirmado" },
  { id: tid(), data: addDays(TODAY, -2), descricao: "Pacote Facial Premium — Juliana M.", categoria: "Pacotes", tipo: "receita", valor: 2490, forma: "Cartão de crédito", profissional: "Dra. Camila Alves", status: "confirmado" },
  { id: tid(), data: addDays(TODAY, -3), descricao: "Compra toxina botulínica (10un)", categoria: "Insumos", tipo: "despesa", valor: 6200, forma: "Boleto", status: "confirmado" },
  { id: tid(), data: addDays(TODAY, -3), descricao: "Bioestimulador — Beatriz Lima", categoria: "Injetáveis", tipo: "receita", valor: 2600, profissional: "Dra. Mariana Costa", status: "pendente" },
  { id: tid(), data: addDays(TODAY, -4), descricao: "Laser CO2 — Patrícia G.", categoria: "Laser", tipo: "receita", valor: 1800, forma: "Cartão de crédito", profissional: "Dra. Mariana Costa", status: "confirmado" },
  { id: tid(), data: addDays(TODAY, -4), descricao: "Marketing — tráfego pago (agosto)", categoria: "Marketing", tipo: "despesa", valor: 3400, forma: "Cartão de crédito", status: "confirmado" },
  { id: tid(), data: addDays(TODAY, -5), descricao: "Folha — recepção e limpeza", categoria: "Pessoal", tipo: "despesa", valor: 7600, forma: "Pix", status: "confirmado" },
  { id: tid(), data: addDays(TODAY, -6), descricao: "Depilação a laser (pacote) — Sofia A.", categoria: "Pacotes", tipo: "receita", valor: 1990, forma: "Cartão de crédito", profissional: "Dr. Rafael Mendes", status: "confirmado" },
  { id: tid(), data: addDays(TODAY, -7), descricao: "Peeling químico — Ana Paula", categoria: "Estética facial", tipo: "receita", valor: 480, forma: "Pix", profissional: "Dra. Camila Alves", status: "confirmado" },
  { id: tid(), data: addDays(TODAY, -8), descricao: "Software e sistemas", categoria: "Administrativo", tipo: "despesa", valor: 890, forma: "Cartão de crédito", status: "confirmado" },
];

export const RECEIVABLES: Receivable[] = [
  { id: "rc1", paciente: "Beatriz Lima", descricao: "Bioestimulador de colágeno", vencimento: addDays(TODAY, -1), valor: 2600, status: "atrasado" },
  { id: "rc2", paciente: "Marina Souza", descricao: "Retorno preenchimento + retoque", vencimento: addDays(TODAY, 0), valor: 400, status: "vence_hoje" },
  { id: "rc3", paciente: "Helena Ribeiro", descricao: "Parcela 2/3 — Bioestimulador", vencimento: addDays(TODAY, 4), valor: 866, status: "em_dia" },
  { id: "rc4", paciente: "Juliana Mattos", descricao: "Parcela 3/6 — Pacote Facial Premium", vencimento: addDays(TODAY, 9), valor: 415, status: "em_dia" },
  { id: "rc5", paciente: "Carlos Andrade", descricao: "Laser CO2 fracionado", vencimento: addDays(TODAY, -6), valor: 1800, status: "atrasado" },
  { id: "rc6", paciente: "Sofia Araújo", descricao: "Parcela 4/10 — Full Body Laser", vencimento: addDays(TODAY, 12), valor: 199, status: "em_dia" },
];

export const PAYABLES: Payable[] = [
  { id: "py1", fornecedor: "Galderma", descricao: "Bioestimulador (5 frascos)", vencimento: addDays(TODAY, 3), valor: 6000, categoria: "Insumos", status: "em_dia" },
  { id: "py2", fornecedor: "Imobiliária Central", descricao: "Aluguel Unidade Zona Sul", vencimento: addDays(TODAY, 0), valor: 5400, categoria: "Ocupação", status: "vence_hoje" },
  { id: "py3", fornecedor: "Meta Ads", descricao: "Tráfego pago — setembro", vencimento: addDays(TODAY, 6), valor: 3500, categoria: "Marketing", status: "em_dia" },
  { id: "py4", fornecedor: "Contabilidade Prisma", descricao: "Honorários contábeis (agosto)", vencimento: addDays(TODAY, -2), valor: 1200, categoria: "Administrativo", status: "atrasado" },
  { id: "py5", fornecedor: "CEEE / Energia", descricao: "Energia elétrica — Moinhos", vencimento: addDays(TODAY, 8), valor: 1450, categoria: "Utilidades", status: "em_dia" },
];

export const COMMISSIONS: Commission[] = [
  { id: "cm1", profissional: "Dra. Mariana Costa", procedimentos: 18, faturado: 32450, percentual: 45, comissao: 14602, status: "aberta" },
  { id: "cm2", profissional: "Dr. Rafael Mendes", procedimentos: 11, faturado: 9860, percentual: 40, comissao: 3944, status: "aberta" },
  { id: "cm3", profissional: "Dra. Camila Alves", procedimentos: 24, faturado: 11280, percentual: 35, comissao: 3948, status: "aberta" },
];

/* ---- séries para gráficos ------------------------------------------------ */
export const REVENUE_SERIES = [
  { mes: "Mar", receita: 68200, despesa: 41200 },
  { mes: "Abr", receita: 72400, despesa: 43800 },
  { mes: "Mai", receita: 70100, despesa: 42100 },
  { mes: "Jun", receita: 81900, despesa: 45200 },
  { mes: "Jul", receita: 88600, despesa: 46700 },
  { mes: "Ago", receita: 92300, despesa: 48100 },
];

export const REVENUE_BY_PROCEDURE = [
  { nome: "Injetáveis", valor: 41200 },
  { nome: "Laser", valor: 18600 },
  { nome: "Estética facial", valor: 15400 },
  { nome: "Pacotes", valor: 12100 },
  { nome: "Consultas", valor: 5000 },
];

export const REVENUE_BY_PROFESSIONAL = [
  { nome: "Dra. Mariana", valor: 32450 },
  { nome: "Dra. Camila", valor: 11280 },
  { nome: "Dr. Rafael", valor: 9860 },
];

export const DAILY_REVENUE_7D = [
  { dia: "Seg", valor: 6200 },
  { dia: "Ter", valor: 8400 },
  { dia: "Qua", valor: 5100 },
  { dia: "Qui", valor: 9800 },
  { dia: "Sex", valor: 11200 },
  { dia: "Sáb", valor: 4930 },
  { dia: "Dom", valor: 0 },
];

/* ============================================================================
   AURORA — MODELO DE DOMÍNIO
   Tipos compartilhados por toda a aplicação. O protótipo é 100% mockado:
   nenhuma chamada de rede, os dados vivem em src/data.
============================================================================ */

export type ID = string;

export type AppointmentStatus =
  | "confirmado"
  | "aguardando"
  | "em_atendimento"
  | "concluido"
  | "cancelado"
  | "faltou";

export type PatientStatus = "ativo" | "inativo" | "lead";

export type Origin =
  | "Instagram"
  | "Indicação"
  | "Google"
  | "Facebook"
  | "Site"
  | "WhatsApp"
  | "Passagem";

export interface Professional {
  id: ID;
  nome: string;
  especialidade: string;
  conselho: string;
  cor: string; // cor de identificação na agenda
  avatarBg: string;
  procedimentos: ID[]; // procedimentos habilitados
}

export interface Room {
  id: ID;
  nome: string;
  tipo: "Consultório" | "Sala de procedimentos" | "Sala de laser";
}

export interface Unit {
  id: ID;
  nome: string;
  endereco: string;
}

export interface Procedure {
  id: ID;
  nome: string;
  categoria: "Consulta" | "Avaliação" | "Estética facial" | "Estética corporal" | "Injetáveis" | "Laser";
  duracaoMin: number;
  preco: number;
  comissaoPct: number;
  salaId: ID;
  materiais: string[];
  retornoDias: number | null; // validade clínica / janela de retorno
}

export interface PackageTemplate {
  id: ID;
  nome: string;
  procedimentoId: ID;
  sessoes: number;
  preco: number;
  validadeDias: number;
}

export interface PatientPackage {
  id: ID;
  templateId: ID;
  nome: string;
  sessoesContratadas: number;
  sessoesUsadas: number;
  valorPago: number;
  compradoEm: Date;
  validadeAte: Date;
  status: "ativo" | "concluido" | "expirado";
}

export type TimelineKind =
  | "consulta"
  | "procedimento"
  | "pagamento"
  | "orcamento"
  | "mensagem"
  | "retorno"
  | "anamnese"
  | "pacote"
  | "nota";

export interface TimelineEvent {
  id: ID;
  kind: TimelineKind;
  data: Date;
  titulo: string;
  descricao?: string;
  valor?: number;
  profissional?: string;
}

export interface ClinicalRecordEntry {
  id: ID;
  data: Date;
  profissional: string;
  tipo: string;
  queixa: string;
  conduta: string;
  prescricao?: string[];
}

export interface AnamnesisAnswer {
  pergunta: string;
  resposta: string;
  alerta?: boolean;
}

export interface PatientProcedureRecord {
  id: ID;
  procedimentoId: ID;
  nome: string;
  data: Date;
  profissional: string;
  valor: number;
  pago: boolean;
  pacoteId?: ID;
  regiao?: string;
  observacao?: string;
}

export interface PatientFinanceEntry {
  id: ID;
  data: Date;
  descricao: string;
  valor: number;
  status: "pago" | "pendente" | "estornado";
  forma?: PaymentMethod;
}

export interface PatientDocument {
  id: ID;
  nome: string;
  tipo: "Receita" | "Termo de consentimento" | "Contrato" | "Atestado" | "Orçamento";
  data: Date;
}

export interface GalleryItem {
  id: ID;
  data: Date;
  regiao: string;
  antes: string; // cor de placeholder
  depois: string;
  nota?: string;
}

export interface Patient {
  id: ID;
  nome: string;
  nascimento: Date;
  telefone: string;
  email: string;
  status: PatientStatus;
  origem: Origin;
  tags: string[];
  desde: Date;
  profissionalId: ID;
  ultimaVisita: Date | null;
  proximoAgendamento: Date | null;
  valorGasto: number;
  alergias: string[];
  observacoesImportantes: string[];
  aniversarioEsteMes: boolean;
  retornoPendente: boolean;
  faltas: number;
  pacotes: PatientPackage[];
  procedimentos: PatientProcedureRecord[];
  financeiro: PatientFinanceEntry[];
  documentos: PatientDocument[];
  galeria: GalleryItem[];
  prontuario: ClinicalRecordEntry[];
  anamnese: AnamnesisAnswer[];
  timeline: TimelineEvent[];
}

export interface Appointment {
  id: ID;
  inicio: Date;
  fim: Date;
  pacienteId: ID;
  profissionalId: ID;
  procedimentoId: ID;
  salaId: ID;
  status: AppointmentStatus;
  tipo: "Consulta" | "Retorno" | "Procedimento" | "Avaliação" | "Sessão de pacote";
  origem: "Agendamento online" | "Recepção" | "WhatsApp" | "Telefone";
  observacao?: string;
}

export type CrmStage =
  | "novo_lead"
  | "contato_realizado"
  | "agendamento"
  | "compareceu"
  | "orcamento"
  | "conversao"
  | "pos_atendimento";

export interface Lead {
  id: ID;
  nome: string;
  telefone: string;
  stage: CrmStage;
  procedimentoInteresse: string;
  origem: Origin;
  valorPotencial: number;
  ultimaInteracao: Date;
  responsavelId: ID;
  proximaAcao: string;
  proximaAcaoData: Date;
  temperatura: "quente" | "morno" | "frio";
  pacienteId?: ID;
}

export type QuoteStatus = "rascunho" | "enviado" | "aprovado" | "recusado" | "expirado";

export interface QuoteItem {
  descricao: string;
  tipo: "Procedimento" | "Produto" | "Pacote";
  qtd: number;
  valorUnit: number;
}

export interface Quote {
  id: ID;
  numero: string;
  pacienteNome: string;
  pacienteId?: ID;
  criadoEm: Date;
  validadeAte: Date;
  status: QuoteStatus;
  itens: QuoteItem[];
  descontoPct: number;
  condicao: string;
  responsavel: string;
}

export type PaymentMethod =
  | "Pix"
  | "Cartão de crédito"
  | "Cartão de débito"
  | "Dinheiro"
  | "Boleto"
  | "Link de pagamento";

export interface Transaction {
  id: ID;
  data: Date;
  descricao: string;
  categoria: string;
  tipo: "receita" | "despesa";
  valor: number;
  forma?: PaymentMethod;
  profissional?: string;
  status: "confirmado" | "pendente";
}

export interface Receivable {
  id: ID;
  paciente: string;
  descricao: string;
  vencimento: Date;
  valor: number;
  status: "em_dia" | "vence_hoje" | "atrasado" | "pago";
}

export interface Payable {
  id: ID;
  fornecedor: string;
  descricao: string;
  vencimento: Date;
  valor: number;
  categoria: string;
  status: "em_dia" | "vence_hoje" | "atrasado" | "pago";
}

export interface Commission {
  id: ID;
  profissional: string;
  procedimentos: number;
  faturado: number;
  percentual: number;
  comissao: number;
  status: "aberta" | "paga";
}

export interface Product {
  id: ID;
  nome: string;
  categoria: string;
  estoque: number;
  estoqueMinimo: number;
  unidade: string;
  custo: number;
  precoVenda: number;
  validade: Date;
  fornecedor: string;
}

export interface StockMovement {
  id: ID;
  data: Date;
  produto: string;
  tipo: "entrada" | "saida";
  quantidade: number;
  motivo: string;
  responsavel: string;
}

export interface Conversation {
  id: ID;
  pacienteNome: string;
  pacienteId?: ID;
  canal: "WhatsApp";
  ultimaMensagem: string;
  ultimaData: Date;
  naoLidas: number;
  status: "aberta" | "aguardando" | "resolvida";
  mensagens: { de: "clinica" | "paciente"; texto: string; hora: Date }[];
}

export interface MessageTemplate {
  id: ID;
  nome: string;
  gatilho: string;
  canal: "WhatsApp";
  ativo: boolean;
  texto: string;
}

export interface Campaign {
  id: ID;
  nome: string;
  publico: string;
  enviados: number;
  respostas: number;
  agendamentos: number;
  status: "rascunho" | "enviada" | "agendada";
  data: Date;
}

export interface User {
  id: ID;
  nome: string;
  email: string;
  papel: "Administrador" | "Recepção" | "Profissional" | "Financeiro" | "Gerente";
  ativo: boolean;
  ultimoAcesso: Date;
}

export interface RolePermission {
  papel: User["papel"];
  descricao: string;
  modulos: { modulo: string; acesso: "total" | "leitura" | "nenhum" }[];
}

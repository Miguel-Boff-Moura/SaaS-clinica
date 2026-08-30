import type { Lead, CrmStage } from "@/types";
import { TODAY, addDays } from "@/lib/format";

export const CRM_STAGES: { key: CrmStage; label: string; hint: string }[] = [
  { key: "novo_lead", label: "Novo lead", hint: "Entrou agora — ainda sem contato" },
  { key: "contato_realizado", label: "Contato realizado", hint: "Primeira resposta enviada" },
  { key: "agendamento", label: "Agendamento", hint: "Avaliação marcada" },
  { key: "compareceu", label: "Compareceu", hint: "Esteve na clínica" },
  { key: "orcamento", label: "Orçamento", hint: "Proposta na mão do paciente" },
  { key: "conversao", label: "Conversão", hint: "Fechou e pagou" },
  { key: "pos_atendimento", label: "Pós-atendimento", hint: "Acompanhamento e recompra" },
];

export const LEADS: Lead[] = [
  {
    id: "l1", nome: "Lucas Martins", telefone: "(51) 99888-1290", stage: "orcamento",
    procedimentoInteresse: "Toxina botulínica", origem: "Instagram", valorPotencial: 1350,
    ultimaInteracao: addDays(TODAY, -2), responsavelId: "us4", proximaAcao: "Follow-up do orçamento",
    proximaAcaoData: addDays(TODAY, 1), temperatura: "quente", pacienteId: "p8",
  },
  {
    id: "l2", nome: "Renata Bittencourt", telefone: "(51) 99123-8890", stage: "novo_lead",
    procedimentoInteresse: "Preenchimento labial", origem: "Instagram", valorPotencial: 2100,
    ultimaInteracao: addDays(TODAY, 0), responsavelId: "us4", proximaAcao: "Primeiro contato (WhatsApp)",
    proximaAcaoData: addDays(TODAY, 0), temperatura: "quente",
  },
  {
    id: "l3", nome: "Diego Nogueira", telefone: "(51) 99655-4412", stage: "novo_lead",
    procedimentoInteresse: "Depilação a laser", origem: "Google", valorPotencial: 1990,
    ultimaInteracao: addDays(TODAY, 0), responsavelId: "us4", proximaAcao: "Primeiro contato",
    proximaAcaoData: addDays(TODAY, 0), temperatura: "morno",
  },
  {
    id: "l4", nome: "Priscila Amaral", telefone: "(51) 99777-3321", stage: "contato_realizado",
    procedimentoInteresse: "Protocolo facial (pacote)", origem: "Indicação", valorPotencial: 2490,
    ultimaInteracao: addDays(TODAY, -1), responsavelId: "us3", proximaAcao: "Enviar valores do pacote",
    proximaAcaoData: addDays(TODAY, 1), temperatura: "quente",
  },
  {
    id: "l5", nome: "Marcelo Tavares", telefone: "(51) 99444-1122", stage: "contato_realizado",
    procedimentoInteresse: "Laser CO2", origem: "Site", valorPotencial: 1800,
    ultimaInteracao: addDays(TODAY, -3), responsavelId: "us4", proximaAcao: "Retomar — não respondeu",
    proximaAcaoData: addDays(TODAY, 0), temperatura: "frio",
  },
  {
    id: "l6", nome: "Tatiane Rocha", telefone: "(51) 99321-9087", stage: "agendamento",
    procedimentoInteresse: "Bioestimulador", origem: "Instagram", valorPotencial: 2600,
    ultimaInteracao: addDays(TODAY, -1), responsavelId: "us3", proximaAcao: "Confirmar avaliação de quinta",
    proximaAcaoData: addDays(TODAY, 2), temperatura: "quente",
  },
  {
    id: "l7", nome: "Bruno Carvalho", telefone: "(51) 99210-7766", stage: "compareceu",
    procedimentoInteresse: "Preenchimento", origem: "Indicação", valorPotencial: 2100,
    ultimaInteracao: addDays(TODAY, -1), responsavelId: "us1", proximaAcao: "Montar orçamento",
    proximaAcaoData: addDays(TODAY, 0), temperatura: "quente",
  },
  {
    id: "l8", nome: "Carla Menezes", telefone: "(51) 99655-8890", stage: "orcamento",
    procedimentoInteresse: "Pacote Peeling Progressivo", origem: "Facebook", valorPotencial: 2280,
    ultimaInteracao: addDays(TODAY, -4), responsavelId: "us3", proximaAcao: "2º follow-up",
    proximaAcaoData: addDays(TODAY, 0), temperatura: "morno",
  },
  {
    id: "l9", nome: "Ana Paula Costa", telefone: "(51) 99654-3390", stage: "conversao",
    procedimentoInteresse: "Peeling químico", origem: "Instagram", valorPotencial: 480,
    ultimaInteracao: addDays(TODAY, -6), responsavelId: "us3", proximaAcao: "Agendar 2ª sessão",
    proximaAcaoData: addDays(TODAY, 0), temperatura: "quente", pacienteId: "p4",
  },
  {
    id: "l10", nome: "Camila Ferreira", telefone: "(51) 99876-1122", stage: "pos_atendimento",
    procedimentoInteresse: "Renovação de pacote", origem: "Instagram", valorPotencial: 2490,
    ultimaInteracao: addDays(TODAY, -12), responsavelId: "us3", proximaAcao: "Oferecer renovação (7 sessões usadas)",
    proximaAcaoData: addDays(TODAY, 3), temperatura: "morno", pacienteId: "p2",
  },
  {
    id: "l11", nome: "Marina Souza", telefone: "(51) 99123-4521", stage: "pos_atendimento",
    procedimentoInteresse: "Manutenção de toxina", origem: "Indicação", valorPotencial: 1350,
    ultimaInteracao: addDays(TODAY, -3), responsavelId: "us1", proximaAcao: "Agendar manutenção (120 dias)",
    proximaAcaoData: addDays(TODAY, 5), temperatura: "quente", pacienteId: "p1",
  },
];

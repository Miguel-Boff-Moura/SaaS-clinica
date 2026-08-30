import type { Conversation, MessageTemplate, Campaign, Quote } from "@/types";
import { TODAY, addDays } from "@/lib/format";

function h(dayOffset: number, hhmm: string): Date {
  const [hh, mm] = hhmm.split(":").map(Number);
  const d = addDays(TODAY, dayOffset);
  d.setHours(hh, mm, 0, 0);
  return d;
}

export const CONVERSATIONS: Conversation[] = [
  {
    id: "cv1", pacienteNome: "Marina Souza", pacienteId: "p1", canal: "WhatsApp",
    ultimaMensagem: "Perfeito, confirmo às 9h amanhã 😊", ultimaData: h(-1, "18:12"),
    naoLidas: 0, status: "resolvida",
    mensagens: [
      { de: "clinica", texto: "Olá, Marina! Passando para confirmar seu retorno amanhã às 09:00 com a Dra. Mariana. Podemos confirmar?", hora: h(-1, "17:40") },
      { de: "paciente", texto: "Oi! Consigo sim", hora: h(-1, "18:03") },
      { de: "clinica", texto: "Maravilha! Qualquer imprevisto é só avisar por aqui.", hora: h(-1, "18:05") },
      { de: "paciente", texto: "Perfeito, confirmo às 9h amanhã 😊", hora: h(-1, "18:12") },
    ],
  },
  {
    id: "cv2", pacienteNome: "Renata Bittencourt", canal: "WhatsApp",
    ultimaMensagem: "Vocês fazem preenchimento labial? Qual o valor?", ultimaData: h(0, "09:22"),
    naoLidas: 2, status: "aberta",
    mensagens: [
      { de: "paciente", texto: "Oi, vim pelo Instagram", hora: h(0, "09:20") },
      { de: "paciente", texto: "Vocês fazem preenchimento labial? Qual o valor?", hora: h(0, "09:22") },
    ],
  },
  {
    id: "cv3", pacienteNome: "Beatriz Lima", pacienteId: "p3", canal: "WhatsApp",
    ultimaMensagem: "Consigo pagar o bioestimulador em 2x?", ultimaData: h(0, "08:05"),
    naoLidas: 1, status: "aguardando",
    mensagens: [
      { de: "clinica", texto: "Bom dia, Beatriz! Tudo bem? Sobre o valor do bioestimulador que ficou pendente...", hora: h(-1, "16:00") },
      { de: "paciente", texto: "Bom dia! Consigo pagar o bioestimulador em 2x?", hora: h(0, "08:05") },
    ],
  },
  {
    id: "cv4", pacienteNome: "Ana Paula Costa", pacienteId: "p4", canal: "WhatsApp",
    ultimaMensagem: "Sua 2ª sessão de peeling é hoje às 15h. Até já! 💚", ultimaData: h(0, "07:30"),
    naoLidas: 0, status: "resolvida",
    mensagens: [
      { de: "clinica", texto: "Sua 2ª sessão de peeling é hoje às 15h. Até já! 💚", hora: h(0, "07:30") },
    ],
  },
  {
    id: "cv5", pacienteNome: "Fernanda Alves", pacienteId: "p5", canal: "WhatsApp",
    ultimaMensagem: "Sentimos sua falta! Que tal agendar sua manutenção com 15% off?", ultimaData: h(-30, "10:00"),
    naoLidas: 0, status: "aberta",
    mensagens: [
      { de: "clinica", texto: "Oi, Fernanda! Sentimos sua falta na Aurora 💚 Que tal agendar sua manutenção de toxina com 15% off este mês?", hora: h(-30, "10:00") },
    ],
  },
];

export const MESSAGE_TEMPLATES: MessageTemplate[] = [
  { id: "mt1", nome: "Confirmação de agendamento", gatilho: "24h antes da consulta", canal: "WhatsApp", ativo: true, texto: "Olá, {paciente}! Confirmando seu horário na Clínica Aurora em {data} às {hora} com {profissional}. Responda SIM para confirmar." },
  { id: "mt2", nome: "Lembrete no dia", gatilho: "3h antes da consulta", canal: "WhatsApp", ativo: true, texto: "Oi, {paciente}! Seu atendimento é hoje às {hora}. Nosso endereço: {unidade}. Até já! 💚" },
  { id: "mt3", nome: "Pós-atendimento (D+1)", gatilho: "1 dia após o atendimento", canal: "WhatsApp", ativo: true, texto: "{paciente}, como você está se sentindo após o procedimento? Qualquer dúvida, estamos aqui. Cuidados: {orientacoes}" },
  { id: "mt4", nome: "Lembrete de retorno", gatilho: "Na data de validade do procedimento", canal: "WhatsApp", ativo: true, texto: "Olá, {paciente}! Já faz {intervalo} do seu {procedimento}. Vamos agendar sua manutenção?" },
  { id: "mt5", nome: "Aniversário", gatilho: "No dia do aniversário", canal: "WhatsApp", ativo: false, texto: "Feliz aniversário, {paciente}! 🎉 A Aurora tem um presente: 20% off em qualquer procedimento neste mês." },
  { id: "mt6", nome: "Reativação (inativos 180d)", gatilho: "Manual / campanha", canal: "WhatsApp", ativo: true, texto: "Sentimos sua falta, {paciente}! Volte para a Aurora com 15% off na sua próxima sessão." },
];

export const CAMPAIGNS: Campaign[] = [
  { id: "cp1", nome: "Reativação inativos — Agosto", publico: "Pacientes sem visita há 180+ dias (42)", enviados: 42, respostas: 11, agendamentos: 6, status: "enviada", data: addDays(TODAY, -12) },
  { id: "cp2", nome: "Pré-primavera: pacotes faciais", publico: "Pacientes de estética facial ativos (86)", enviados: 86, respostas: 23, agendamentos: 14, status: "enviada", data: addDays(TODAY, -5) },
  { id: "cp3", nome: "Aniversariantes de setembro", publico: "Aniversariantes do mês (28)", enviados: 0, respostas: 0, agendamentos: 0, status: "agendada", data: addDays(TODAY, 2) },
  { id: "cp4", nome: "Renovação de pacotes (80%+ usados)", publico: "Pacotes com 80%+ de sessões usadas (9)", enviados: 0, respostas: 0, agendamentos: 0, status: "rascunho", data: addDays(TODAY, 0) },
];

export const QUOTES: Quote[] = [
  {
    id: "q1", numero: "2026-0170", pacienteNome: "Lucas Martins", pacienteId: "p8",
    criadoEm: addDays(TODAY, -2), validadeAte: addDays(TODAY, 5), status: "enviado", descontoPct: 0,
    condicao: "Pix à vista ou 3x sem juros no cartão", responsavel: "Juliana Prado",
    itens: [{ descricao: "Toxina botulínica — terço superior", tipo: "Procedimento", qtd: 1, valorUnit: 1350 }],
  },
  {
    id: "q2", numero: "2026-0161", pacienteNome: "Beatriz Lima", pacienteId: "p3",
    criadoEm: addDays(TODAY, -10), validadeAte: addDays(TODAY, -3), status: "aprovado", descontoPct: 0,
    condicao: "2x sem juros", responsavel: "Dra. Mariana Costa",
    itens: [{ descricao: "Bioestimulador de colágeno (2 sessões)", tipo: "Pacote", qtd: 1, valorUnit: 2600 }],
  },
  {
    id: "q3", numero: "2026-0168", pacienteNome: "Priscila Amaral",
    criadoEm: addDays(TODAY, -1), validadeAte: addDays(TODAY, 6), status: "rascunho", descontoPct: 10,
    condicao: "Cartão em até 6x", responsavel: "Dra. Camila Alves",
    itens: [
      { descricao: "Protocolo Facial Premium — 10 sessões", tipo: "Pacote", qtd: 1, valorUnit: 2490 },
      { descricao: "Sérum vitamina C 20% (revenda)", tipo: "Produto", qtd: 1, valorUnit: 210 },
    ],
  },
  {
    id: "q4", numero: "2026-0155", pacienteNome: "Carla Menezes",
    criadoEm: addDays(TODAY, -14), validadeAte: addDays(TODAY, -4), status: "expirado", descontoPct: 5,
    condicao: "Pix à vista", responsavel: "Dra. Camila Alves",
    itens: [{ descricao: "Peeling Progressivo — 6 sessões", tipo: "Pacote", qtd: 1, valorUnit: 2280 }],
  },
  {
    id: "q5", numero: "2026-0142", pacienteNome: "Marina Souza", pacienteId: "p1",
    criadoEm: addDays(TODAY, -50), validadeAte: addDays(TODAY, -35), status: "aprovado", descontoPct: 0,
    condicao: "Cartão 3x", responsavel: "Dra. Mariana Costa",
    itens: [{ descricao: "Preenchimento com ácido hialurônico — 1ml", tipo: "Procedimento", qtd: 1, valorUnit: 2100 }],
  },
  {
    id: "q6", numero: "2026-0149", pacienteNome: "Marcelo Tavares",
    criadoEm: addDays(TODAY, -6), validadeAte: addDays(TODAY, 1), status: "recusado", descontoPct: 0,
    condicao: "À vista", responsavel: "Juliana Prado",
    itens: [{ descricao: "Laser CO2 fracionado", tipo: "Procedimento", qtd: 1, valorUnit: 1800 }],
  },
];

export function quoteTotal(q: Quote): { subtotal: number; desconto: number; total: number } {
  const subtotal = q.itens.reduce((s, i) => s + i.qtd * i.valorUnit, 0);
  const desconto = Math.round(subtotal * (q.descontoPct / 100));
  return { subtotal, desconto, total: subtotal - desconto };
}

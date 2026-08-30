import type { Patient, TimelineEvent } from "@/types";
import { TODAY, addDays } from "@/lib/format";
import { packageTemplateById } from "./catalog";

let seq = 0;
const uid = (p: string) => `${p}${++seq}`;

/** Ordena a timeline do mais recente para o mais antigo. */
function tl(events: Omit<TimelineEvent, "id">[]): TimelineEvent[] {
  return events
    .map((e) => ({ ...e, id: uid("tl") }))
    .sort((a, b) => b.data.getTime() - a.data.getTime());
}

function makePackage(templateId: string, usadas: number, compradoHaDias: number) {
  const t = packageTemplateById(templateId)!;
  const compradoEm = addDays(TODAY, -compradoHaDias);
  return {
    id: uid("pp"),
    templateId,
    nome: t.nome,
    sessoesContratadas: t.sessoes,
    sessoesUsadas: usadas,
    valorPago: t.preco,
    compradoEm,
    validadeAte: addDays(compradoEm, t.validadeDias),
    status: (usadas >= t.sessoes ? "concluido" : "ativo") as "ativo" | "concluido" | "expirado",
  };
}

export const PATIENTS: Patient[] = [
  /* ---------------------------------------------------------------- p1 · rica */
  {
    id: "p1",
    nome: "Marina Souza",
    nascimento: new Date(1990, 2, 14),
    telefone: "(51) 99123-4521",
    email: "marina.souza@email.com",
    status: "ativo",
    origem: "Indicação",
    tags: ["VIP", "Injetáveis", "Fidelizada"],
    desde: new Date(2023, 0, 18),
    profissionalId: "pro1",
    ultimaVisita: addDays(TODAY, -40),
    proximoAgendamento: addDays(TODAY, 0),
    valorGasto: 14980,
    alergias: ["Dipirona"],
    observacoesImportantes: ["Prefere anestésico tópico reforçado", "Sensibilidade na região perioral"],
    aniversarioEsteMes: false,
    retornoPendente: true,
    faltas: 0,
    pacotes: [makePackage("pk4", 2, 120)],
    procedimentos: [
      { id: uid("pr"), procedimentoId: "pc5", nome: "Toxina botulínica (Botox)", data: addDays(TODAY, -125), profissional: "Dra. Mariana Costa", valor: 1350, pago: true, regiao: "Terço superior", observacao: "20U glabela, 10U frontal, 8U por lado periorbital" },
      { id: uid("pr"), procedimentoId: "pc6", nome: "Preenchimento com ácido hialurônico", data: addDays(TODAY, -40), profissional: "Dra. Mariana Costa", valor: 2100, pago: true, regiao: "Lábios", observacao: "1ml, técnica de hidratação labial" },
      { id: uid("pr"), procedimentoId: "pc5", nome: "Toxina botulínica (Botox)", data: addDays(TODAY, -245), profissional: "Dra. Mariana Costa", valor: 1200, pago: true, regiao: "Terço superior" },
      { id: uid("pr"), procedimentoId: "pc10", nome: "Microagulhamento facial", data: addDays(TODAY, -75), profissional: "Dra. Camila Alves", valor: 620, pago: true, pacoteId: "pk4" },
      { id: uid("pr"), procedimentoId: "pc10", nome: "Microagulhamento facial", data: addDays(TODAY, -20), profissional: "Dra. Camila Alves", valor: 0, pago: true, pacoteId: "pk4" },
    ],
    financeiro: [
      { id: uid("fi"), data: addDays(TODAY, -40), descricao: "Preenchimento labial 1ml", valor: 2100, status: "pago", forma: "Cartão de crédito" },
      { id: uid("fi"), data: addDays(TODAY, -125), descricao: "Toxina botulínica — terço superior", valor: 1350, status: "pago", forma: "Pix" },
      { id: uid("fi"), data: addDays(TODAY, -120), descricao: "Skinbooster Anual (pacote 4 sessões)", valor: 2100, status: "pago", forma: "Cartão de crédito" },
      { id: uid("fi"), data: addDays(TODAY, 0), descricao: "Retorno preenchimento + retoque", valor: 400, status: "pendente" },
    ],
    documentos: [
      { id: uid("doc"), nome: "Termo de consentimento — Injetáveis", tipo: "Termo de consentimento", data: addDays(TODAY, -125) },
      { id: uid("doc"), nome: "Receita — Pós preenchimento", tipo: "Receita", data: addDays(TODAY, -40) },
      { id: uid("doc"), nome: "Orçamento #2026-0142", tipo: "Orçamento", data: addDays(TODAY, -50) },
    ],
    galeria: [
      { id: uid("g"), data: addDays(TODAY, -40), regiao: "Lábios", antes: "#e7ddd9", depois: "#efe4de", nota: "Imediato pós 1ml" },
      { id: uid("g"), data: addDays(TODAY, -20), regiao: "Face completa", antes: "#e5e2dd", depois: "#efece6", nota: "3ª sessão skinbooster" },
    ],
    prontuario: [
      { id: uid("cr"), data: addDays(TODAY, -40), profissional: "Dra. Mariana Costa", tipo: "Procedimento — Preenchimento", queixa: "Deseja mais volume e contorno labial.", conduta: "Aplicado 1ml AH em lábios, técnica retrógrada. Sem intercorrências. Orientada quanto a compressas frias e evitar exercícios por 48h.", prescricao: ["Arnica montana 30CH — 5 glóbulos 3x/dia por 5 dias", "Compressa fria local 10min 4x/dia"] },
      { id: uid("cr"), data: addDays(TODAY, -125), profissional: "Dra. Mariana Costa", tipo: "Procedimento — Toxina botulínica", queixa: "Linhas dinâmicas em terço superior.", conduta: "Aplicação de toxina botulínica conforme marcação. Retorno em 15 dias para avaliação de retoque.", prescricao: [] },
    ],
    anamnese: [
      { pergunta: "Faz uso de medicação contínua?", resposta: "Losartana 50mg (HAS controlada)" },
      { pergunta: "Possui alergias?", resposta: "Dipirona — reação cutânea", alerta: true },
      { pergunta: "Já realizou procedimentos estéticos antes?", resposta: "Sim — toxina botulínica há 2 anos, sem intercorrências" },
      { pergunta: "Está gestante ou amamentando?", resposta: "Não" },
      { pergunta: "Possui histórico de herpes labial?", resposta: "Sim, episódios ocasionais", alerta: true },
      { pergunta: "Fuma?", resposta: "Não" },
    ],
    timeline: tl([
      { kind: "retorno", data: addDays(TODAY, 0), titulo: "Retorno agendado", descricao: "Avaliação de preenchimento labial + retoque", profissional: "Dra. Mariana Costa" },
      { kind: "pagamento", data: addDays(TODAY, -40), titulo: "Pagamento recebido", descricao: "Preenchimento labial 1ml", valor: 2100 },
      { kind: "procedimento", data: addDays(TODAY, -40), titulo: "Preenchimento com ácido hialurônico", descricao: "Lábios — 1ml", profissional: "Dra. Mariana Costa" },
      { kind: "mensagem", data: addDays(TODAY, -42), titulo: "WhatsApp enviado", descricao: "Confirmação de horário e orientações pré-procedimento" },
      { kind: "procedimento", data: addDays(TODAY, -20), titulo: "Microagulhamento facial", descricao: "3ª sessão · Skinbooster Anual", profissional: "Dra. Camila Alves" },
      { kind: "pacote", data: addDays(TODAY, -120), titulo: "Pacote adquirido", descricao: "Skinbooster Anual — 4 sessões", valor: 2100 },
      { kind: "procedimento", data: addDays(TODAY, -125), titulo: "Toxina botulínica (Botox)", descricao: "Terço superior", profissional: "Dra. Mariana Costa" },
      { kind: "anamnese", data: addDays(TODAY, -245), titulo: "Anamnese atualizada", descricao: "Primeira ficha clínica completa" },
    ]),
  },

  /* ---------------------------------------------------------------- p2 · rica */
  {
    id: "p2",
    nome: "Camila Ferreira",
    nascimento: new Date(1985, 10, 2),
    telefone: "(51) 99876-1122",
    email: "camila.ferreira@email.com",
    status: "ativo",
    origem: "Instagram",
    tags: ["Pacote ativo", "Estética facial"],
    desde: new Date(2025, 5, 9),
    profissionalId: "pro3",
    ultimaVisita: addDays(TODAY, -12),
    proximoAgendamento: addDays(TODAY, 3),
    valorGasto: 4860,
    alergias: [],
    observacoesImportantes: ["Pele sensível — reduzir tempo de ácido"],
    aniversarioEsteMes: false,
    retornoPendente: false,
    faltas: 1,
    pacotes: [makePackage("pk1", 6, 70)],
    procedimentos: [
      { id: uid("pr"), procedimentoId: "pc3", nome: "Limpeza de pele profunda", data: addDays(TODAY, -12), profissional: "Dra. Camila Alves", valor: 0, pago: true, pacoteId: "pk1" },
      { id: uid("pr"), procedimentoId: "pc3", nome: "Limpeza de pele profunda", data: addDays(TODAY, -40), profissional: "Dra. Camila Alves", valor: 0, pago: true, pacoteId: "pk1" },
      { id: uid("pr"), procedimentoId: "pc4", nome: "Peeling químico", data: addDays(TODAY, -62), profissional: "Dra. Camila Alves", valor: 480, pago: true },
      { id: uid("pr"), procedimentoId: "pc2", nome: "Avaliação estética", data: addDays(TODAY, -80), profissional: "Dra. Camila Alves", valor: 0, pago: true },
    ],
    financeiro: [
      { id: uid("fi"), data: addDays(TODAY, -70), descricao: "Protocolo Facial Premium (10 sessões)", valor: 2490, status: "pago", forma: "Cartão de crédito" },
      { id: uid("fi"), data: addDays(TODAY, -62), descricao: "Peeling químico", valor: 480, status: "pago", forma: "Pix" },
      { id: uid("fi"), data: addDays(TODAY, -30), descricao: "Sérum vitamina C 20% (revenda)", valor: 210, status: "pago", forma: "Cartão de débito" },
    ],
    documentos: [
      { id: uid("doc"), nome: "Contrato — Pacote Facial Premium", tipo: "Contrato", data: addDays(TODAY, -70) },
      { id: uid("doc"), nome: "Termo de consentimento — Peeling", tipo: "Termo de consentimento", data: addDays(TODAY, -62) },
    ],
    galeria: [
      { id: uid("g"), data: addDays(TODAY, -62), regiao: "Face completa", antes: "#e8e2dc", depois: "#f0ebe4", nota: "Antes/depois peeling" },
    ],
    prontuario: [
      { id: uid("cr"), data: addDays(TODAY, -12), profissional: "Dra. Camila Alves", tipo: "Sessão de pacote", queixa: "Manutenção — comedões zona T.", conduta: "Limpeza profunda com extração manual. Pele reativa, reduzido tempo de vapor. Máscara calmante ao final.", prescricao: ["Protetor solar FPS 50 reaplicar a cada 3h", "Suspender ácidos por 3 dias"] },
      { id: uid("cr"), data: addDays(TODAY, -80), profissional: "Dra. Camila Alves", tipo: "Avaliação", queixa: "Textura irregular e poros dilatados.", conduta: "Indicado protocolo de 10 sessões (limpeza + microagulhamento alternados). Pele fototipo III, sensível.", prescricao: [] },
    ],
    anamnese: [
      { pergunta: "Faz uso de medicação contínua?", resposta: "Não" },
      { pergunta: "Possui alergias?", resposta: "Nega" },
      { pergunta: "Exposição solar frequente?", resposta: "Moderada — usa protetor diariamente" },
      { pergunta: "Usa ácidos na rotina?", resposta: "Ácido glicólico 2x/semana" },
      { pergunta: "Está gestante ou amamentando?", resposta: "Não" },
    ],
    timeline: tl([
      { kind: "procedimento", data: addDays(TODAY, -12), titulo: "Limpeza de pele profunda", descricao: "6ª sessão · Protocolo Facial Premium", profissional: "Dra. Camila Alves" },
      { kind: "mensagem", data: addDays(TODAY, -14), titulo: "Lembrete automático enviado", descricao: "Sessão amanhã às 14h" },
      { kind: "procedimento", data: addDays(TODAY, -40), titulo: "Limpeza de pele profunda", descricao: "5ª sessão · Protocolo Facial Premium", profissional: "Dra. Camila Alves" },
      { kind: "pagamento", data: addDays(TODAY, -62), titulo: "Pagamento recebido", descricao: "Peeling químico", valor: 480 },
      { kind: "pacote", data: addDays(TODAY, -70), titulo: "Pacote adquirido", descricao: "Protocolo Facial Premium — 10 sessões", valor: 2490 },
      { kind: "consulta", data: addDays(TODAY, -80), titulo: "Avaliação estética", profissional: "Dra. Camila Alves" },
    ]),
  },

  /* ---------------------------------------------------------------- p3 · rica */
  {
    id: "p3",
    nome: "Beatriz Lima",
    nascimento: new Date(1993, 7, 27),
    telefone: "(51) 99321-7788",
    email: "bia.lima@email.com",
    status: "ativo",
    origem: "Google",
    tags: ["Injetáveis", "Inadimplência"],
    desde: new Date(2023, 8, 3),
    profissionalId: "pro1",
    ultimaVisita: addDays(TODAY, -3),
    proximoAgendamento: null,
    valorGasto: 9200,
    alergias: ["Lidocaína (leve)"],
    observacoesImportantes: ["Fez bioestimulador — retorno em 30 dias", "Pagamento do bioestimulador pendente"],
    aniversarioEsteMes: true,
    retornoPendente: true,
    faltas: 0,
    pacotes: [],
    procedimentos: [
      { id: uid("pr"), procedimentoId: "pc7", nome: "Bioestimulador de colágeno", data: addDays(TODAY, -3), profissional: "Dra. Mariana Costa", valor: 2600, pago: false, regiao: "Face inferior", observacao: "1 frasco diluído em 8ml, técnica em leque" },
      { id: uid("pr"), procedimentoId: "pc5", nome: "Toxina botulínica (Botox)", data: addDays(TODAY, -170), profissional: "Dra. Mariana Costa", valor: 1200, pago: true, regiao: "Terço superior" },
      { id: uid("pr"), procedimentoId: "pc1", nome: "Consulta dermatológica", data: addDays(TODAY, -200), profissional: "Dra. Mariana Costa", valor: 450, pago: true },
    ],
    financeiro: [
      { id: uid("fi"), data: addDays(TODAY, -3), descricao: "Bioestimulador de colágeno — face inferior", valor: 2600, status: "pendente" },
      { id: uid("fi"), data: addDays(TODAY, -170), descricao: "Toxina botulínica — terço superior", valor: 1200, status: "pago", forma: "Pix" },
      { id: uid("fi"), data: addDays(TODAY, -200), descricao: "Consulta dermatológica", valor: 450, status: "pago", forma: "Dinheiro" },
    ],
    documentos: [
      { id: uid("doc"), nome: "Termo de consentimento — Bioestimulador", tipo: "Termo de consentimento", data: addDays(TODAY, -3) },
      { id: uid("doc"), nome: "Orçamento #2026-0161", tipo: "Orçamento", data: addDays(TODAY, -10) },
    ],
    galeria: [],
    prontuario: [
      { id: uid("cr"), data: addDays(TODAY, -3), profissional: "Dra. Mariana Costa", tipo: "Procedimento — Bioestimulador", queixa: "Flacidez leve em face inferior e sulco.", conduta: "Aplicado 1 frasco de bioestimulador, técnica em leque subdérmico. Massagem 5-5-5 orientada. Retorno em 30 dias para 2ª sessão.", prescricao: ["Massagem local 5min 5x/dia por 5 dias", "Evitar sol direto por 15 dias"] },
    ],
    anamnese: [
      { pergunta: "Faz uso de medicação contínua?", resposta: "Anticoncepcional oral" },
      { pergunta: "Possui alergias?", resposta: "Lidocaína — reação leve relatada", alerta: true },
      { pergunta: "Já realizou bioestimulador antes?", resposta: "Não — primeira vez" },
      { pergunta: "Doença autoimune?", resposta: "Nega" },
      { pergunta: "Está gestante ou amamentando?", resposta: "Não" },
    ],
    timeline: tl([
      { kind: "procedimento", data: addDays(TODAY, -3), titulo: "Bioestimulador de colágeno", descricao: "Face inferior — 1ª sessão", profissional: "Dra. Mariana Costa" },
      { kind: "nota", data: addDays(TODAY, -3), titulo: "Pagamento pendente registrado", descricao: "Bioestimulador — R$ 2.600 a receber" },
      { kind: "orcamento", data: addDays(TODAY, -10), titulo: "Orçamento enviado", descricao: "#2026-0161 — Bioestimulador + retorno", valor: 2600 },
      { kind: "mensagem", data: addDays(TODAY, -12), titulo: "Contato via WhatsApp", descricao: "Dúvidas sobre bioestimulador respondidas" },
      { kind: "procedimento", data: addDays(TODAY, -170), titulo: "Toxina botulínica (Botox)", descricao: "Terço superior", profissional: "Dra. Mariana Costa" },
    ]),
  },

  /* ------------------------------------------------------- p4 · nova paciente */
  {
    id: "p4",
    nome: "Ana Paula Costa",
    nascimento: new Date(1998, 0, 19),
    telefone: "(51) 99654-3390",
    email: "anapaula.costa@email.com",
    status: "ativo",
    origem: "Instagram",
    tags: ["Novo paciente"],
    desde: addDays(TODAY, -6),
    profissionalId: "pro3",
    ultimaVisita: addDays(TODAY, -6),
    proximoAgendamento: addDays(TODAY, 0),
    valorGasto: 480,
    alergias: [],
    observacoesImportantes: [],
    aniversarioEsteMes: false,
    retornoPendente: false,
    faltas: 0,
    pacotes: [],
    procedimentos: [
      { id: uid("pr"), procedimentoId: "pc4", nome: "Peeling químico", data: addDays(TODAY, -6), profissional: "Dra. Camila Alves", valor: 480, pago: true },
    ],
    financeiro: [
      { id: uid("fi"), data: addDays(TODAY, -6), descricao: "Peeling químico", valor: 480, status: "pago", forma: "Pix" },
    ],
    documentos: [
      { id: uid("doc"), nome: "Termo de consentimento — Peeling", tipo: "Termo de consentimento", data: addDays(TODAY, -6) },
    ],
    galeria: [],
    prontuario: [
      { id: uid("cr"), data: addDays(TODAY, -6), profissional: "Dra. Camila Alves", tipo: "Procedimento — Peeling", queixa: "Melasma leve e marcas de acne.", conduta: "Peeling de ácido mandélico 30%, 1 camada. Boa tolerância. Agendado retorno em 21 dias para 2ª aplicação.", prescricao: ["Protetor solar FPS 50 — reaplicar a cada 3h", "Clareador noturno após liberação"] },
    ],
    anamnese: [
      { pergunta: "Faz uso de medicação contínua?", resposta: "Não" },
      { pergunta: "Possui alergias?", resposta: "Nega" },
      { pergunta: "Já usou isotretinoína?", resposta: "Sim, finalizou há 8 meses" },
      { pergunta: "Está gestante ou amamentando?", resposta: "Não" },
    ],
    timeline: tl([
      { kind: "retorno", data: addDays(TODAY, 0), titulo: "Retorno agendado", descricao: "2ª sessão de peeling", profissional: "Dra. Camila Alves" },
      { kind: "pagamento", data: addDays(TODAY, -6), titulo: "Pagamento recebido", descricao: "Peeling químico", valor: 480 },
      { kind: "procedimento", data: addDays(TODAY, -6), titulo: "Peeling químico", descricao: "1ª aplicação — ácido mandélico", profissional: "Dra. Camila Alves" },
      { kind: "mensagem", data: addDays(TODAY, -7), titulo: "Primeiro contato — Instagram", descricao: "Lead convertido em agendamento" },
    ]),
  },

  /* -------------------------------------------------------- p5 · inativo (win-back) */
  {
    id: "p5",
    nome: "Fernanda Alves",
    nascimento: new Date(1979, 4, 8),
    telefone: "(51) 99444-9021",
    email: "fernanda.alves@email.com",
    status: "inativo",
    origem: "Indicação",
    tags: ["Reativar"],
    desde: new Date(2022, 2, 15),
    profissionalId: "pro1",
    ultimaVisita: addDays(TODAY, -260),
    proximoAgendamento: null,
    valorGasto: 6100,
    alergias: [],
    observacoesImportantes: ["Sem retorno desde a última toxina — campanha de reativação"],
    aniversarioEsteMes: false,
    retornoPendente: true,
    faltas: 2,
    pacotes: [],
    procedimentos: [
      { id: uid("pr"), procedimentoId: "pc5", nome: "Toxina botulínica (Botox)", data: addDays(TODAY, -260), profissional: "Dra. Mariana Costa", valor: 1200, pago: true, regiao: "Terço superior" },
      { id: uid("pr"), procedimentoId: "pc8", nome: "Laser CO2 fracionado", data: addDays(TODAY, -320), profissional: "Dra. Mariana Costa", valor: 1800, pago: true },
    ],
    financeiro: [
      { id: uid("fi"), data: addDays(TODAY, -260), descricao: "Toxina botulínica", valor: 1200, status: "pago", forma: "Cartão de crédito" },
    ],
    documentos: [],
    galeria: [],
    prontuario: [
      { id: uid("cr"), data: addDays(TODAY, -260), profissional: "Dra. Mariana Costa", tipo: "Procedimento — Toxina botulínica", queixa: "Manutenção anual.", conduta: "Aplicação de rotina. Orientado retorno em 4 meses.", prescricao: [] },
    ],
    anamnese: [
      { pergunta: "Faz uso de medicação contínua?", resposta: "Reposição hormonal" },
      { pergunta: "Possui alergias?", resposta: "Nega" },
      { pergunta: "Está gestante ou amamentando?", resposta: "Não" },
    ],
    timeline: tl([
      { kind: "mensagem", data: addDays(TODAY, -30), titulo: "Campanha de reativação enviada", descricao: "Sem resposta até o momento" },
      { kind: "procedimento", data: addDays(TODAY, -260), titulo: "Toxina botulínica (Botox)", profissional: "Dra. Mariana Costa" },
      { kind: "procedimento", data: addDays(TODAY, -320), titulo: "Laser CO2 fracionado", profissional: "Dra. Mariana Costa" },
    ]),
  },

  /* -------------------------------------------------------- p6 · faltoso */
  {
    id: "p6",
    nome: "João Ferreira",
    nascimento: new Date(1988, 11, 22),
    telefone: "(51) 99777-2043",
    email: "joao.ferreira@email.com",
    status: "ativo",
    origem: "Site",
    tags: ["Faltas recorrentes"],
    desde: new Date(2024, 9, 1),
    profissionalId: "pro2",
    ultimaVisita: addDays(TODAY, -55),
    proximoAgendamento: addDays(TODAY, 5),
    valorGasto: 1560,
    alergias: [],
    observacoesImportantes: ["3 faltas em 6 meses — exigir confirmação ativa"],
    aniversarioEsteMes: true,
    retornoPendente: false,
    faltas: 3,
    pacotes: [makePackage("pk3", 4, 90)],
    procedimentos: [
      { id: uid("pr"), procedimentoId: "pc9", nome: "Depilação a laser (sessão)", data: addDays(TODAY, -55), profissional: "Dr. Rafael Mendes", valor: 0, pago: true, pacoteId: "pk3" },
      { id: uid("pr"), procedimentoId: "pc9", nome: "Depilação a laser (sessão)", data: addDays(TODAY, -95), profissional: "Dr. Rafael Mendes", valor: 0, pago: true, pacoteId: "pk3" },
    ],
    financeiro: [
      { id: uid("fi"), data: addDays(TODAY, -90), descricao: "Full Body Laser (10 sessões)", valor: 1990, status: "pago", forma: "Cartão de crédito" },
    ],
    documentos: [{ id: uid("doc"), nome: "Contrato — Full Body Laser", tipo: "Contrato", data: addDays(TODAY, -90) }],
    galeria: [],
    prontuario: [
      { id: uid("cr"), data: addDays(TODAY, -55), profissional: "Dr. Rafael Mendes", tipo: "Sessão de pacote", queixa: "Depilação — dorso.", conduta: "Sessão 4/10. Parâmetros ajustados. Sem eritema persistente.", prescricao: [] },
    ],
    anamnese: [
      { pergunta: "Faz uso de medicação contínua?", resposta: "Não" },
      { pergunta: "Exposição solar recente?", resposta: "Nega nos últimos 15 dias" },
      { pergunta: "Possui tatuagens na área?", resposta: "Não" },
    ],
    timeline: tl([
      { kind: "nota", data: addDays(TODAY, -40), titulo: "Falta registrada", descricao: "Não compareceu — sessão de laser" },
      { kind: "procedimento", data: addDays(TODAY, -55), titulo: "Depilação a laser", descricao: "Sessão 4/10", profissional: "Dr. Rafael Mendes" },
      { kind: "pacote", data: addDays(TODAY, -90), titulo: "Pacote adquirido", descricao: "Full Body Laser — 10 sessões", valor: 1990 },
    ]),
  },

  /* -------------------------------------------------------- p7 · aniversariante ativo */
  {
    id: "p7",
    nome: "Ana Beatriz Souza",
    nascimento: new Date(1995, 7, 12),
    telefone: "(51) 99210-5567",
    email: "anabeatriz.souza@email.com",
    status: "ativo",
    origem: "Indicação",
    tags: ["Aniversariante", "Estética facial"],
    desde: new Date(2024, 1, 20),
    profissionalId: "pro3",
    ultimaVisita: addDays(TODAY, -18),
    proximoAgendamento: addDays(TODAY, 2),
    valorGasto: 3120,
    alergias: [],
    observacoesImportantes: [],
    aniversarioEsteMes: true,
    retornoPendente: false,
    faltas: 0,
    pacotes: [makePackage("pk2", 3, 60)],
    procedimentos: [
      { id: uid("pr"), procedimentoId: "pc4", nome: "Peeling químico", data: addDays(TODAY, -18), profissional: "Dra. Camila Alves", valor: 0, pago: true, pacoteId: "pk2" },
      { id: uid("pr"), procedimentoId: "pc10", nome: "Microagulhamento facial", data: addDays(TODAY, -46), profissional: "Dra. Camila Alves", valor: 620, pago: true },
    ],
    financeiro: [
      { id: uid("fi"), data: addDays(TODAY, -60), descricao: "Peeling Progressivo (6 sessões)", valor: 2280, status: "pago", forma: "Cartão de crédito" },
      { id: uid("fi"), data: addDays(TODAY, -46), descricao: "Microagulhamento facial", valor: 620, status: "pago", forma: "Pix" },
    ],
    documentos: [{ id: uid("doc"), nome: "Contrato — Peeling Progressivo", tipo: "Contrato", data: addDays(TODAY, -60) }],
    galeria: [
      { id: uid("g"), data: addDays(TODAY, -46), regiao: "Face completa", antes: "#e9e3dd", depois: "#f1ece5" },
    ],
    prontuario: [
      { id: uid("cr"), data: addDays(TODAY, -18), profissional: "Dra. Camila Alves", tipo: "Sessão de pacote", queixa: "Textura e viço.", conduta: "Peeling superficial 3/6. Boa evolução do brilho e uniformidade.", prescricao: [] },
    ],
    anamnese: [
      { pergunta: "Faz uso de medicação contínua?", resposta: "Não" },
      { pergunta: "Possui alergias?", resposta: "Nega" },
      { pergunta: "Rotina de skincare?", resposta: "Vitamina C pela manhã, retinol 2x/semana" },
    ],
    timeline: tl([
      { kind: "procedimento", data: addDays(TODAY, -18), titulo: "Peeling químico", descricao: "Sessão 3/6 · Peeling Progressivo", profissional: "Dra. Camila Alves" },
      { kind: "procedimento", data: addDays(TODAY, -46), titulo: "Microagulhamento facial", profissional: "Dra. Camila Alves" },
      { kind: "pacote", data: addDays(TODAY, -60), titulo: "Pacote adquirido", descricao: "Peeling Progressivo — 6 sessões", valor: 2280 },
    ]),
  },

  /* -------------------------------------------------------- p8 · lead (no CRM) */
  {
    id: "p8",
    nome: "Lucas Martins",
    nascimento: new Date(1991, 3, 5),
    telefone: "(51) 99888-1290",
    email: "lucas.martins@email.com",
    status: "lead",
    origem: "Instagram",
    tags: ["Lead", "Interesse: Botox"],
    desde: addDays(TODAY, -4),
    profissionalId: "pro1",
    ultimaVisita: null,
    proximoAgendamento: addDays(TODAY, 4),
    valorGasto: 0,
    alergias: [],
    observacoesImportantes: ["Veio de anúncio — orçamento de toxina enviado"],
    aniversarioEsteMes: false,
    retornoPendente: false,
    faltas: 0,
    pacotes: [],
    procedimentos: [],
    financeiro: [],
    documentos: [{ id: uid("doc"), nome: "Orçamento #2026-0170", tipo: "Orçamento", data: addDays(TODAY, -2) }],
    galeria: [],
    prontuario: [],
    anamnese: [],
    timeline: tl([
      { kind: "orcamento", data: addDays(TODAY, -2), titulo: "Orçamento enviado", descricao: "#2026-0170 — Toxina botulínica terço superior", valor: 1350 },
      { kind: "mensagem", data: addDays(TODAY, -3), titulo: "Primeiro contato — WhatsApp", descricao: "Respondido em 6 min" },
      { kind: "nota", data: addDays(TODAY, -4), titulo: "Lead capturado", descricao: "Anúncio Instagram — campanha Agosto" },
    ]),
  },
];

export function patientById(id: string): Patient | undefined {
  return PATIENTS.find((p) => p.id === id);
}

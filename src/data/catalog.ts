import type { Procedure, PackageTemplate, Product, StockMovement } from "@/types";
import { TODAY, addDays } from "@/lib/format";

export const PROCEDURES: Procedure[] = [
  { id: "pc1", nome: "Consulta dermatológica", categoria: "Consulta", duracaoMin: 40, preco: 450, comissaoPct: 60, salaId: "r1", materiais: [], retornoDias: 180 },
  { id: "pc2", nome: "Avaliação estética", categoria: "Avaliação", duracaoMin: 30, preco: 0, comissaoPct: 0, salaId: "r1", materiais: [], retornoDias: 30 },
  { id: "pc3", nome: "Limpeza de pele profunda", categoria: "Estética facial", duracaoMin: 60, preco: 320, comissaoPct: 35, salaId: "r3", materiais: ["Ácido salicílico 2%", "Máscara calmante", "Gaze estéril"], retornoDias: 30 },
  { id: "pc4", nome: "Peeling químico", categoria: "Estética facial", duracaoMin: 45, preco: 480, comissaoPct: 35, salaId: "r3", materiais: ["Solução de peeling", "Neutralizante", "Protetor solar FPS 50"], retornoDias: 21 },
  { id: "pc5", nome: "Toxina botulínica (Botox)", categoria: "Injetáveis", duracaoMin: 40, preco: 1350, comissaoPct: 45, salaId: "r3", materiais: ["Toxina botulínica 100U", "Agulha 30G", "Anestésico tópico"], retornoDias: 120 },
  { id: "pc6", nome: "Preenchimento com ácido hialurônico", categoria: "Injetáveis", duracaoMin: 50, preco: 2100, comissaoPct: 45, salaId: "r3", materiais: ["Ácido hialurônico 1ml", "Cânula 25G", "Anestésico tópico"], retornoDias: 365 },
  { id: "pc7", nome: "Bioestimulador de colágeno", categoria: "Injetáveis", duracaoMin: 50, preco: 2600, comissaoPct: 40, salaId: "r3", materiais: ["Bioestimulador frasco", "Água para injeção", "Lidocaína 2%"], retornoDias: 180 },
  { id: "pc8", nome: "Laser CO2 fracionado", categoria: "Laser", duracaoMin: 45, preco: 1800, comissaoPct: 40, salaId: "r4", materiais: ["Pontas descartáveis", "Gel condutor", "Pomada cicatrizante"], retornoDias: 90 },
  { id: "pc9", nome: "Depilação a laser (sessão)", categoria: "Laser", duracaoMin: 30, preco: 260, comissaoPct: 30, salaId: "r4", materiais: ["Gel refrigerante"], retornoDias: 40 },
  { id: "pc10", nome: "Microagulhamento facial", categoria: "Estética facial", duracaoMin: 50, preco: 620, comissaoPct: 35, salaId: "r3", materiais: ["Caneta com agulhas", "Sérum de vitamina C", "Máscara pós-procedimento"], retornoDias: 30 },
];

export function procedureById(id: string): Procedure | undefined {
  return PROCEDURES.find((p) => p.id === id);
}

export const PACKAGE_TEMPLATES: PackageTemplate[] = [
  { id: "pk1", nome: "Protocolo Facial Premium", procedimentoId: "pc3", sessoes: 10, preco: 2490, validadeDias: 300 },
  { id: "pk2", nome: "Peeling Progressivo", procedimentoId: "pc4", sessoes: 6, preco: 2280, validadeDias: 180 },
  { id: "pk3", nome: "Full Body Laser", procedimentoId: "pc9", sessoes: 10, preco: 1990, validadeDias: 365 },
  { id: "pk4", nome: "Skinbooster Anual", procedimentoId: "pc10", sessoes: 4, preco: 2100, validadeDias: 365 },
];

export function packageTemplateById(id: string): PackageTemplate | undefined {
  return PACKAGE_TEMPLATES.find((p) => p.id === id);
}

export const PRODUCTS: Product[] = [
  { id: "prod1", nome: "Toxina botulínica 100U", categoria: "Injetáveis", estoque: 12, estoqueMinimo: 8, unidade: "frasco", custo: 620, precoVenda: 0, validade: addDays(TODAY, 210), fornecedor: "Allergan Dist." },
  { id: "prod2", nome: "Ácido hialurônico 1ml", categoria: "Injetáveis", estoque: 5, estoqueMinimo: 6, unidade: "seringa", custo: 780, precoVenda: 0, validade: addDays(TODAY, 160), fornecedor: "Rennova" },
  { id: "prod3", nome: "Protetor solar FPS 50 (revenda)", categoria: "Dermocosméticos", estoque: 3, estoqueMinimo: 10, unidade: "un", custo: 62, precoVenda: 149, validade: addDays(TODAY, 400), fornecedor: "La Roche" },
  { id: "prod4", nome: "Sérum vitamina C 20% (revenda)", categoria: "Dermocosméticos", estoque: 18, estoqueMinimo: 8, unidade: "un", custo: 88, precoVenda: 210, validade: addDays(TODAY, 320), fornecedor: "Skinceuticals" },
  { id: "prod5", nome: "Agulha 30G", categoria: "Descartáveis", estoque: 240, estoqueMinimo: 100, unidade: "un", custo: 0.8, precoVenda: 0, validade: addDays(TODAY, 720), fornecedor: "BD Medical" },
  { id: "prod6", nome: "Bioestimulador de colágeno", categoria: "Injetáveis", estoque: 4, estoqueMinimo: 5, unidade: "frasco", custo: 1200, precoVenda: 0, validade: addDays(TODAY, 45), fornecedor: "Galderma" },
  { id: "prod7", nome: "Máscara calmante pós-procedimento", categoria: "Insumos", estoque: 60, estoqueMinimo: 20, unidade: "un", custo: 14, precoVenda: 0, validade: addDays(TODAY, 260), fornecedor: "Adcos Pro" },
  { id: "prod8", nome: "Pomada cicatrizante", categoria: "Insumos", estoque: 22, estoqueMinimo: 10, unidade: "bisnaga", custo: 38, precoVenda: 0, validade: addDays(TODAY, 30), fornecedor: "Cicatricure Pro" },
];

export const LOW_STOCK = PRODUCTS.filter((p) => p.estoque < p.estoqueMinimo);
export const EXPIRING_SOON = PRODUCTS.filter((p) => p.validade.getTime() - TODAY.getTime() < 60 * 86_400_000);

export const STOCK_MOVEMENTS: StockMovement[] = [
  { id: "sm1", data: addDays(TODAY, -1), produto: "Toxina botulínica 100U", tipo: "saida", quantidade: 1, motivo: "Aplicação — Marina Souza", responsavel: "Dra. Mariana Costa" },
  { id: "sm2", data: addDays(TODAY, -2), produto: "Ácido hialurônico 1ml", tipo: "saida", quantidade: 2, motivo: "Preenchimento — Beatriz Lima", responsavel: "Dra. Mariana Costa" },
  { id: "sm3", data: addDays(TODAY, -3), produto: "Protetor solar FPS 50 (revenda)", tipo: "saida", quantidade: 2, motivo: "Venda balcão", responsavel: "Juliana Prado" },
  { id: "sm4", data: addDays(TODAY, -4), produto: "Toxina botulínica 100U", tipo: "entrada", quantidade: 10, motivo: "NF 88213 — Allergan", responsavel: "André Lima" },
  { id: "sm5", data: addDays(TODAY, -6), produto: "Sérum vitamina C 20% (revenda)", tipo: "entrada", quantidade: 20, motivo: "NF 41120 — Skinceuticals", responsavel: "André Lima" },
  { id: "sm6", data: addDays(TODAY, -7), produto: "Agulha 30G", tipo: "saida", quantidade: 30, motivo: "Consumo semanal", responsavel: "Dra. Camila Alves" },
];

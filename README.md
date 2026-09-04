# Aurora — Gestão + CRM para Clínicas

[Clique aqui para acessar o Site]([https://miguel-boff-moura.github.io])

Protótipo navegável de um SaaS de gestão clínica e CRM, inspirado nas melhores
ideias de produtos como iClinic e Gestek — sem copiar identidade, textos ou
layout — com uma UX mais moderna, limpa e comercial.

> 100% front-end. Nenhum backend: os dados são mockados em `src/data/`.

## Stack

- **React 18 + TypeScript**
- **Vite 6**
- **Tailwind CSS v4** (tokens de tema em `src/index.css`)
- **React Router 6**
- **Recharts** (gráficos)
- **Lucide** (ícones)

## Rodando

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # build de produção em dist/
npm run preview  # serve o build
```

## Conceito

O produto acompanha a **jornada completa do paciente**, não só a consulta:

```
Paciente/Lead → CRM → Agendamento → Atendimento → Prontuário/Anamnese
   → Procedimento/Venda → Financeiro → Pós-atendimento/Retorno
```

### Fluxos implementados (navegáveis)

| Fluxo | Caminho no protótipo |
|---|---|
| Lead → conversão | CRM (pipeline arrastável) → orçamento → WhatsApp → agenda |
| Novo paciente → atendimento | Pacientes → ficha → Agendar → Atendimentos → workspace → finalizar |
| Pacote → consumo de sessão | Perfil do paciente ▸ Pacotes · Atendimento ▸ "consumir sessão" |
| Retorno clínico | "Anel de retorno" calculado por procedimento (Dashboard, Perfil) |

## Arquitetura

```
src/
├── main.tsx / App.tsx        # bootstrap + rotas
├── index.css                 # design tokens (paleta, tipografia, raios, sombras)
├── types.ts                  # modelo de domínio
├── lib/                      # format (datas/moeda pt-BR), cn
├── data/                     # dados mockados + seletores derivados
│   ├── core · catalog · patients · agenda · crm · finance · comms
│   └── index.ts              # re-export + KPIs, funil, janelas de retorno
├── components/
│   ├── layout/               # AppLayout, Sidebar (recolhível), Topbar (busca global)
│   ├── ui/                   # Button, Card, Badge, Tabs, Modal, SlideOver,
│   │                         # Toast, StatCard, EmptyState/Skeleton, ReturnRing…
│   ├── charts/               # wrappers Recharts (área, ranking, donut, barras)
│   ├── AppointmentDetail · TimelineFeed · QuickActions
└── pages/                    # 1 arquivo por tela
```

### Telas prioritárias (completas e conectadas)

1. **Dashboard** — resumo do dia, timeline da agenda, janelas de retorno, indicadores, ações rápidas
2. **Agenda** — dia / semana / mês, filtros (profissional, sala, procedimento, status), painel lateral do agendamento
3. **Pacientes** — CRM em tabela, 9 filtros inteligentes, busca
4. **Perfil do paciente** — 9 abas (Resumo, Histórico, Prontuário, Anamnese, Procedimentos, Pacotes, Financeiro, Documentos, Galeria)
5. **CRM** — pipeline Kanban com drag & drop entre 7 etapas
6. **Atendimento** — fila clínica + workspace (7 abas + resumo lateral do paciente)
7. **Financeiro** — visão geral com gráficos, a receber, a pagar, transações, comissões, formas de pagamento

### Demais telas (estrutura + dados)

Prontuários · Procedimentos · Pacotes · Vendas & Orçamentos (com montador de
orçamento) · Estoque (alertas de mínimo/validade) · Relatórios · Comunicação
(inbox WhatsApp, mensagens automáticas, campanhas) · Configurações (clínica,
profissionais, usuários, permissões por papel, salas/unidades, integrações).

## Tema

Toda a identidade visual sai dos tokens em `@theme` (`src/index.css`). Trocar os
valores de `--color-primary*` re-tematiza o produto inteiro (há uma paleta
"Índigo Clínico" comentada no arquivo como exemplo).

## Dados de demonstração

Clínica Aurora · Dra. Mariana Costa, Dr. Rafael Mendes, Dra. Camila Alves ·
8 pacientes com histórico completo · data de referência: **30/08/2026**.

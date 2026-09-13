# Contexto do Projeto — SaaS Clínica

Este arquivo dá contexto de negócio e escopo para qualquer trabalho de código feito neste
repositório. Leia antes de implementar ou alterar funcionalidades.

## Sobre o projeto
Sistema sob medida para uma clínica de estética (procedimentos como Botox e preenchedores).
Cliente final tem dois tipos de usuário:
- **Administrador/secretária**: acesso completo (agenda, financeiro, estoque, configurações).
- **Paciente**: acesso restrito — só vê e altera a própria agenda e o próprio financeiro.

A dona da clínica (chamaremos de "a doutora" no restante deste documento) hoje opera tudo
manualmente via planilha Excel e WhatsApp pessoal. O maior problema relatado por ela é a
gestão da agenda e a falta de automação nos lembretes de retorno.

## Modelo comercial (não é escopo técnico, mas afeta prioridades)
- Investimento inicial: R$ 6.500 (parcelado 50/50: início e entrega)
- Mensalidade R$ 147,90: cobre apenas hospedagem + banco de dados + domínio
- Manutenção/correção de bugs: gratuita, sob demanda
- IA está fora de escopo (custo recorrente não compensa nesta fase)
- Entrega deve ser incremental, priorizando o essencial primeiro

## Requisitos funcionais por módulo

### 1. Configurações e cadastros
- Dados da clínica
- Cadastro de profissionais/atendentes
- Cadastro de usuários (perfil admin x perfil paciente)
- Catálogo de procedimentos com preço definido, organizado por tipo/sessão

### 2. Agendamento
- CRUD de agendamento: paciente, procedimento (já traz duração padrão), celular
- Paciente tem portal próprio: pode remarcar sua própria agenda (não vê o resto do sistema)
- Retorno pós-procedimento (ex: Botox = 15 dias) e manutenção periódica (ex: Botox = 5 meses)
  são registrados **manualmente** por atendimento — o sistema não define isso sozinho
- Sinalização visual de vencimento próximo (ex.: aviso amarelo faltando ~10 dias)
- Regra importante: se o paciente já confirmou/respondeu, **não repetir** o disparo de aviso
  (checar status no banco antes de disparar)

### 3. Mensageria automática (WhatsApp)
- Formato usado hoje pela clínica e que deve ser mantido: disparo **1 dia antes + 2h antes**
  do atendimento (mínimo aceitável pela doutora: 24h antes)
- Mensagens configuráveis, cada uma pode ser ativada/desativada individualmente:
  - Pós-atendimento (cuidados)
  - Vencimento de manutenção
  - Campanhas pontuais
- **Restrição explícita da cliente**: ela não quer excesso de mensagens. Só vencimento de
  manutenção + campanha vigente no momento. Nada de mensagens contínuas/spam.
  (Obs.: "aniversário" apareceu na reunião só como exemplo didático de mensagem configurável,
  não é um requisito real — não faz parte do escopo.)
- Depende de integração com API do WhatsApp Business (serviço externo, fora do controle
  total da equipe — tratar como frente de risco/prazo separada)

### 4. Campanhas
- Cadastradas uma única vez, depois só ativa/desativa (não precisa recadastrar)
- Exemplos citados: Dia dos Namorados, Natal com desconto
- Depende do módulo de mensageria (item 3) estar pronto

### 5. Financeiro
- Relatório mensal: total vendido, por cliente, por procedimento, gráfico de entradas/saídas
- Fechamento de mês: gerar/baixar relatório e arquivar histórico
- **Controle de pendências informais** (diferente de cobrança recorrente):
  - Pacientes que pagam parcelado sem contrato fixo (valor e frequência variáveis)
  - Registro de comprovante e baixa manual
  - Filtro por mês/data de vencimento
- Pacientes recorrentes com data fixa (ex.: todo 5º dia útil, valor fixo)

### 6. Nota fiscal / integração bancária
- Cliente quer nota fiscal **por atendimento** (hoje é uma nota mensal consolidada)
- Nota deve separar produto x mão de obra
- Depende de integração com banco/maquininha de terceiros — **não está 100% sob controle
  da equipe**. A própria doutora vai intermediar contato com o banco/adquirente.
- Maior complexidade e maior risco de atraso do projeto inteiro

### 7. Estoque
- Escopo pequeno (~8 itens): toxina botulínica e preenchedores (cada preenchedor é
  específico por região — lábio, rosto, etc.)
- Controle simples de entrada/saída e contagem — não precisa ser robusto
- Baixa prioridade, baixa complexidade

## Roadmap de entrega (ordem de prioridade)
1. **Fundação e configurações** — cadastros base (clínica, profissionais, usuários, procedimentos). Sem dependência externa.
2. **Agendamento core + portal do paciente** — resolve o problema nº 1 relatado (gestão de agenda).
3. **Lógica de retorno e manutenção** — registro manual + sinalização visual, ainda sem envio real de mensagem.
4. **Integração com WhatsApp API** — maior risco externo; iniciar contratação/homologação do provedor em paralelo às etapas 1–2.
5. **Financeiro** (relatórios e pendências) — alta complexidade interna, sem dependência externa.
6. **Estoque** — pode entrar em paralelo com qualquer etapa acima.
7. **Campanhas** — depende da etapa 4 concluída.
8. **Nota fiscal e integração bancária** — maior complexidade e dependência de terceiros; tratar como frente separada assim que os terceiros confirmarem a integração.

## Stack técnica
- **Frontend**: Vite + React + TypeScript + Tailwind v4 (já implementado como protótipo navegável, dados mockados em `src/data/`)
- **Backend/DB/Auth**: Supabase (Postgres + Auth + Storage) — decidido em 2026-09-12
  - Motivo: mensalidade fechada (R$147,90) só cobre hospedagem+DB+domínio, free tier do Supabase cobre fase inicial
  - Auth via Supabase Auth (JWT) + RLS por role (admin/paciente) resolve módulo 1.1/1.2 sem middleware próprio
  - Postgres relacional serve bem relatórios financeiros agregados (módulo 5)
  - Client JS do Supabase conecta direto do front Vite, sem precisar migrar pra Next.js
- **Hospedagem**: a definir (candidato: Vercel, já há plugin configurado)
- **Provedor WhatsApp API**: a definir — ver módulo 3.1 em `divisao-funcionalidades.md`

## Convenções de trabalho

### Branches
- Uma branch por funcionalidade/item do roadmap: `feat/<módulo>-<descrição-curta>`
  (ex: `feat/1.1-auth-login`, `feat/2.1-agendamento-crud`)
- Sai de `main`, só volta pra `main` depois de testada (checklist de segurança abaixo)
- Correções de bug: `fix/<descrição-curta>`

### Commits — Conventional Commits, descrição em português
```
tipo(escopo): descrição curta no imperativo

Corpo explicando o quê e por quê (não o como) — opcional para mudanças pequenas.
```
Tipos usados neste projeto: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `security`.

### Checklist de segurança antes de cada commit
1. Nenhum arquivo `.env*` com segredo real commitado (`git status` + `git check-ignore`)
2. Toda tabela nova no Supabase tem RLS habilitado e policy testada manualmente
   (usuário não deve ler/escrever fora do próprio escopo — testar como paciente E como admin)
3. `npx tsc --noEmit` sem erro
4. `npm run build` sem erro
5. Fluxo testado manualmente no navegador (login, CRUD, etc conforme a funcionalidade)

## Fonte
Este documento foi consolidado a partir de transcrições de reunião com a cliente
(levantamento de requisitos e negociação comercial). Ver `docs/requisitos-reuniao-cliente.md`
para o levantamento completo, com falas e contexto adicional.

# Divisão de Funcionalidades — SaaS Clínica

> Documento de trabalho para dividir o sistema em partes produzíveis individualmente,
> que depois se conectam entre si. Cada funcionalidade tem: dificuldade, prioridade,
> processo completo de produção (documentação → modelagem → backend → frontend → testes),
> dependências (o que precisa estar pronto antes) e conexões (com o que ela se liga).

## Legenda
- **Dificuldade:** 🟢 Fácil · 🟡 Média · 🔴 Difícil
- **Prioridade:** 🔵 Baixa · 🟣 Média · ⚫ Alta
- **Status:** ⬜ A fazer · 🔄 Em andamento · ✅ Concluído
  *(atualizem esse campo manualmente conforme o que já existe no repositório)*

---

## MÓDULO 1 — Fundação e Configurações
*Base do sistema. Sem dependência externa. Deve ser feito primeiro, tudo o resto se conecta aqui.*

### 1.1 Autenticação e login
- **Dificuldade:** 🟡 Média — **Prioridade:** ⚫ Alta — **Status:** ✅ (Supabase Auth, tela de login, sessão protege rotas)
- **Depende de:** nada (é o ponto de partida)
- **Conecta com:** todos os módulos (todo acesso ao sistema passa por aqui)
- **Processo de produção:**
  1. Documentação: definir regras de sessão (tempo de expiração, recuperação de senha)
  2. Modelagem: tabela de usuários (email/telefone, senha hash, perfil)
  3. Backend: rota de login, geração de token (JWT ou sessão), middleware de proteção de rotas
  4. Frontend: tela de login, tratamento de erro (senha errada, usuário inexistente)
  5. Testes: login válido/inválido, expiração de sessão, tentativa de acesso sem token
- **Requisitos para produzir:** decisão de estratégia de auth (JWT, sessão, biblioteca de auth pronta ou própria)

### 1.2 Cadastro de usuários e perfis (permissões)
- **Dificuldade:** 🟡 Média — **Prioridade:** ⚫ Alta — **Status:** 🔄 (tabela `profiles` com role admin/paciente + RLS prontos; falta UI de cadastro e bloqueio de rotas por perfil no front)
- **Depende de:** 1.1 (login)
- **Conecta com:** 2.3 (portal do paciente), todos os módulos que têm visão restrita
- **Processo de produção:**
  1. Documentação: matriz de permissões (o que admin vê x o que paciente vê)
  2. Modelagem: campo de perfil/role na tabela de usuário, tabela de permissões se for granular
  3. Backend: middleware de checagem de permissão por rota
  4. Frontend: telas diferentes por perfil (esconder/bloquear o que não é permitido)
  5. Testes: paciente tentando acessar rota de admin (deve bloquear)
- **Requisitos para produzir:** matriz de permissões fechada com a doutora (o que exatamente o paciente pode ver/editar)

### 1.3 Cadastro de dados da clínica
- **Dificuldade:** 🟢 Fácil — **Prioridade:** 🔵 Baixa — **Status:** ⬜
- **Depende de:** 1.1
- **Conecta com:** relatórios (módulo 5), tela de configurações geral
- **Processo de produção:**
  1. Modelagem: tabela simples (nome, endereço, contato, horário de funcionamento)
  2. Backend: CRUD básico
  3. Frontend: formulário de edição em "Configurações"
  4. Testes: salvar e recuperar dados
- **Requisitos para produzir:** nenhum externo

### 1.4 Cadastro de profissionais/atendentes
- **Dificuldade:** 🟢 Fácil — **Prioridade:** 🟣 Média — **Status:** ⬜
- **Depende de:** 1.1, 1.2
- **Conecta com:** 2.1 (agendamento, para vincular quem atende)
- **Processo de produção:**
  1. Modelagem: tabela de profissional (nome, especialidade, vínculo com usuário do sistema)
  2. Backend: CRUD
  3. Frontend: tela de cadastro/listagem
  4. Testes: CRUD completo
- **Requisitos para produzir:** nenhum externo

### 1.5 Catálogo de procedimentos (nome, preço, duração)
- **Dificuldade:** 🟢 Fácil — **Prioridade:** ⚫ Alta — **Status:** ⬜
- **Depende de:** 1.1
- **Conecta com:** 2.1 (agendamento puxa duração/preço automaticamente), 5.x (financeiro)
- **Processo de produção:**
  1. Modelagem: tabela de procedimento (nome, preço, duração padrão, categoria/sessão)
  2. Backend: CRUD
  3. Frontend: tela de cadastro, exibição organizada por categoria
  4. Testes: CRUD, validação de preço/duração
- **Requisitos para produzir:** lista real de procedimentos e preços fornecida pela doutora

---

## MÓDULO 2 — Agendamento
*Resolve o problema nº 1 relatado pela doutora: gestão da agenda.*

### 2.1 Modelagem e CRUD de agendamento
- **Dificuldade:** 🟡 Média — **Prioridade:** ⚫ Alta — **Status:** ⬜
- **Depende de:** 1.4, 1.5
- **Conecta com:** 2.2, 2.3, 3.x (mensageria), 5.x (financeiro puxa dados de atendimento)
- **Processo de produção:**
  1. Documentação: regras de conflito de horário (não permitir dois agendamentos no mesmo slot)
  2. Modelagem: tabela de agendamento (paciente, procedimento, profissional, data/hora, status)
  3. Backend: criar/editar/cancelar agendamento, checagem de conflito de horário
  4. Frontend: formulário simples (o que já foi citado: selecionar procedimento, nome e celular do paciente)
  5. Testes: conflito de horário, cancelamento, edição
- **Requisitos para produzir:** nenhum externo

### 2.2 Painel de agenda (visão secretária)
- **Dificuldade:** 🟡 Média — **Prioridade:** ⚫ Alta — **Status:** ⬜
- **Depende de:** 2.1
- **Conecta com:** dashboard geral do sistema
- **Processo de produção:**
  1. Frontend: visão dia/semana/mês, com indicador de horários livres/ocupados
  2. Backend: endpoints de consulta por período
  3. Testes: performance com muitos agendamentos, filtros por data
- **Requisitos para produzir:** definição de UX com a doutora (como ela quer visualizar — lista ou calendário)

### 2.3 Portal do paciente (agenda própria)
- **Dificuldade:** 🟡 Média — **Prioridade:** 🟣 Média — **Status:** ⬜
- **Depende de:** 1.2 (permissões), 2.1
- **Conecta com:** 3.x (paciente confirma e isso cancela disparo de lembrete)
- **Processo de produção:**
  1. Backend: rota restrita ao próprio paciente (não pode ver agenda de outros)
  2. Frontend: tela simplificada de "meus agendamentos" com opção de remarcar
  3. Testes: paciente só vê e altera o próprio agendamento
- **Requisitos para produzir:** nenhum externo

### 2.4 Registro de retorno e manutenção + sinalização visual
- **Dificuldade:** 🟡 Média — **Prioridade:** 🟣 Média — **Status:** ⬜
- **Depende de:** 2.1
- **Conecta com:** 3.3/3.4 (motor de disparo automático usa essa data como gatilho)
- **Processo de produção:**
  1. Modelagem: campos de data de retorno (15 dias) e data de manutenção (5 meses) vinculados ao atendimento
  2. Backend: cálculo/registro dessas datas (registro é manual, conforme pedido da doutora)
  3. Frontend: campo no formulário de atendimento + indicador visual (ex: cor amarela quando está próximo do vencimento)
  4. Testes: cálculo de proximidade de vencimento, exibição correta do alerta
- **Requisitos para produzir:** nenhum externo (é lógica interna, mensagem real vem no módulo 3)

---

## MÓDULO 3 — Mensageria automática (WhatsApp)
*Maior dependência externa do projeto junto com o módulo 6. Recomendo iniciar a pesquisa de provedor em paralelo aos módulos 1 e 2.*

### 3.1 Pesquisa e contratação do provedor de WhatsApp Business API
- **Dificuldade:** 🔴 Difícil — **Prioridade:** ⚫ Alta — **Status:** ⬜
- **Depende de:** nada tecnicamente, mas é bloqueante para todo o módulo 3
- **Conecta com:** todo o restante do módulo 3
- **Processo de produção:**
  1. Documentação: pesquisa comparativa de provedores (custo, limite de mensagens, facilidade de API)
  2. Definição: escolha do provedor e criação de conta/aprovação do número comercial
  3. Testes: envio de mensagem de teste via sandbox do provedor
- **Requisitos para produzir:** número de telefone comercial da clínica, aprovação do Meta/WhatsApp Business (pode levar dias), orçamento definido para o serviço (mensal, fora da mensalidade de R$ 147,90 já combinada — **isso precisa ser esclarecido com a doutora**)

### 3.2 Integração técnica (webhook, tokens, autenticação)
- **Dificuldade:** 🔴 Difícil — **Prioridade:** ⚫ Alta — **Status:** ⬜
- **Depende de:** 3.1
- **Conecta com:** 3.3
- **Processo de produção:**
  1. Backend: configurar webhook de recebimento de status de mensagem (entregue/lido/respondido)
  2. Backend: armazenar tokens de forma segura (variáveis de ambiente/secret manager)
  3. Testes: envio e recebimento de status via ambiente de homologação do provedor
- **Requisitos para produzir:** credenciais do provedor escolhido em 3.1

### 3.3 Motor de disparo automático (lembretes de agendamento)
- **Dificuldade:** 🔴 Difícil — **Prioridade:** ⚫ Alta — **Status:** ⬜
- **Depende de:** 2.1, 3.2
- **Conecta com:** 2.3 (confirmação do paciente deve cancelar o disparo restante)
- **Processo de produção:**
  1. Documentação: regra exata — disparo 1 dia antes + 2h antes do atendimento
  2. Backend: job agendado (cron/scheduler) que varre agendamentos futuros e dispara na janela certa
  3. Backend: lógica condicional — se já houve confirmação/resposta, não repetir disparo
  4. Testes: simular agendamentos em diferentes horários e checar se dispara certo, sem duplicar
- **Requisitos para produzir:** 3.1 e 3.2 concluídos

### 3.4 Mensagens configuráveis (pós-atendimento, manutenção)
- **Dificuldade:** 🟡 Média — **Prioridade:** 🟣 Média — **Status:** ⬜
- **Depende de:** 3.2, 2.4 (data de manutenção)
- **Conecta com:** 4.x (campanhas usam a mesma infraestrutura de disparo)
- **Processo de produção:**
  1. Modelagem: tabela de "tipo de mensagem" com texto configurável e status ativo/inativo
  2. Backend: gatilhos por tipo (manutenção = data calculada em 2.4)
  3. Frontend: painel para a secretária ativar/desativar cada tipo de mensagem individualmente
  4. Testes: disparo correto por tipo, sem duplicidade
- **Requisitos para produzir:** textos-padrão das mensagens definidos com a doutora; **atenção**: ela pediu explicitamente para não haver excesso de mensagens — só manutenção + campanha vigente
  (não incluir "aniversário" — foi só um exemplo didático na reunião, não é requisito real)

---

## MÓDULO 4 — Campanhas
*Depende do módulo 3 pronto (reaproveita a mesma infraestrutura de disparo).*

### 4.1 Cadastro de campanha
- **Dificuldade:** 🟢 Fácil — **Prioridade:** 🔵 Baixa — **Status:** ⬜
- **Depende de:** 1.5 (procedimentos, para aplicar desconto), 3.4
- **Conecta com:** 4.2
- **Processo de produção:**
  1. Modelagem: tabela de campanha (nome, regra de desconto, procedimentos aplicáveis, período de vigência)
  2. Backend: CRUD
  3. Frontend: formulário de criação
  4. Testes: cálculo de desconto aplicado corretamente
- **Requisitos para produzir:** nenhum externo

### 4.2 Ativação/desativação sem recadastrar + disparo em massa
- **Dificuldade:** 🟡 Média — **Prioridade:** 🔵 Baixa — **Status:** ⬜
- **Depende de:** 4.1, 3.3
- **Conecta com:** módulo 3 (reutiliza o motor de disparo)
- **Processo de produção:**
  1. Backend: toggle de ativo/inativo, disparo para todos os pacientes elegíveis quando ativada
  2. Frontend: botão simples de ativar/desativar
  3. Testes: campanha ativada dispara só uma vez, não repete
- **Requisitos para produzir:** módulo 3 funcional

---

## MÓDULO 5 — Financeiro
*Alta complexidade interna, mas sem dependência externa (diferente do módulo 6).*

### 5.1 Relatório mensal (entradas/saídas, gráfico)
- **Dificuldade:** 🟡 Média — **Prioridade:** 🟣 Média — **Status:** ⬜
- **Depende de:** 2.1, 1.5
- **Conecta com:** 1.3 (dados da clínica no cabeçalho do relatório)
- **Processo de produção:**
  1. Modelagem: consultas agregando atendimentos realizados por período
  2. Backend: endpoint de relatório com filtro de mês
  3. Frontend: dashboard com gráfico (biblioteca de gráficos)
  4. Testes: soma correta de valores, filtro de período
- **Requisitos para produzir:** nenhum externo

### 5.2 Fechamento de mês e exportação/arquivamento
- **Dificuldade:** 🟡 Média — **Prioridade:** 🔵 Baixa — **Status:** ⬜
- **Depende de:** 5.1
- **Conecta com:** nada além do próprio módulo
- **Processo de produção:**
  1. Backend: geração de snapshot do relatório do mês fechado
  2. Backend: exportação em formato de arquivo (PDF ou planilha)
  3. Frontend: botão de "baixar relatório do mês"
  4. Testes: exportação com dados corretos
- **Requisitos para produzir:** decidir formato de exportação preferido (PDF x planilha)

### 5.3 Controle de pendências informais (parcelamento sem contrato fixo)
- **Dificuldade:** 🔴 Difícil — **Prioridade:** ⚫ Alta — **Status:** ⬜
- **Depende de:** 2.1
- **Conecta com:** 5.1 (pendências entram no relatório geral)
- **Processo de produção:**
  1. Documentação: fluxo exato de registro (valor pendente → recebimento de comprovante → baixa manual)
  2. Modelagem: tabela de pendência (paciente, valor total, valor já pago, histórico de baixas, datas de vencimento)
  3. Backend: CRUD de pendência + lógica de baixa parcial
  4. Frontend: tela de listagem com filtro por mês/data de vencimento (o Excel manual que ela usa hoje)
  5. Testes: baixa parcial, cálculo de saldo restante, filtro por data
- **Requisitos para produzir:** nenhum externo — é a funcionalidade mais pedida pela doutora nessa área, priorizar

### 5.4 Cobrança recorrente com data fixa
- **Dificuldade:** 🟡 Média — **Prioridade:** 🟣 Média — **Status:** ⬜
- **Depende de:** 5.3
- **Conecta com:** 3.4 (poderia futuramente disparar lembrete de cobrança, mas não foi pedido explicitamente)
- **Processo de produção:**
  1. Modelagem: campo de recorrência (ex: todo 5º dia útil) na tabela de pendência
  2. Backend: geração automática da próxima parcela ao fechar a atual
  3. Frontend: indicador de "próximo vencimento"
  4. Testes: geração correta considerando dias úteis
- **Requisitos para produzir:** nenhum externo

---

## MÓDULO 6 — Nota fiscal e integração bancária
*Maior complexidade e maior dependência de terceiros do projeto inteiro. Só a doutora e o banco/adquirente confirmam a viabilidade — tratar como frente separada.*

### 6.1 Levantamento com terceiros (banco/adquirente)
- **Dificuldade:** 🔴 Difícil — **Prioridade:** 🟣 Média — **Status:** ⬜
- **Depende de:** nada tecnicamente, mas bloqueia todo o módulo 6
- **Conecta com:** todo o restante do módulo 6
- **Processo de produção:**
  1. Documentação: contato com o banco/adquirente da clínica para saber quais dados/API eles fornecem (ID de cliente, chave, forma de pagamento)
  2. Definição: formato de integração disponível (webhook, API REST, arquivo)
- **Requisitos para produzir:** a doutora precisa intermediar o contato com o banco, conforme combinado na reunião

### 6.2 Integração de pagamento vinculado ao sistema
- **Dificuldade:** 🔴 Difícil — **Prioridade:** 🟣 Média — **Status:** ⬜
- **Depende de:** 6.1, 2.1
- **Conecta com:** 6.3
- **Processo de produção:**
  1. Backend: receber confirmação de pagamento (webhook do banco) e vincular ao atendimento correspondente
  2. Testes: simulação de pagamento em ambiente de homologação do banco
- **Requisitos para produzir:** credenciais/documentação técnica do banco (vem de 6.1)

### 6.3 Emissão de nota fiscal por atendimento
- **Dificuldade:** 🔴 Difícil — **Prioridade:** 🟣 Média — **Status:** ⬜
- **Depende de:** 6.2
- **Conecta com:** 5.1 (nota deve refletir no relatório financeiro)
- **Processo de produção:**
  1. Documentação: regras fiscais (separar produto x mão de obra na nota, conforme pedido)
  2. Backend: integração com serviço de emissão de NFS-e ou serviço terceirizado equivalente
  3. Testes: emissão de nota de teste em ambiente de homologação fiscal
- **Requisitos para produzir:** serviço de emissão de nota fiscal contratado (não incluso na mensalidade combinada — **precisa alinhar custo com a doutora**)

---

## MÓDULO 7 — Estoque
*Baixa prioridade e baixa complexidade — pode ser feito em paralelo com qualquer módulo acima quando sobrar tempo.*

### 7.1 Cadastro de itens de estoque
- **Dificuldade:** 🟢 Fácil — **Prioridade:** 🔵 Baixa — **Status:** ⬜
- **Depende de:** 1.1
- **Conecta com:** 7.2
- **Processo de produção:**
  1. Modelagem: tabela de item (nome, tipo — toxina/preenchedor, quantidade atual)
  2. Backend: CRUD
  3. Frontend: listagem simples
  4. Testes: CRUD completo
- **Requisitos para produzir:** nenhum externo

### 7.2 Registro de entrada/saída
- **Dificuldade:** 🟢 Fácil — **Prioridade:** 🔵 Baixa — **Status:** ⬜
- **Depende de:** 7.1
- **Conecta com:** nada além do próprio módulo
- **Processo de produção:**
  1. Backend: movimentação de estoque (entrada/saída) com histórico
  2. Frontend: botão de registrar movimentação
  3. Testes: saldo correto após movimentações
- **Requisitos para produzir:** nenhum externo

---

## MÓDULO 8 — Documentação e entrega final
*Roda em paralelo, mas fecha por último (documenta o que já está pronto).*

### 8.1 Manual de uso do sistema (passo a passo para a secretária)
- **Dificuldade:** 🟢 Fácil — **Prioridade:** 🟣 Média — **Status:** ⬜
- **Depende de:** cada módulo estar concluído para ser documentado
- **Conecta com:** entrega final ao cliente
- **Processo de produção:**
  1. Documentação: capturas de tela + passo a passo de cada funcionalidade concluída
  2. Revisão: validar linguagem simples (a secretária tem pouca familiaridade com tecnologia)
- **Requisitos para produzir:** módulos finalizados

### 8.2 Documentação técnica do sistema
- **Dificuldade:** 🟢 Fácil — **Prioridade:** 🔵 Baixa — **Status:** ⬜
- **Depende de:** cada módulo
- **Conecta com:** manutenção futura do sistema
- **Processo de produção:**
  1. Documentação: arquitetura, endpoints, modelagem de banco, decisões técnicas
- **Requisitos para produzir:** nenhum externo

---

## Resumo de ordem sugerida (considerando dificuldade + prioridade + dependências)
1. Módulo 1 (Fundação) — tudo aqui é bloqueante para o resto
2. Módulo 2 (Agendamento) — maior prioridade de negócio
3. Módulo 5.3 (pendências financeiras) — pedido explícito e urgente da doutora, sem dependência externa
4. Módulo 3.1/3.2 (iniciar pesquisa e contratação do provedor WhatsApp) — em paralelo aos itens acima, por ter prazo fora do nosso controle
5. Módulo 3.3/3.4 (motor de disparo) — assim que 3.1/3.2 estiverem prontos
6. Módulo 5.1/5.2/5.4 (restante do financeiro)
7. Módulo 4 (Campanhas) — depende do módulo 3
8. Módulo 7 (Estoque) — encaixar em qualquer folga de tempo
9. Módulo 6 (Nota fiscal/banco) — iniciar levantamento (6.1) cedo, mas o desenvolvimento em si é o último por depender totalmente de terceiros
10. Módulo 8 (Documentação) — contínuo, fecha no final

---

## Pontos em aberto para alinhar com a doutora
- Custo do provedor de WhatsApp Business API — não estava incluso na mensalidade de R$ 147,90 combinada
- Custo do serviço de emissão de nota fiscal — idem
- Formato de exportação do relatório mensal (PDF x planilha)

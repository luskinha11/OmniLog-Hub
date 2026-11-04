# UC1 — Planejamento do Desenvolvimento de Software
## Projeto OmniLog Hub — OmniLog Solutions S.A.

## 1. Documento de Visão

### 1.1 Visão geral

O OmniLog Hub é uma plataforma integrada de gestão logística e e-commerce desenvolvida para centralizar operações de clientes, produtos, estoque, pedidos, pagamentos e entregas.

O sistema busca substituir processos isolados por uma solução que conecta os setores da empresa, facilita o acompanhamento das operações e melhora o controle das informações.

### 1.2 Objetivo geral

Desenvolver uma plataforma multiplataforma que permita administrar operações logísticas e comerciais por meio de um sistema web, uma aplicação desktop e um banco de dados centralizado.

### 1.3 Público envolvido

- Cliente: realiza compras e acompanha entregas.
- Operador de Armazém: controla estoque e movimentações.
- Gerente Logístico: acompanha pedidos, rotas e entregas.
- Administrador: gerencia usuários, permissões e configurações.

### 1.4 Escopo

O projeto contempla cadastro e autenticação de usuários, catálogo de produtos, gerenciamento de estoque, processamento de pedidos, controle de entregas, rastreamento, relatórios e administração do sistema.

## 2. Requisitos Funcionais

| Código | Requisito |
|---|---|
| RF01 | O sistema deve permitir o cadastro de clientes. |
| RF02 | O sistema deve permitir login e autenticação de usuários. |
| RF03 | O sistema deve permitir consultar e pesquisar produtos. |
| RF04 | O sistema deve permitir cadastrar, editar e consultar produtos conforme as permissões. |
| RF05 | O sistema deve permitir consultar a disponibilidade de estoque. |
| RF06 | O sistema deve permitir criar pedidos e calcular seus valores. |
| RF07 | O sistema deve reservar produtos no estoque durante o processamento dos pedidos. |
| RF08 | O sistema deve permitir consultar o histórico de pedidos. |
| RF09 | O sistema deve gerar códigos de rastreamento para entregas. |
| RF10 | O sistema deve permitir acompanhar o status das entregas. |
| RF11 | O sistema deve permitir atualizar informações de estoque e movimentações. |
| RF12 | O sistema deve apresentar indicadores e relatórios administrativos. |
| RF13 | O sistema deve controlar o acesso conforme o perfil do usuário. |
| RF14 | O sistema deve registrar operações relevantes para auditoria. |
| RF15 | O sistema deve permitir recuperação de senha por mecanismo temporário e seguro. |
| RF16 | O sistema deve permitir consultar informações de pedidos e entregas pela interface web. |

## 3. Requisitos Não Funcionais

| Código | Requisito |
|---|---|
| RNF01 | O sistema deve utilizar MySQL 8.4 para persistência dos dados. |
| RNF02 | O back-end deve utilizar Node.js com Express. |
| RNF03 | As senhas devem ser armazenadas utilizando hash seguro, como bcrypt. |
| RNF04 | As consultas ao banco devem utilizar parâmetros para reduzir riscos de SQL Injection. |
| RNF05 | As sessões devem utilizar configurações de segurança, incluindo cookies HttpOnly quando aplicável. |
| RNF06 | O sistema deve possuir controle de permissões por perfil de usuário. |
| RNF07 | A interface web deve ser responsiva para computadores e dispositivos móveis. |
| RNF08 | O sistema deve apresentar mensagens claras de erro e confirmação. |
| RNF09 | O código deve ser organizado em módulos para facilitar manutenção. |
| RNF10 | O banco deve utilizar chaves estrangeiras, restrições e transações para preservar a integridade. |
| RNF11 | O tratamento de dados pessoais deve respeitar os princípios da LGPD. |
| RNF12 | O sistema deve possuir rotinas de backup e procedimentos documentados de recuperação. |
| RNF13 | As operações principais devem possuir validações no servidor. |
| RNF14 | O sistema deve ser compatível com Node.js 20 ou superior e MySQL 8.4. |
| RNF15 | As interfaces devem apresentar contraste adequado e permitir navegação por teclado sempre que possível. |

## 4. Atores do Sistema

| Ator | Responsabilidades |
|---|---|
| Cliente | Cadastro, login, consulta de produtos, compras e rastreamento. |
| Operador de Armazém | Controle de estoque, separação e atualização de pedidos. |
| Gerente Logístico | Acompanhamento de rotas, entregas e indicadores. |
| Administrador | Gerenciamento de usuários, permissões e configurações. |

## 5. Casos de Uso

### UC01 — Cadastro de cliente

**Ator:** Cliente.

Fluxo principal:
1. O cliente acessa a tela de cadastro.
2. Informa nome, e-mail e senha.
3. O sistema valida os dados.
4. O sistema verifica se o e-mail já está cadastrado.
5. A senha é protegida por hash.
6. O cadastro é registrado no banco.

Fluxos alternativos:
- Caso o e-mail já exista, o sistema informa que ele está em uso.
- Caso faltem informações, o sistema solicita o preenchimento.

Exceção:
- Se o banco estiver indisponível, o sistema informa que não foi possível concluir o cadastro.

### UC02 — Autenticação de usuário

**Ator:** Cliente, Operador, Gerente ou Administrador.

Fluxo principal:
1. O usuário informa e-mail e senha.
2. O sistema verifica as credenciais.
3. O sistema identifica o perfil de acesso.
4. Uma sessão autenticada é criada.
5. O usuário acessa as funcionalidades autorizadas.

Fluxos alternativos:
- Credenciais incorretas geram uma mensagem de erro.
- Usuário sem permissão não acessa áreas administrativas.

Exceção:
- Falhas de comunicação com o banco impedem a autenticação.

### UC03 — Consulta de produtos

**Ator:** Cliente.

Fluxo principal:
1. O cliente acessa o catálogo.
2. O sistema consulta os produtos ativos.
3. Os produtos são apresentados com preço e categoria.
4. O cliente pode pesquisar os itens disponíveis.

Fluxo alternativo:
- Caso não existam resultados, o sistema informa que nenhum produto foi encontrado.

Exceção:
- Se ocorrer falha na consulta, o sistema apresenta uma mensagem de erro.

### UC04 — Processamento de pedido

**Ator:** Cliente.

Fluxo principal:
1. O cliente seleciona os produtos.
2. Adiciona os itens ao carrinho.
3. Confirma o pedido.
4. O servidor recalcula os valores.
5. O estoque é validado e reservado em uma transação.
6. O pedido é registrado.
7. O sistema disponibiliza as informações do pedido.

Fluxos alternativos:
- Se não houver estoque suficiente, o pedido não é confirmado.
- Se os dados forem inválidos, o sistema solicita a correção.

Exceção:
- Se ocorrer falha durante a transação, as alterações devem ser revertidas.

### UC05 — Controle de estoque

**Ator:** Operador de Armazém.

Fluxo principal:
1. O operador acessa o controle de estoque.
2. Seleciona um produto e um armazém.
3. Informa a movimentação.
4. O sistema verifica a quantidade reservada.
5. A alteração é validada e registrada.

Fluxo alternativo:
- O sistema recusa uma redução que deixe a quantidade abaixo do estoque reservado.

Exceção:
- Se o produto ou armazém não existir, a operação é recusada.

### UC06 — Rastreamento de entrega

**Ator:** Cliente.

Fluxo principal:
1. O cliente informa o código de rastreamento.
2. O sistema consulta a entrega.
3. O sistema apresenta o status atual.
4. O cliente acompanha as atualizações disponíveis.

Fluxo alternativo:
- Caso o código não seja encontrado, o sistema informa que não existem dados correspondentes.

Exceção:
- Caso ocorra falha na consulta, o sistema informa a indisponibilidade temporária.

### UC07 — Administração do sistema

**Ator:** Administrador.

Fluxo principal:
1. O administrador acessa a área administrativa.
2. O sistema verifica suas permissões.
3. O administrador consulta usuários e indicadores.
4. Realiza operações autorizadas.
5. O sistema registra as operações relevantes.

Fluxo alternativo:
- Usuários sem perfil administrativo não podem acessar essa área.

Exceção:
- Falhas de persistência impedem a conclusão da operação.

## 6. Metodologia Scrum

O desenvolvimento foi organizado em quatro Sprints de duas semanas cada, totalizando oito semanas de planejamento.

### Sprint 1 — Estrutura e autenticação

**Duração:** Semanas 1 e 2.

Atividades:
- Levantamento de requisitos.
- Modelagem inicial do banco.
- Configuração do ambiente.
- Desenvolvimento de cadastro e autenticação.
- Implementação inicial do catálogo.

**Resultado esperado:** Estrutura inicial do sistema, banco conectado e autenticação funcionando.

### Sprint 2 — Estoque e pedidos

**Duração:** Semanas 3 e 4.

Atividades:
- Desenvolvimento do controle de estoque.
- Implementação de carrinho e pedidos.
- Reserva de produtos.
- Criação das funcionalidades de consulta de pedidos.
- Implementação do rastreamento.

**Resultado esperado:** Fluxo principal de compra e controle de estoque funcionando.

### Sprint 3 — Operações e aplicação desktop

**Duração:** Semanas 5 e 6.

Atividades:
- Desenvolvimento do painel operacional.
- Implementação de algoritmos logísticos.
- Desenvolvimento da aplicação desktop.
- Integração com a API e o banco.
- Implementação de relatórios.

**Resultado esperado:** Operações administrativas e logísticas integradas.

### Sprint 4 — Testes e entrega

**Duração:** Semanas 7 e 8.

Atividades:
- Execução de testes unitários e funcionais.
- Correção de defeitos.
- Revisão de segurança.
- Produção da documentação técnica.
- Validação das aplicações.
- Preparação da apresentação e entrega.

**Resultado esperado:** Sistema validado, documentado e preparado para apresentação.

## 7. Product Backlog

| ID | Funcionalidade | Prioridade |
|---|---|---|
| PB01 | Cadastro e autenticação | Alta |
| PB02 | Catálogo de produtos | Alta |
| PB03 | Controle de estoque | Alta |
| PB04 | Carrinho e processamento de pedidos | Alta |
| PB05 | Rastreamento de entregas | Alta |
| PB06 | Painel administrativo | Média |
| PB07 | Algoritmos de otimização logística | Alta |
| PB08 | Aplicação desktop | Alta |
| PB09 | Relatórios e indicadores | Média |
| PB10 | Testes e correções | Alta |
| PB11 | Documentação técnica | Média |
| PB12 | Preparação da entrega | Alta |

## 8. Sprint Backlog

| Sprint | Principais tarefas |
|---|---|
| Sprint 1 | Requisitos, banco, ambiente, cadastro, autenticação e catálogo. |
| Sprint 2 | Estoque, carrinho, pedidos, reservas e rastreamento. |
| Sprint 3 | Algoritmos, painel, aplicação desktop, integração e relatórios. |
| Sprint 4 | Testes, correções, segurança, documentação e apresentação. |

## 9. Definition of Done (DoD)

Uma funcionalidade será considerada concluída quando:

- Atender aos critérios de aceitação definidos.
- Possuir validação adequada no servidor.
- Respeitar as permissões dos usuários.
- Tratar erros e situações inesperadas.
- Preservar a integridade dos dados.
- Possuir testes relacionados quando aplicáveis.
- Ter seu código revisado e integrado ao projeto.
- Ter sua documentação atualizada.

## 10. Burndown Charts Simulados

Os dados abaixo representam uma simulação de acompanhamento das quatro Sprints. Não são registros históricos de reuniões ou medições reais.

### Sprint 1 — 40 pontos

| Dia | Trabalho restante |
|---|---:|
| 1 | 40 |
| 2 | 36 |
| 3 | 34 |
| 4 | 30 |
| 5 | 27 |
| 6 | 23 |
| 7 | 19 |
| 8 | 13 |
| 9 | 8 |
| 10 | 0 |

### Sprint 2 — 45 pontos

| Dia | Trabalho restante |
|---|---:|
| 1 | 45 |
| 2 | 42 |
| 3 | 38 |
| 4 | 34 |
| 5 | 30 |
| 6 | 25 |
| 7 | 21 |
| 8 | 15 |
| 9 | 9 |
| 10 | 0 |

### Sprint 3 — 40 pontos

| Dia | Trabalho restante |
|---|---:|
| 1 | 40 |
| 2 | 37 |
| 3 | 33 |
| 4 | 29 |
| 5 | 25 |
| 6 | 21 |
| 7 | 17 |
| 8 | 12 |
| 9 | 6 |
| 10 | 0 |

### Sprint 4 — 35 pontos

| Dia | Trabalho restante |
|---|---:|
| 1 | 35 |
| 2 | 32 |
| 3 | 28 |
| 4 | 25 |
| 5 | 21 |
| 6 | 17 |
| 7 | 13 |
| 8 | 9 |
| 9 | 5 |
| 10 | 0 |

Os valores representam pontos de esforço restantes e foram distribuídos de maneira ilustrativa para demonstrar o acompanhamento do trabalho durante cada Sprint.

## 11. Considerações finais

O planejamento estabelece uma organização para o desenvolvimento do OmniLog Hub, dividindo as funcionalidades em etapas menores e definindo critérios para acompanhar a evolução do projeto.

A utilização do Scrum permite organizar as atividades, acompanhar pendências e validar as entregas ao final de cada Sprint.

Este documento complementa o backlog existente e deve ser atualizado caso ocorram mudanças nos requisitos ou no planejamento.

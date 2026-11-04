# OmniLog Hub — mapa de atendimento das Unidades Curriculares

Este documento relaciona as entregas existentes no projeto às Unidades Curriculares do trabalho. Os itens que dependem de testes manuais, comprovação ou validação com o professor permanecem identificados como pendentes.

| UC | Entrega no projeto | Evidência / situação |
|---|---|---|
| UC 1 — Planejamento | Visão do produto, requisitos, atores, casos de uso, backlog e quatro Sprints | docs/UC1-planejamento.md; Burndowns simulados |
| UC 2 — Algoritmos | Matrizes de distâncias, otimização de rotas e alocação tridimensional de pallets | src/utils/advanced-algorithms.js; tests/advanced-algorithms.test.js; docs/UC2-testes-de-mesa.md |
| UC 3 — Banco de dados | Modelagem MySQL, tabelas, relacionamentos, restrições, índices e consultas | database/; docs/modelagem-banco.md; documentação UC3 |
| UC 4 — POO e estruturas | Classes de domínio, veículos, pagamentos, pilha e fila | src/models/; desktop-java/; docs/UC4-java.md |
| UC 5 — Inglês técnico | Glossário e conteúdo técnico bilíngue | docs/english-technical.md |
| UC 7 — Documentação | Arquitetura, documentação e apresentação | docs/presentation-outline.md |
| UC 8 — Aplicação desktop | Aplicação Java e cliente Electron | desktop-java/; electron/; confirmar toolkit exigido |
| UC 9 — Integração e CRUD | API Express, integração com MySQL e operações do sistema | src/routes/; src/config/database.js |
| UC 10 — Versionamento | Organização do Git e estratégia de versionamento | docs/git-flow.md; histórico do GitHub |
| UC 11 — Testes | Testes automatizados e plano de testes | tests/; docs/test-plan.md; docs/UC10-11.md |
| UC 12 — Front-end | Interface web com HTML, CSS e JavaScript | public/ |
| UC 13 — Back-end | API REST, autenticação e integração com MySQL | src/ |

## Comandos de validação

Os comandos abaixo serão usados para verificar o funcionamento do projeto:

- npm install
- npm run db:check
- npm run admin:check
- npm test
- npm run dev

Para executar o cliente desktop, abra outro terminal e execute npm run desktop.

## Evidências que ainda precisam ser verificadas

- Testes manuais no navegador e nos clientes desktop.
- Capturas reais das telas e consultas.
- Requisitos específicos da interface desktop.
- Funcionalidades completas de CRUD.
- Histórico de branches, commits e pull requests.
- Texto obrigatório de leitura da UC 5, caso exista.
- Testes de desempenho, segurança e implantação.
- Evidências da apresentação e demonstração.

Observação: a UC 6 não aparece no enunciado fornecido para este projeto.

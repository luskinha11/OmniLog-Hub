# OmniLog Hub — mapa de atendimento das Unidades Curriculares

Este mapa organiza o que existe no projeto e quais evidências ainda dependem da execução local ou do enunciado exato. Não substitui a rubrica do professor. A UC 6 não foi recuperada nos materiais disponíveis e permanece pendente de confirmação.

| UC | Entrega no projeto | Evidência / status |
|---|---|---|
| UC 1 — Planejamento | Requisitos, atores, backlog, histórias e critérios de aceite | `docs/backlog.md`; revisar com o enunciado |
| UC 2 — Algoritmos | Vizinho mais próximo, 2-opt e alocação 3D heurística | `src/utils/algorithms.js`; Jest |
| UC 3 — Banco MySQL | DDL, PK/FK, índices, checks, views, procedures, consultas | `database/schema.sql`, `database/queries-uc3.sql`, `docs/modelagem-banco.md` |
| UC 4 — POO e estruturas | Classes Vehicle, Shipment, Payment, Stack e Queue | `src/models/`, `docs/domain-model.md`, Jest |
| UC 5 — Inglês técnico | Glossário e resumo técnico bilíngue do sistema | `docs/english-technical.md`; texto de leitura do professor ainda deve ser anexado, caso exista |
| UC 6 | Enunciado não recuperado | Pendente; não inventar requisito |
| UC 7 — Documentação/apresentação | Roteiro de oito slides, arquitetura e demonstração | `docs/presentation-outline.md`; inserir capturas reais |
| UC 8 — Interface desktop | Cliente desktop Electron reutilizando a interface web e a API | `electron/main.js`; executar `npm run desktop` |
| UC 9 — Integração e CRUD | Cliente web/desktop consome API Express ligada ao MySQL; CRUD e transações | `src/routes/`, `src/config/database.js`; validar no ambiente |
| UC 10 — Versionamento | Estratégia Git Flow e comandos | `docs/git-flow.md`; executar no repositório local |
| UC 11 — Testes | Testes unitários de algoritmos, domínio e estruturas; plano manual | `tests/`, `docs/test-plan.md`; executar `npm test` |
| UC 12 — Front-end web | HTML, CSS roxo/preto e JavaScript com API | `public/`; validar no navegador |
| UC 13 — Back-end web | API REST, autenticação, autorização, MySQL e transações | `src/`; validar com banco ativo |

## Comandos de validação
```bash
npm install
npm run db:check
npm run admin:check
npm test
npm run dev
```

Para a aplicação desktop, use outro terminal e execute `npm run desktop` depois de instalar as dependências. O frontend e a API são compartilhados entre os dois clientes.

## O que ainda exige evidência real
- Testes manuais completos no navegador e no cliente desktop.
- Capturas reais de telas, consultas executadas e resultados de testes.
- Histórico Git e branches criados no repositório do estudante.
- Leitura/tradução do texto específico fornecido pelo professor, caso a UC 5 tenha um texto obrigatório.
- Enunciado da UC 6 e confirmação se a UC 8 aceita Electron como desktop.

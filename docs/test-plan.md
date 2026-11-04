# UC 11 — Plano de testes e qualidade

## Como executar
```bash
npm test
npm run test:coverage
npm run db:check
npm run admin:check
```

## Testes automatizados incluídos
| ID | Área | Cenário | Resultado esperado | Evidência |
|---|---|---|---|---|
| UT-01 | Pedido | Soma de itens em centavos inteiros | Total correto | Jest |
| UT-02 | Rota | Vizinho mais próximo | Ordem determinística | Jest |
| UT-03 | Rota | Melhoria 2-opt | Distância não aumenta | Jest |
| UT-04 | Armazém | Caixas em espaço 3D | Posições sem sobreposição | Jest |
| UT-05 | Armazém | Caixa maior que o espaço | Item aparece como não alocado | Jest |
| UT-06 | Estrutura | Pilha | LIFO | Jest |
| UT-07 | Estrutura | Fila | FIFO | Jest |
| UT-08 | Veículo | Reservar e liberar | Estados válidos | Jest |
| UT-09 | Remessa | Transição de rastreio | Bloqueia estado final inválido | Jest |
| UT-10 | Pagamento | Aprovação e estorno | Transições válidas | Jest |

## Roteiro de testes funcionais manuais
| ID | Pré-condição | Ação | Resultado esperado |
|---|---|---|---|
| FT-01 | Banco disponível | Cadastrar e-mail novo | Conta CUSTOMER criada e sessão iniciada |
| FT-02 | Conta existente | Cadastrar o mesmo e-mail | Mensagem de e-mail já cadastrado |
| FT-03 | Conta existente | Login com senha correta | Acesso à área do cliente |
| FT-04 | Conta existente | Login com senha incorreta | Mensagem genérica de autenticação inválida |
| FT-05 | Usuário cliente | Abrir rota administrativa | HTTP 403 |
| FT-06 | Produto ativo | Criar pedido com estoque | Pedido criado e estoque reservado |
| FT-07 | Produto sem estoque | Criar pedido | Operação recusada sem pedido parcial |
| FT-08 | Pedido reservado | Cancelar pedido | Reserva liberada |
| FT-09 | Pedido em trânsito | Marcar entrega como entregue | Entrega finalizada e estoque baixado |
| FT-10 | Código existente | Consultar rastreio | Status e código correspondentes |
| FT-11 | Código inexistente | Consultar rastreio | Mensagem de não encontrado |
| FT-12 | Usuário autenticado | Sair da conta | Sessão encerrada |

## Registro de defeitos
Para cada falha observada, registre: ID, data, versão, ambiente, passos para reproduzir, resultado esperado, resultado obtido, severidade, responsável, correção e reteste.

## Limite da evidência
Os testes Jest cobrem funções e classes locais. Os fluxos de navegador e banco de dados precisam ser executados no computador de desenvolvimento para gerar evidências reais; não marque teste manual como aprovado sem executá-lo.

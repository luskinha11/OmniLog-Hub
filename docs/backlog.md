# UC 1 — Backlog e critérios de aceite

## Visão do produto
O OmniLog Hub centraliza catálogo, clientes, estoque, pedidos e entregas da OmniLog Solutions S.A., reduzindo retrabalho entre setores.

## Histórias de usuário
| ID | História | Prioridade | Critério de aceite |
|---|---|---|---|
| US01 | Como cliente, quero criar uma conta e entrar para acompanhar meus pedidos. | Alta | E-mail único, senha com hash e sessão criada após autenticação. |
| US02 | Como cliente, quero pesquisar produtos e visualizar preço e disponibilidade. | Alta | Apenas produtos ativos aparecem no catálogo. |
| US03 | Como cliente, quero montar um carrinho e confirmar um pedido. | Alta | O servidor recalcula o valor e reserva estoque em transação. |
| US04 | Como cliente, quero consultar o histórico e rastrear a entrega. | Alta | Pedido pertence ao cliente autenticado e possui código de rastreio. |
| US05 | Como gestor, quero cadastrar e editar produtos. | Alta | Somente ADMIN/MANAGER podem alterar catálogo. |
| US06 | Como operador, quero ajustar estoque sem afetar unidades reservadas. | Alta | A quantidade final nunca fica abaixo do reservado. |
| US07 | Como operador, quero atualizar pedidos e entregas. | Alta | Transições inválidas são recusadas pelo servidor. |
| US08 | Como administrador, quero visualizar indicadores consolidados. | Média | Painel apresenta totais calculados no banco. |
| US09 | Como usuário, quero recuperar minha senha. | Média | Código é temporário, de uso único e limitado por tentativas. |

## Requisitos não funcionais
- Segurança: hash bcrypt, consultas parametrizadas, sessão HttpOnly e autorização por papel.
- Integridade: chaves estrangeiras, restrições e transações de pedido.
- Usabilidade: layout responsivo, feedback de sucesso/erro e formulários validados.
- Manutenibilidade: rotas, modelos, utilitários, testes e documentação separados.
- Compatibilidade: Node.js 20+ e MySQL 8.4.

## Planejamento em sprints
1. Base de dados, autenticação e catálogo.
2. Estoque, pedidos e rastreamento.
3. Painel operacional, testes, cliente desktop e documentação.

## Definition of Done
Uma história é considerada concluída quando sua validação no servidor existe, as permissões são aplicadas, os erros são tratados, o teste relacionado passa e a documentação é atualizada.

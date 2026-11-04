# UC3 — Consultas Avançadas, Índices e Recuperação

## Consultas
O arquivo database/queries-advanced-uc3.sql contém:
- INNER JOIN, LEFT JOIN e RIGHT JOIN;
- subconsultas correlacionadas e escalares;
- COUNT, AVG, SUM, GROUP BY e HAVING;
- UNION e INTERSECT.

## Otimização
O arquivo database/optimization-uc3.sql cria um índice composto
para categoria e situação do produto e um índice FULLTEXT para busca textual.
O script verifica previamente a existência dos índices.

## Backup
Executar npm run db:backup cria uma cópia SQL em backups/.
A rotina inclui procedures, triggers e events.

## Restauração de teste
Executar npm run db:restore:test -- backups/arquivo.sql
restaura a cópia em omnilog_hub_restore_test.
O banco principal não é sobrescrito por esse procedimento.

## Limitação
O MySQL não oferece views materializadas nativas. Para relatórios
pré-calculados, deve-se utilizar tabela de resumo e rotina de atualização.

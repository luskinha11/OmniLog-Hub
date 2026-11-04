# UC2 — Testes de Mesa dos Algoritmos
## Projeto OmniLog Hub

## 1. Objetivo

Este documento apresenta testes de mesa dos algoritmos utilizados no OmniLog Hub. O objetivo é demonstrar o comportamento esperado das operações de otimização de rotas e alocação tridimensional de cargas, incluindo situações normais, limites e entradas inválidas.

Os cenários abaixo são simulações documentadas para validação lógica. Os testes automatizados executados pelo Jest estão registrados separadamente.

## 2. Teste de otimização de rotas

### Cenário 1 — Matriz de distâncias entre centros

Entrada:

- Centro A: coordenadas (0, 0).
- Centro B: coordenadas (3, 4).
- Centro C: coordenadas (6, 8).

Matriz calculada:

| Origem/Destino | A | B | C |
|---|---:|---:|---:|
| A | 0 | 5 | 10 |
| B | 5 | 0 | 5 |
| C | 10 | 5 | 0 |

Rastreamento:

| Etapa | Centro atual | Distâncias disponíveis | Escolha |
|---|---|---|---|
| 1 | A | B = 5, C = 10 | B |
| 2 | B | C = 5 | C |
| 3 | C | Nenhum destino restante | Fim |

Resultado esperado: A → B → C.

Distância total: 10 unidades.

### Cenário 2 — Matriz com distâncias iguais

Entrada:

| Origem/Destino | A | B | C |
|---|---:|---:|---:|
| A | 0 | 4 | 4 |
| B | 4 | 0 | 3 |
| C | 4 | 3 | 0 |

Rastreamento:

1. O algoritmo inicia em A.
2. B e C apresentam distância igual a 4.
3. O algoritmo escolhe B, pois aparece primeiro na ordem da matriz.
4. De B, escolhe C, com distância 3.

Resultado esperado: A → B → C.

Distância total: 7 unidades.

### Cenário 3 — Matriz inválida

Entrada:

| Linha | Valores |
|---|---|
| 1 | 0, 5 |
| 2 | 5 |

Resultado esperado: rejeição da matriz, pois ela não possui formato quadrado.

Tratamento: lançamento de erro informando que a matriz deve ser quadrada.

## 3. Testes de alocação tridimensional

A estrutura utilizada representa:

- Corredor: primeira dimensão.
- Prateleira: segunda dimensão.
- Nível: terceira dimensão.

Cada posição pode armazenar um palete, desde que respeite as regras de peso e periculosidade.

### Cenário 4 — Alocação normal

Configuração:

- Corredores: 2.
- Prateleiras: 2.
- Níveis: 2.
- Peso máximo por posição: 200 kg.
- Cargas perigosas: não permitidas.

Entrada:

| Palete | Peso | Perigoso |
|---|---:|---|
| P1 | 100 kg | Não |
| P2 | 150 kg | Não |

Rastreamento:

| Etapa | Palete | Posição | Resultado |
|---|---|---|---|
| 1 | P2 | (0, 0, 0) | Alocado |
| 2 | P1 | (0, 0, 1) | Alocado |

Resultado esperado: dois paletes alocados, sem sobreposição de posições.

### Cenário 5 — Peso acima do limite

Configuração:

- Uma posição disponível.
- Peso máximo: 200 kg.

Entrada:

| Palete | Peso |
|---|---:|
| P1 | 300 kg |

Processamento:

1. O sistema verifica a posição disponível.
2. Compara 300 kg com o limite de 200 kg.
3. Identifica que o peso ultrapassa o limite.
4. Recusa a alocação.

Resultado esperado: P1 permanece na lista de itens não alocados.

### Cenário 6 — Carga perigosa em posição não autorizada

Configuração:

- Uma posição disponível.
- Peso máximo: 200 kg.
- Cargas perigosas não permitidas.

Entrada:

| Palete | Peso | Perigoso |
|---|---:|---|
| P1 | 50 kg | Sim |

Processamento:

1. O sistema verifica o peso.
2. O peso está dentro do limite.
3. O sistema verifica a classificação de periculosidade.
4. A posição não autoriza esse tipo de carga.

Resultado esperado: palete recusado e registrado como não alocado.

### Cenário 7 — Limite de capacidade do armazém

Configuração:

- Um corredor.
- Uma prateleira.
- Um nível.
- Uma posição disponível.

Entrada:

| Palete | Peso |
|---|---:|
| P1 | 50 kg |
| P2 | 60 kg |

Processamento:

1. P1 ocupa a única posição disponível.
2. P2 procura uma posição livre.
3. Não existem outras posições disponíveis.

Resultado esperado: P1 alocado e P2 não alocado.

## 4. Testes de exceção e limites

| Código | Entrada ou situação | Resultado esperado |
|---|---|---|
| EX01 | Matriz de distâncias não quadrada | Erro de validação |
| EX02 | Índice inicial fora dos limites | Erro de índice inválido |
| EX03 | Distância negativa ou não numérica | Erro de validação |
| EX04 | Dimensão do armazém igual a zero | Erro de dimensão inválida |
| EX05 | Peso negativo ou não numérico | Erro de peso inválido |
| EX06 | Restrição de posição fora dos limites | Erro de posição inválida |
| EX07 | Nenhuma posição disponível | Item registrado como não alocado |
| EX08 | Classificação de periculosidade inválida | Erro de validação |

## 5. Vetores, matrizes e limites

O projeto utiliza arrays e estruturas dinâmicas do JavaScript. Por isso, não existe um tamanho fixo de vetor definido diretamente nesses algoritmos.

Mesmo assim, entradas inválidas, índices fora dos limites e dimensões inconsistentes precisam ser rejeitados.

O algoritmo de alocação também verifica se existem posições disponíveis antes de registrar uma carga.

A divisão por zero não é utilizada nas operações de distância ou alocação implementadas. As distâncias são calculadas com Math.hypot, e os limites de peso são comparados diretamente.

O estouro de pilha não é um comportamento esperado nos algoritmos atuais, que utilizam principalmente estruturas iterativas. O consumo de memória e o tempo de processamento ainda devem ser avaliados com grandes volumes de dados.

## 6. Evidências de testes automatizados

A suíte Jest foi executada com sucesso após a implementação dos algoritmos complementares.

| Indicador | Resultado |
|---|---:|
| Suítes aprovadas | 4 |
| Testes aprovados | 21 |
| Testes reprovados | 0 |
| Snapshots | 0 |

Arquivo de testes dos algoritmos originais: `tests/algorithms.test.js`.

Arquivo de testes dos algoritmos complementares: `tests/advanced-algorithms.test.js`.

## 7. Conclusão

Os testes de mesa demonstram o funcionamento esperado dos algoritmos em cenários normais e situações de exceção.

A implementação contempla cálculo de distâncias, seleção de rotas, organização tridimensional de posições e restrições de peso e periculosidade.

Os resultados documentados complementam os testes automatizados e auxiliam na validação lógica das funcionalidades da UC2.

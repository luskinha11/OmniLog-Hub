# UC4 — Desenvolvimento Orientado a Objetos em Java

## Objetivo
Implementar o domínio logístico utilizando encapsulamento, herança,
polimorfismo, abstração, interfaces e estruturas de dados.

## Hierarquia de veículos
Vehicle é uma classe abstrata que mantém placa e capacidade máxima.
RefrigeratedTruck, UtilityVan e DeliveryDrone sobrescrevem os métodos
estimateRange e calculateFreight.

## Contrato de pagamentos
PaymentProcessor define o contrato de processamento.
CreditCardProcessor, BankSlipProcessor e PixProcessor implementam
formas distintas de pagamento simulado. Nenhuma cobrança real é efetuada.

## Estruturas de dados
OperatorHistory utiliza Deque como pilha LIFO para histórico de ações.
DispatchQueue utiliza Queue como fila FIFO para despacho de pedidos.

## Validação
Os testes automatizados verificam autonomia, polimorfismo, limite de carga,
distância inválida, pagamentos simulados e comportamento LIFO/FIFO.

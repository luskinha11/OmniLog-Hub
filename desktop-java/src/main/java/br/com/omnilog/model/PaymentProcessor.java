package br.com.omnilog.model;

import java.math.BigDecimal;

public interface PaymentProcessor {
    String method();

    default String process(BigDecimal amount) {
        if (amount == null || amount.signum() <= 0) {
            throw new IllegalArgumentException("Valor de pagamento inválido.");
        }
        return method() + " - PROCESSAMENTO SIMULADO";
    }
}

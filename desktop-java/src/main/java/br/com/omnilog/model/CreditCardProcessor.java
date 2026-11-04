package br.com.omnilog.model;

public class CreditCardProcessor implements PaymentProcessor {
    @Override
    public String method() {
        return "CARTAO DE CREDITO";
    }
}

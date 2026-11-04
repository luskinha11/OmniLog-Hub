package br.com.omnilog.model;

public class BankSlipProcessor implements PaymentProcessor {
    @Override
    public String method() {
        return "BOLETO BANCARIO";
    }
}

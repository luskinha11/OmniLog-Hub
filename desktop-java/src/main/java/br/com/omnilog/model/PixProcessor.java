package br.com.omnilog.model;

public class PixProcessor implements PaymentProcessor {
    @Override
    public String method() {
        return "PIX";
    }
}

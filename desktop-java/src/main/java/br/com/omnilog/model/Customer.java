package br.com.omnilog.model;

public record Customer(
    long id,
    long userId,
    String name,
    String email,
    String cpf,
    String phone,
    String address,
    String city,
    String state,
    String postalCode,
    boolean active
) {}

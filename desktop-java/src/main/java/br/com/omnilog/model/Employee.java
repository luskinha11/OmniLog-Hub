package br.com.omnilog.model;

public record Employee(
    long id,
    String name,
    String position,
    String createdAt
) {}

package br.com.omnilog.model;

import java.math.BigDecimal;

public record Product(
    long id,
    long categoryId,
    String categoryName,
    String name,
    String description,
    BigDecimal price,
    BigDecimal weight,
    boolean active
) {}

package br.com.omnilog.model;

import java.math.BigDecimal;

public class UtilityVan extends Vehicle {
    public UtilityVan(String plate, BigDecimal maximumLoad) {
        super(plate, maximumLoad);
    }

    @Override
    public BigDecimal estimateRange(BigDecimal fuelLiters) {
        if (fuelLiters == null || fuelLiters.signum() < 0) {
            throw new IllegalArgumentException("Combustível inválido.");
        }
        return fuelLiters.multiply(new BigDecimal("8.0"));
    }

    @Override
    public BigDecimal calculateFreight(BigDecimal distance, BigDecimal load) {
        validateShipment(distance, load);
        return distance.multiply(new BigDecimal("1.10"))
            .add(load.multiply(new BigDecimal("0.20")));
    }
}

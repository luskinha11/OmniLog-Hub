package br.com.omnilog.model;

import java.math.BigDecimal;

public abstract class Vehicle {
    private final String plate;
    private final BigDecimal maximumLoad;

    protected Vehicle(String plate, BigDecimal maximumLoad) {
        if (plate == null || plate.isBlank()) {
            throw new IllegalArgumentException("Placa obrigatória.");
        }
        if (maximumLoad == null || maximumLoad.signum() <= 0) {
            throw new IllegalArgumentException("Capacidade inválida.");
        }
        this.plate = plate;
        this.maximumLoad = maximumLoad;
    }

    public String getPlate() {
        return plate;
    }

    public BigDecimal getMaximumLoad() {
        return maximumLoad;
    }

    protected void validateShipment(BigDecimal distance, BigDecimal load) {
        if (distance == null || distance.signum() <= 0) {
            throw new IllegalArgumentException("Distância inválida.");
        }
        if (load == null || load.signum() < 0
                || load.compareTo(maximumLoad) > 0) {
            throw new IllegalArgumentException("Carga fora da capacidade.");
        }
    }

    public abstract BigDecimal estimateRange(BigDecimal resource);
    public abstract BigDecimal calculateFreight(
        BigDecimal distance, BigDecimal load
    );
}

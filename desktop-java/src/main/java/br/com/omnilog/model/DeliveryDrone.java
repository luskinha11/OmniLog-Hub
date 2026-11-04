package br.com.omnilog.model;

import java.math.BigDecimal;

public class DeliveryDrone extends Vehicle {
    public DeliveryDrone(String plate, BigDecimal maximumLoad) {
        super(plate, maximumLoad);
    }

    @Override
    public BigDecimal estimateRange(BigDecimal batteryUnits) {
        if (batteryUnits == null || batteryUnits.signum() < 0) {
            throw new IllegalArgumentException("Bateria inválida.");
        }
        return batteryUnits.multiply(new BigDecimal("1.2"));
    }

    @Override
    public BigDecimal calculateFreight(BigDecimal distance, BigDecimal load) {
        validateShipment(distance, load);
        return distance.multiply(new BigDecimal("2.00"))
            .add(load.multiply(new BigDecimal("0.50")));
    }
}

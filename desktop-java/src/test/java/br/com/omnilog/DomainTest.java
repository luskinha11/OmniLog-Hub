package br.com.omnilog;

import br.com.omnilog.model.*;
import br.com.omnilog.util.DispatchQueue;
import br.com.omnilog.util.OperatorHistory;

import org.junit.jupiter.api.Test;
import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class DomainTest {

    @Test
    void deveCalcularAutonomiaDeVeiculosDiferentes() {
        Vehicle van = new UtilityVan("ABC1234", new BigDecimal("1000"));
        Vehicle truck = new RefrigeratedTruck("DEF5678", new BigDecimal("8000"));

        assertEquals(
            80,
            van.estimateRange(new BigDecimal("10")).intValue()
        );
        assertEquals(
            25,
            truck.estimateRange(new BigDecimal("10")).intValue()
        );
    }

    @Test
    void deveAplicarPolimorfismoNoCalculoDeFrete() {
        List<Vehicle> fleet = List.of(
            new UtilityVan("ABC1234", new BigDecimal("1000")),
            new RefrigeratedTruck("DEF5678", new BigDecimal("8000")),
            new DeliveryDrone("DRN0001", new BigDecimal("5"))
        );

        for (Vehicle vehicle : fleet) {
            assertTrue(
                vehicle.calculateFreight(
                    new BigDecimal("10"), new BigDecimal("2")
                ).signum() > 0
            );
        }
    }

    @Test
    void deveRecusarCargaAcimaDaCapacidade() {
        Vehicle van = new UtilityVan("ABC1234", new BigDecimal("1000"));

        assertThrows(
            IllegalArgumentException.class,
            () -> van.calculateFreight(
                new BigDecimal("10"), new BigDecimal("1200")
            )
        );
    }

    @Test
    void deveRejeitarDistanciaInvalida() {
        Vehicle van = new UtilityVan("ABC1234", new BigDecimal("1000"));

        assertThrows(
            IllegalArgumentException.class,
            () -> van.calculateFreight(
                BigDecimal.ZERO, BigDecimal.ONE
            )
        );
    }

    @Test
    void deveProcessarDiferentesMetodosDePagamentoSimulados() {
        List<PaymentProcessor> processors = List.of(
            new CreditCardProcessor(),
            new BankSlipProcessor(),
            new PixProcessor()
        );

        for (PaymentProcessor processor : processors) {
            assertTrue(
                processor.process(new BigDecimal("100.00"))
                    .contains("SIMULADO")
            );
        }
    }

    @Test
    void deveRejeitarPagamentoInvalido() {
        PaymentProcessor pix = new PixProcessor();

        assertThrows(
            IllegalArgumentException.class,
            () -> pix.process(BigDecimal.ZERO)
        );
    }

    @Test
    void deveUsarPilhaNoHistoricoDoOperador() {
        OperatorHistory history = new OperatorHistory();

        history.record("Cadastro de produto");
        history.record("Atualização de estoque");

        assertEquals("Atualização de estoque", history.undo());
        assertEquals("Cadastro de produto", history.undo());
        assertNull(history.undo());
    }

    @Test
    void deveUsarFilaNoDespachoDePedidos() {
        DispatchQueue queue = new DispatchQueue();

        queue.enqueue("OMNI-001");
        queue.enqueue("OMNI-002");

        assertEquals("OMNI-001", queue.dispatchNext());
        assertEquals("OMNI-002", queue.dispatchNext());
        assertNull(queue.dispatchNext());
    }
}

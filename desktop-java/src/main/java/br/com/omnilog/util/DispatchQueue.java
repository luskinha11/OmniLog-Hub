package br.com.omnilog.util;

import java.util.ArrayDeque;
import java.util.Queue;

public class DispatchQueue {
    private final Queue<String> orders = new ArrayDeque<>();

    public void enqueue(String orderCode) {
        if (orderCode == null || orderCode.isBlank()) {
            throw new IllegalArgumentException("Pedido inválido.");
        }
        orders.offer(orderCode);
    }

    public String dispatchNext() {
        return orders.poll();
    }

    public int size() {
        return orders.size();
    }
}

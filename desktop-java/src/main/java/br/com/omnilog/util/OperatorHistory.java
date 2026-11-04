package br.com.omnilog.util;

import java.util.ArrayDeque;
import java.util.Deque;

public class OperatorHistory {
    private final Deque<String> history = new ArrayDeque<>();

    public void record(String action) {
        if (action == null || action.isBlank()) {
            throw new IllegalArgumentException("Ação inválida.");
        }
        history.push(action);
    }

    public String undo() {
        return history.pollFirst();
    }

    public int size() {
        return history.size();
    }
}

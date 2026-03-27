package graph;

import java.util.*;

public class Graph {
    private Map<String, List<String>> adj = new HashMap<>();

    public void addEdge(String u, String v) {
        adj.computeIfAbsent(u, k -> new ArrayList<>()).add(v);
    }

    public Map<String, List<String>> getGraph() {
        return adj;
    }
}
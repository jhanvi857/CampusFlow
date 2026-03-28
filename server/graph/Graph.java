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

    public static class CycleResult {
        public boolean hasCycle = false;
        public List<String> path = new ArrayList<>();
        public List<String> logs = new ArrayList<>();
    }

    public CycleResult findCycle() {
        CycleResult res = new CycleResult();
        Set<String> visited = new HashSet<>();
        Set<String> stack = new HashSet<>();
        List<String> path = new ArrayList<>();

        for (String node : adj.keySet()) {
            if (!visited.contains(node)) {
                if (check(node, visited, stack, path, res)) {
                    res.hasCycle = true;
                    return res;
                }
            }
        }
        res.logs.add("Graph Consistency Verified: No structural deadlocks identified.");
        return res;
    }

    private boolean check(String u, Set<String> visited, Set<String> stack, List<String> path, CycleResult res) {
        visited.add(u);
        stack.add(u);
        path.add(u);

        for (String v : adj.getOrDefault(u, new ArrayList<>())) {
            if (!visited.contains(v)) {
                if (check(v, visited, stack, path, res))
                    return true;
            } else if (stack.contains(v)) {
                int start = path.indexOf(v);
                res.path = new ArrayList<>(path.subList(start, path.size()));
                res.path.add(v); // Visual loop closure
                res.logs.add("ALGORITHM TRIGGER: DFS back-edge detected at " + v);
                res.logs.add("Cycle Path: " + String.join(" -> ", res.path));
                return true;
            }
        }

        stack.remove(u);
        path.remove(path.size() - 1);
        return false;
    }
}
package service;

import graph.Graph;
import graph.GraphService;
import model.Session;
import java.util.*;

public class ConflictService {

    public Map<String, List<String>> getConflicts(List<Session> sessions) {
        GraphService gs = new GraphService();
        Graph g = gs.buildConflictGraph(sessions);
        return g.getGraph();
    }

    public graph.Graph.CycleResult findDeadlocks(List<Session> sessions) {
        GraphService gs = new GraphService();
        return gs.analyzeCycle(sessions);
    }
}
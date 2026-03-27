package graph;

import model.Session;
import java.util.*;

public class GraphService {

    private int toMinutes(String timeValue) {
        if (timeValue == null || !timeValue.contains(":")) {
            return -1;
        }

        String[] parts = timeValue.split(":");
        if (parts.length != 2) {
            return -1;
        }

        try {
            int hour = Integer.parseInt(parts[0]);
            int minute = Integer.parseInt(parts[1]);
            return hour * 60 + minute;
        } catch (NumberFormatException error) {
            return -1;
        }
    }

    private boolean overlaps(Session a, Session b) {
        if (a.day == null || b.day == null || !a.day.equalsIgnoreCase(b.day)) {
            return false;
        }

        int aStart = toMinutes(a.startTime);
        int aEnd = toMinutes(a.endTime);
        int bStart = toMinutes(b.startTime);
        int bEnd = toMinutes(b.endTime);

        if (aStart < 0 || aEnd < 0 || bStart < 0 || bEnd < 0) {
            return false;
        }

        return aStart < bEnd && bStart < aEnd;
    }

    private boolean same(String left, String right) {
        if (left == null || right == null) {
            return false;
        }

        return left.trim().equalsIgnoreCase(right.trim());
    }

    public Graph buildConflictGraph(List<Session> sessions) {
        Graph graph = new Graph();

        for (int i = 0; i < sessions.size(); i++) {
            for (int j = i + 1; j < sessions.size(); j++) {

                Session a = sessions.get(i);
                Session b = sessions.get(j);

                if (overlaps(a, b)) {
                    boolean facultyConflict = same(a.faculty, b.faculty);
                    boolean roomConflict = same(a.room, b.room);
                    boolean sectionConflict = same(a.className, b.className) && same(a.section, b.section);
                    boolean batchConflict = same(a.className, b.className) && same(a.batch, b.batch);

                    if (facultyConflict || roomConflict || sectionConflict || batchConflict) {
                        graph.addEdge(a.id, b.id);
                        graph.addEdge(b.id, a.id);
                    }
                }
            }
        }

        return graph;
    }
}
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

    private String normalizeDay(String d) {
        if (d == null) return "";
        String s = d.trim().toLowerCase();
        if (s.startsWith("mon")) return "Mon";
        if (s.startsWith("tue")) return "Tue";
        if (s.startsWith("wed")) return "Wed";
        if (s.startsWith("thu")) return "Thu";
        if (s.startsWith("fri")) return "Fri";
        if (s.startsWith("sat")) return "Sat";
        if (s.startsWith("sun")) return "Sun";
        return d.length() >= 3 ? d.substring(0, 3) : d;
    }

    private boolean overlaps(Session a, Session b) {
        if (a.day == null || b.day == null || !normalizeDay(a.day).equalsIgnoreCase(normalizeDay(b.day))) {
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
                        
                        boolean studentConflict = false;
                        if (same(a.className, b.className)) {
                            if (same(a.section, b.section)) studentConflict = true;
                            else if (same(a.batch, b.batch)) studentConflict = true;
                            else if (a.section != null && b.batch != null && b.batch.toLowerCase().startsWith(a.section.toLowerCase())) studentConflict = true;
                            else if (a.batch != null && b.section != null && a.batch.toLowerCase().startsWith(b.section.toLowerCase())) studentConflict = true;
                        }

                        if (facultyConflict || roomConflict || studentConflict) {
                            graph.addEdge(a.id, b.id);
                            graph.addEdge(b.id, a.id);
                        }
                }
            }
        }

        return graph;
    }
}
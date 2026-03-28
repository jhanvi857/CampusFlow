package controller;

import service.*;
import model.Session;
import java.util.*;

import com.jhanvi857.nioflow.routing.HttpContext;

public class ApiController {

    private static TimetableService ts = new TimetableService();
    private static ConflictService cs = new ConflictService();

    private static String jsonEscape(String input) {
        if (input == null) {
            return "";
        }

        return input
            .replace("\\", "\\\\")
            .replace("\"", "\\\"")
            .replace("\n", "\\n")
            .replace("\r", "\\r")
            .replace("\t", "\\t");
    }

    private static String sessionsToJson(List<Session> sessions) {
        StringBuilder json = new StringBuilder("[");

        for (int i = 0; i < sessions.size(); i++) {
            Session s = sessions.get(i);
            json.append("{")
                .append("\"id\":\"").append(jsonEscape(s.id)).append("\",")
                .append("\"subjectCode\":\"").append(jsonEscape(s.subjectCode)).append("\",")
                .append("\"courseCode\":\"").append(jsonEscape(s.subjectCode)).append("\",")
                .append("\"subjectName\":\"").append(jsonEscape(s.subjectName)).append("\",")
                .append("\"faculty\":\"").append(jsonEscape(s.faculty)).append("\",")
                .append("\"room\":\"").append(jsonEscape(s.room)).append("\",")
                .append("\"className\":\"").append(jsonEscape(s.className)).append("\",")
                .append("\"sessionType\":\"").append(jsonEscape(s.sessionType)).append("\",")
                .append("\"section\":\"").append(jsonEscape(s.section)).append("\",")
                .append("\"batch\":\"").append(jsonEscape(s.batch)).append("\",")
                .append("\"day\":\"").append(jsonEscape(s.day)).append("\",")
                .append("\"startTime\":\"").append(jsonEscape(s.startTime)).append("\",")
                .append("\"endTime\":\"").append(jsonEscape(s.endTime)).append("\",")
                .append("\"time\":\"").append(jsonEscape(s.time)).append("\"")
                .append("}");

            if (i < sessions.size() - 1) {
                json.append(",");
            }
        }

        json.append("]");
        return json.toString();
    }

    private static String conflictsToJson(Map<String, List<String>> conflicts) {
        StringBuilder json = new StringBuilder("{");
        int entryIndex = 0;

        for (Map.Entry<String, List<String>> entry : conflicts.entrySet()) {
            json.append("\"").append(jsonEscape(entry.getKey())).append("\":");
            json.append("[");

            List<String> values = entry.getValue();
            for (int i = 0; i < values.size(); i++) {
                json.append("\"").append(jsonEscape(values.get(i))).append("\"");
                if (i < values.size() - 1) {
                    json.append(",");
                }
            }

            json.append("]");
            if (entryIndex < conflicts.size() - 1) {
                json.append(",");
            }
            entryIndex++;
        }

        json.append("}");
        return json.toString();
    }

    public static void getTimetable(HttpContext ctx) {
        List<Session> sessions = ts.getAllSessions();
        ctx.send(sessionsToJson(sessions));
    }

    public static void getConflicts(HttpContext ctx) {
        List<Session> sessions = ts.getAllSessions();
        Map<String, List<String>> conflicts = cs.getConflicts(sessions);
        ctx.send(conflictsToJson(conflicts));
    }

    public static void analyzeCycle(HttpContext ctx) {
        List<Session> sessions = ts.getAllSessions();
        graph.Graph.CycleResult res = cs.findDeadlocks(sessions);
        ctx.send(cycleResultToJson(res));
    }

    private static String cycleResultToJson(graph.Graph.CycleResult res) {
        StringBuilder json = new StringBuilder("{");
        json.append("\"hasCycle\":").append(res.hasCycle).append(",");
        
        json.append("\"path\":[");
        for (int i = 0; i < res.path.size(); i++) {
            json.append("\"").append(jsonEscape(res.path.get(i))).append("\"");
            if (i < res.path.size() - 1) json.append(",");
        }
        json.append("],");

        json.append("\"logs\":[");
        for (int i = 0; i < res.logs.size(); i++) {
            json.append("\"").append(jsonEscape(res.logs.get(i))).append("\"");
            if (i < res.logs.size() - 1) json.append(",");
        }
        json.append("]");
        
        json.append("}");
        return json.toString();
    }
}
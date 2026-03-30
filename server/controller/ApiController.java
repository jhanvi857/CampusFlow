package controller;

import service.*;
import model.Session;
import model.Notification;
import data.NotificationStore;
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

    private static String notificationToJson(Notification n) {
        StringBuilder json = new StringBuilder("{");
        json.append("\"id\":\"").append(jsonEscape(n.id)).append("\",");
        json.append("\"type\":\"").append(jsonEscape(n.type)).append("\",");
        json.append("\"title\":\"").append(jsonEscape(n.title)).append("\",");
        json.append("\"message\":\"").append(jsonEscape(n.message)).append("\",");
        json.append("\"faculty\":\"").append(jsonEscape(n.faculty)).append("\",");
        json.append("\"subjectName\":\"").append(jsonEscape(n.subjectName)).append("\",");
        json.append("\"className\":\"").append(jsonEscape(n.className)).append("\",");
        json.append("\"section\":\"").append(jsonEscape(n.section)).append("\",");
        json.append("\"batch\":\"").append(jsonEscape(n.batch)).append("\",");
        json.append("\"oldDay\":\"").append(jsonEscape(n.oldDay)).append("\",");
        json.append("\"oldStartTime\":\"").append(jsonEscape(n.oldStartTime)).append("\",");
        json.append("\"oldEndTime\":\"").append(jsonEscape(n.oldEndTime)).append("\",");
        json.append("\"oldRoom\":\"").append(jsonEscape(n.oldRoom)).append("\",");
        json.append("\"newDay\":\"").append(jsonEscape(n.newDay)).append("\",");
        json.append("\"newStartTime\":\"").append(jsonEscape(n.newStartTime)).append("\",");
        json.append("\"newEndTime\":\"").append(jsonEscape(n.newEndTime)).append("\",");
        json.append("\"newRoom\":\"").append(jsonEscape(n.newRoom)).append("\",");
        json.append("\"timestamp\":").append(n.timestamp).append(",");
        json.append("\"isRead\":").append(n.isRead);
        json.append("}");
        return json.toString();
    }

    private static String notificationsToJson(List<Notification> notifications) {
        StringBuilder json = new StringBuilder("{");
        json.append("\"notifications\":[");
        for (int i = 0; i < notifications.size(); i++) {
            json.append(notificationToJson(notifications.get(i)));
            if (i < notifications.size() - 1) json.append(",");
        }
        json.append("],");
        json.append("\"unreadCount\":").append(NotificationStore.getUnreadCount());
        json.append("}");
        return json.toString();
    }

    // ── Simple JSON field parser (no external deps) ──
    private static String extractJsonField(String json, String field) {
        String key = "\"" + field + "\"";
        int idx = json.indexOf(key);
        if (idx == -1) return "";
        idx = json.indexOf(":", idx) + 1;
        // skip whitespace
        while (idx < json.length() && json.charAt(idx) == ' ') idx++;
        if (idx >= json.length()) return "";
        
        if (json.charAt(idx) == '"') {
            // string value
            int start = idx + 1;
            int end = start;
            while (end < json.length()) {
                if (json.charAt(end) == '\\') { end += 2; continue; }
                if (json.charAt(end) == '"') break;
                end++;
            }
            return json.substring(start, end);
        } else {
            // numeric or boolean
            int start = idx;
            int end = start;
            while (end < json.length() && json.charAt(end) != ',' && json.charAt(end) != '}') end++;
            return json.substring(start, end).trim();
        }
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

    public static void getNotifications(HttpContext ctx) {
        List<Notification> all = NotificationStore.getAllNotifications();
        ctx.send(notificationsToJson(all));
    }

    public static void createNotification(HttpContext ctx) {
        try {
            String body = ctx.bodyAsString();
            
            String type = extractJsonField(body, "type");
            String faculty = extractJsonField(body, "faculty");
            String subjectName = extractJsonField(body, "subjectName");
            String className = extractJsonField(body, "className");
            String section = extractJsonField(body, "section");
            String batch = extractJsonField(body, "batch");
            String oldDay = extractJsonField(body, "oldDay");
            String oldStartTime = extractJsonField(body, "oldStartTime");
            String oldEndTime = extractJsonField(body, "oldEndTime");
            String oldRoom = extractJsonField(body, "oldRoom");
            String newDay = extractJsonField(body, "newDay");
            String newStartTime = extractJsonField(body, "newStartTime");
            String newEndTime = extractJsonField(body, "newEndTime");
            String newRoom = extractJsonField(body, "newRoom");

            if (type.isEmpty()) type = "reschedule";

            String title;
            String message;

            if ("reschedule".equals(type)) {
                title = "Lecture Rescheduled: " + subjectName;
                message = faculty + " has rescheduled " + subjectName + " from " 
                        + oldDay + " " + oldStartTime + "-" + oldEndTime + " (" + oldRoom + ")"
                        + " to " + newDay + " " + newStartTime + "-" + newEndTime + " (" + newRoom + ")";
            } else if ("extra".equals(type)) {
                title = "Extra Lecture: " + subjectName;
                message = faculty + " has scheduled an extra lecture for " + subjectName 
                        + " on " + newDay + " " + newStartTime + "-" + newEndTime + " in " + newRoom;
            } else {
                title = "Schedule Update: " + subjectName;
                message = "A schedule change has been made for " + subjectName + " by " + faculty;
            }

            String id = NotificationStore.nextId();
            Notification notification = new Notification(
                id, type, title, message, faculty, subjectName,
                className, section, batch,
                oldDay, oldStartTime, oldEndTime, oldRoom,
                newDay, newStartTime, newEndTime, newRoom,
                System.currentTimeMillis()
            );

            NotificationStore.addNotification(notification);
            ctx.send("{\"success\":true,\"id\":\"" + jsonEscape(id) + "\",\"notification\":" + notificationToJson(notification) + "}");
        } catch (Exception e) {
            ctx.status(400).send("{\"success\":false,\"error\":\"" + jsonEscape(e.getMessage()) + "\"}");
        }
    }

    public static void markNotificationRead(HttpContext ctx) {
        try {
            String body = ctx.bodyAsString();
            String id = extractJsonField(body, "id");
            boolean ok = NotificationStore.markAsRead(id);
            ctx.send("{\"success\":" + ok + "}");
        } catch (Exception e) {
            ctx.status(400).send("{\"success\":false}");
        }
    }

    public static void markAllNotificationsRead(HttpContext ctx) {
        NotificationStore.markAllAsRead();
        ctx.send("{\"success\":true}");
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
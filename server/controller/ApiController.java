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

    private static final Map<String, String> FACULTY_CREDENTIALS = new HashMap<>();
    static {
        FACULTY_CREDENTIALS.put("admin@campusflow.com", "admin123");
        FACULTY_CREDENTIALS.put("tejas.modi@university.edu", "faculty123");
        FACULTY_CREDENTIALS.put("ritu.patel@university.edu", "faculty123");
        FACULTY_CREDENTIALS.put("hitesh.c@university.edu", "faculty123");
        FACULTY_CREDENTIALS.put("mani.gupta@university.edu", "faculty123");
        FACULTY_CREDENTIALS.put("ashlesha.bhise@adaniuni.ac.in", "Ashlesha123");
    }

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
                    .append("\"time\":\"").append(jsonEscape(s.time)).append("\",")
                    .append("\"requestType\":\"").append(jsonEscape(s.requestType)).append("\"")
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
            if (i < notifications.size() - 1)
                json.append(",");
        }
        json.append("],");
        json.append("\"unreadCount\":").append(NotificationStore.getUnreadCount());
        json.append("}");
        return json.toString();
    }

    private static String complaintsToJson(List<model.Complaint> complaints) {
        StringBuilder json = new StringBuilder("[");
        for (int i = 0; i < complaints.size(); i++) {
            model.Complaint c = complaints.get(i);
            json.append("{")
                    .append("\"id\":\"").append(jsonEscape(c.id)).append("\",")
                    .append("\"room\":\"").append(jsonEscape(c.room)).append("\",")
                    .append("\"feature\":\"").append(jsonEscape(c.feature)).append("\",")
                    .append("\"status\":\"").append(jsonEscape(c.status)).append("\",")
                    .append("\"createdAt\":").append(c.createdAt)
                    .append("}");
            if (i < complaints.size() - 1)
                json.append(",");
        }
        json.append("]");
        return json.toString();
    }

    // ── Simple JSON field parser (no external deps) ──
    private static String extractJsonField(String json, String field) {
        if (json == null || json.isEmpty())
            return "";
        try {
            // Regex for string values: "field"\s*:\s*"value"
            java.util.regex.Pattern stringPattern = java.util.regex.Pattern
                    .compile("\"" + field + "\"\\s*:\\s*\"(([^\"]|\\\\\")*)\"");
            java.util.regex.Matcher stringMatcher = stringPattern.matcher(json);
            if (stringMatcher.find()) {
                String val = stringMatcher.group(1);
                // Unescape basic quotes
                val = val.replace("\\\"", "\"");
                System.out.println("  [Regex] Extracted '" + field + "' as string: '" + val + "'");
                return val;
            }

            // Regex for non-string values: "field"\s*:\s*value (until , or })
            java.util.regex.Pattern nonStringPattern = java.util.regex.Pattern
                    .compile("\"" + field + "\"\\s*:\\s*([^,}\\s]*)");
            java.util.regex.Matcher nonStringMatcher = nonStringPattern.matcher(json);
            if (nonStringMatcher.find()) {
                String val = nonStringMatcher.group(1).trim();
                System.out.println("  [Regex] Extracted '" + field + "' as non-string: '" + val + "'");
                return val;
            }
        } catch (Exception e) {
            System.err.println("  [Regex] Error extracting field '" + field + "': " + e.getMessage());
        }

        System.out.println("  [Regex] Field '" + field + "' not found or could not be parsed.");
        return "";
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
            String isOverrideStr = extractJsonField(body, "isOverride");
            boolean isOverride = "true".equalsIgnoreCase(isOverrideStr);

            // Bug Fix: Check if room has active complaints
            if (!isOverride && data.ComplaintStore.hasActiveComplaint(newRoom)) {
                ctx.status(400).send(
                        "{\"success\":false,\"error\":\"Requested room has active maintenance issues. Use Priority Override to bypass.\"}");
                return;
            }

            if (type.isEmpty())
                type = "reschedule";

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
                    System.currentTimeMillis());

            NotificationStore.addNotification(notification);

            // Also add to ExtraSessionStore so it shows up globally in timetables
            if ("extra".equals(type) || "reschedule".equals(type)) {
                Session newSession = new Session(
                        "EXT-" + id,
                        subjectName,
                        subjectName,
                        faculty,
                        newRoom,
                        className,
                        "lecture", // Default for extra, can be refined
                        section,
                        batch,
                        newDay,
                        newStartTime,
                        newEndTime,
                        type);
                data.ExtraSessionStore.addSession(newSession);
            }

            ctx.send("{\"success\":true,\"id\":\"" + jsonEscape(id) + "\",\"notification\":"
                    + notificationToJson(notification) + "}");
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

    public static void deleteSession(HttpContext ctx) {
        try {
            String body = ctx.bodyAsString();
            String id = extractJsonField(body, "id");
            
            // 1. Always mark as cancelled in the global cancel store (for regular sessions)
            data.CancelledSessionStore.cancelSession(id);
            
            // 2. Also try to remove from ExtraSessionStore (for adjustment sessions)
            data.ExtraSessionStore.removeSession(id);
            
            ctx.send("{\"success\":true}");
        } catch (Exception e) {
            ctx.status(400).send("{\"success\":false}");
        }
    }

    public static void login(HttpContext ctx) {
        try {
            String body = ctx.bodyAsString();
            System.out.println("Login Request Body: " + body);

            String role = extractJsonField(body, "role");
            String email = extractJsonField(body, "email");
            String password = extractJsonField(body, "password");

            // Admin Logic
            if ("admin".equals(role)) {
                String adminUser = System.getenv("ADMIN_USERNAME");
                String adminPass = System.getenv("ADMIN_PASSWORD");

                // Fallbacks if env not set for dev
                if (adminUser == null)
                    adminUser = "admin";
                if (adminPass == null)
                    adminPass = "admin123";

                if (adminUser.equals(email) && adminPass.equals(password)) {
                    ctx.send("{\"success\":true,\"role\":\"admin\"}");
                } else {
                    ctx.status(401).send("{\"success\":false,\"error\":\"Invalid admin credentials\"}");
                }
                return;
            }

            if ("student".equals(role)) {
                ctx.send("{\"success\":true}");
                return;
            }

            if (FACULTY_CREDENTIALS.containsKey(email)) {
                String expected = FACULTY_CREDENTIALS.get(email);
                if (expected.equals(password)) {
                    ctx.send("{\"success\":true}");
                } else {
                    ctx.status(401).send("{\"success\":false,\"error\":\"Invalid faculty credentials\"}");
                }
            } else {
                ctx.status(401).send("{\"success\":false,\"error\":\"Invalid faculty credentials\"}");
            }
        } catch (Exception e) {
            ctx.status(400).send("{\"success\":false,\"error\":\"" + jsonEscape(e.getMessage()) + "\"}");
        }
    }

    private static String cycleResultToJson(graph.Graph.CycleResult res) {
        StringBuilder json = new StringBuilder("{");
        json.append("\"hasCycle\":").append(res.hasCycle).append(",");

        json.append("\"path\":[");
        for (int i = 0; i < res.path.size(); i++) {
            json.append("\"").append(jsonEscape(res.path.get(i))).append("\"");
            if (i < res.path.size() - 1)
                json.append(",");
        }
        json.append("],");

        json.append("\"logs\":[");
        for (int i = 0; i < res.logs.size(); i++) {
            json.append("\"").append(jsonEscape(res.logs.get(i))).append("\"");
            if (i < res.logs.size() - 1)
                json.append(",");
        }
        json.append("]");

        json.append("}");
        return json.toString();
    }

    public static void addComplaint(HttpContext ctx) {
        try {
            String body = ctx.bodyAsString();
            String room = extractJsonField(body, "room");
            String feature = extractJsonField(body, "feature");

            boolean success = data.ComplaintStore.addComplaint(room, feature);
            if (success) {
                ctx.send("{\"success\":true}");
            } else {
                ctx.status(400)
                        .send("{\"success\":false,\"error\":\"Complaint already exists for this room and feature\"}");
            }
        } catch (Exception e) {
            ctx.status(400).send("{\"success\":false,\"error\":\"" + jsonEscape(e.getMessage()) + "\"}");
        }
    }

    public static void getComplaints(HttpContext ctx) {
        ctx.send(complaintsToJson(data.ComplaintStore.getAllComplaints()));
    }

    public static void resolveComplaint(HttpContext ctx) {
        try {
            String body = ctx.bodyAsString();
            String id = extractJsonField(body, "id");
            boolean success = data.ComplaintStore.resolveComplaint(id);
            ctx.send("{\"success\":" + success + "}");
        } catch (Exception e) {
            ctx.status(400).send("{\"success\":false}");
        }
    }

    public static void getAvailableRooms(HttpContext ctx) {
        try {
            String body = ctx.bodyAsString();
            String day = extractJsonField(body, "day");
            String startTime = extractJsonField(body, "startTime");
            String endTime = extractJsonField(body, "endTime");

            List<String> rooms = ts.getAvailableRooms(day, startTime, endTime);

            StringBuilder json = new StringBuilder("[");
            for (int i = 0; i < rooms.size(); i++) {
                json.append("\"").append(jsonEscape(rooms.get(i))).append("\"");
                if (i < rooms.size() - 1)
                    json.append(",");
            }
            json.append("]");
            ctx.send(json.toString());
        } catch (Exception e) {
            ctx.status(400).send("{\"success\":false,\"error\":\"" + jsonEscape(e.getMessage()) + "\"}");
        }
    }
    public static void registerFaculty(HttpContext ctx) {
        try {
            String body = ctx.bodyAsString();
            String email = extractJsonField(body, "email");
            String password = extractJsonField(body, "password");

            if (email.isEmpty() || password.isEmpty()) {
                ctx.status(400).send("{\"success\":false,\"error\":\"Email and password are required\"}");
                return;
            }

            if (FACULTY_CREDENTIALS.containsKey(email)) {
                ctx.status(400).send("{\"success\":false,\"error\":\"Faculty member already exists\"}");
                return;
            }

            FACULTY_CREDENTIALS.put(email, password);
            System.out.println("Registered faculty: " + email);
            ctx.send("{\"success\":true}");
        } catch (Exception e) {
            ctx.status(400).send("{\"success\":false,\"error\":\"" + jsonEscape(e.getMessage()) + "\"}");
        }
    }
}
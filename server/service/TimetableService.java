package service;

import data.DataStore;
import data.ExtraSessionStore;
import model.Session;
import java.util.*;

public class TimetableService {

    public List<Session> getAllSessions() {
        List<Session> all = new ArrayList<>(DataStore.getSessions());
        all.addAll(ExtraSessionStore.getAllSessions());
        return all;
    }

    private int toMinutes(String timeValue) {
        if (timeValue == null || !timeValue.contains(":")) return -1;
        String[] parts = timeValue.split(":");
        if (parts.length != 2) return -1;
        try {
            return Integer.parseInt(parts[0]) * 60 + Integer.parseInt(parts[1]);
        } catch (Exception e) { return -1; }
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
        return d;
    }

    public List<String> getAvailableRooms(String day, String startTime, String endTime) {
        List<Session> all = getAllSessions();
        Set<String> occupiedRooms = new HashSet<>();
        
        int reqStart = toMinutes(startTime);
        int reqEnd = toMinutes(endTime);
        String reqDayNormalized = normalizeDay(day);

        // Find rooms that are occupied at this time
        for (Session s : all) {
            String sessionDay = normalizeDay(s.day);
            if (!sessionDay.equalsIgnoreCase(reqDayNormalized)) continue;

            int sStart = toMinutes(s.startTime);
            int sEnd = toMinutes(s.endTime);

            if (sStart < 0 || sEnd < 0) continue;

            // Overlap check: max(start) < min(end)
            if (Math.max(reqStart, sStart) < Math.min(reqEnd, sEnd)) {
                occupiedRooms.add(s.room.trim());
            }
        }

        // Define master room list (extracted from DataStore)
        List<String> masterRooms = Arrays.asList(
            "Room 305", "Room 304", "Room 303B", "Room 203", "Room 501",
            "Lab 203", "Lab 403", "Lab 201", "Lab 401", "Lab 305"
        );

        List<String> free = new ArrayList<>();
        for (String r : masterRooms) {
            if (!occupiedRooms.contains(r)) {
                free.add(r);
            }
        }
        return free;
    }
}
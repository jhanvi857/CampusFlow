package data;

import model.Complaint;
import java.util.*;

public class ComplaintStore {
    private static List<Complaint> complaints = new ArrayList<>();
    private static int counter = 1;

    public static synchronized boolean addComplaint(String room, String feature) {
        // Prevent duplicate complaints for same room and same feature (if pending)
        for (Complaint c : complaints) {
            if (c.room.equalsIgnoreCase(room) && 
                c.feature.equalsIgnoreCase(feature) && 
                c.status.equals("Pending")) {
                return false; // Already exists
            }
        }

        String id = "COMP-" + (counter++);
        complaints.add(new Complaint(id, room, feature));
        return true;
    }

    public static synchronized boolean resolveComplaint(String id) {
        for (Complaint c : complaints) {
            if (c.id.equals(id)) {
                c.status = "Resolved";
                return true;
            }
        }
        return false;
    }

    public static List<Complaint> getAllComplaints() {
        return new ArrayList<>(complaints);
    }

    public static List<Complaint> getComplaintsByRoom(String room) {
        List<Complaint> result = new ArrayList<>();
        for (Complaint c : complaints) {
            if (c.room.equalsIgnoreCase(room)) {
                result.add(c);
            }
        }
        return result;
    }

    public static boolean hasActiveComplaint(String room) {
        for (Complaint c : complaints) {
            if (c.room.equalsIgnoreCase(room) && c.status.equals("Pending")) {
                return true;
            }
        }
        return false;
    }
}

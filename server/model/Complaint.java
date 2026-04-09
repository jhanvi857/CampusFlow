package model;

public class Complaint {
    public String id;
    public String room;
    public String feature; // "AC", "Projector", etc.
    public String status;  // "Pending", "Resolved"
    public long createdAt;

    public Complaint(String id, String room, String feature) {
        this.id = id;
        this.room = room;
        this.feature = feature;
        this.status = "Pending";
        this.createdAt = System.currentTimeMillis();
    }
}

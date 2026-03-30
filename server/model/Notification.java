package model;

public class Notification {
    public String id;
    public String type;           // "reschedule", "extra", "cancellation"
    public String title;
    public String message;
    public String faculty;
    public String subjectName;
    public String className;       // e.g. "CSE"
    public String section;         // e.g. "A", "B"
    public String batch;           // e.g. "A1", "B2"
    public String oldDay;
    public String oldStartTime;
    public String oldEndTime;
    public String oldRoom;
    public String newDay;
    public String newStartTime;
    public String newEndTime;
    public String newRoom;
    public long timestamp;
    public boolean isRead;

    public Notification(
        String id,
        String type,
        String title,
        String message,
        String faculty,
        String subjectName,
        String className,
        String section,
        String batch,
        String oldDay,
        String oldStartTime,
        String oldEndTime,
        String oldRoom,
        String newDay,
        String newStartTime,
        String newEndTime,
        String newRoom,
        long timestamp
    ) {
        this.id = id;
        this.type = type;
        this.title = title;
        this.message = message;
        this.faculty = faculty;
        this.subjectName = subjectName;
        this.className = className;
        this.section = section;
        this.batch = batch;
        this.oldDay = oldDay;
        this.oldStartTime = oldStartTime;
        this.oldEndTime = oldEndTime;
        this.oldRoom = oldRoom;
        this.newDay = newDay;
        this.newStartTime = newStartTime;
        this.newEndTime = newEndTime;
        this.newRoom = newRoom;
        this.timestamp = timestamp;
        this.isRead = false;
    }
}

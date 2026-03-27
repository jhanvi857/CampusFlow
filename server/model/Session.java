package model;

public class Session {
    public String id;
    public String subjectCode;
    public String subjectName;
    public String faculty;
    public String room;
    public String className;
    public String sessionType;
    public String section;
    public String batch;
    public String day;
    public String startTime;
    public String endTime;
    public String time;

    public Session(
        String id,
        String subjectCode,
        String subjectName,
        String faculty,
        String room,
        String className,
        String sessionType,
        String section,
        String batch,
        String day,
        String startTime,
        String endTime
    ) {
        this.id = id;
        this.subjectCode = subjectCode;
        this.subjectName = subjectName;
        this.faculty = faculty;
        this.room = room;
        this.className = className;
        this.sessionType = sessionType;
        this.section = section;
        this.batch = batch;
        this.day = day;
        this.startTime = startTime;
        this.endTime = endTime;
        this.time = day + " " + startTime + "-" + endTime;
    }
}
// OPERATING SYSTEM - ECSCI24204
// Object Oriented Programming IN JAVA - ECSCI24203
// ENGINEERING ECONOMICS - EMSAT24201
// DATA Communication AND Computer NETWORKS - EICCI24203
// Ideation AND CONCEPTUALIZATION - ECSAJ24204
// DISCRETE Mathematics AND GRAPH THEORY - EMABT24202
package data;

import java.util.ArrayList;
import java.util.List;
import model.Session;

public class DataStore {
    public static List<Session> getSessions() {
        List<Session> sessions = new ArrayList<>();
        // ============================================================ CSE A
        // =================================================================
        // Monday TimeTable CSE A
        sessions.add(new Session(
                "S1",
                "ECSCI24204",
                "Operating Systems",
                "Dr. Hitesh Chhinkaniwala",
                "Room 305",
                "CSE",
                "lecture",
                "A",
                "",
                "Mon",
                "09:10",
                "10:00"));
        sessions.add(new Session(
                "S2",
                "ECSCI24203",
                "Object Oriented Programming With Java",
                "Dr.Tejas Modi",
                "Room 305",
                "CSE",
                "Lecture",
                "A",
                "",
                "Mon",
                "10:00",
                "10:50"));
        sessions.add(new Session(
                "S3",
                "ECSCI224203",
                "Object Oriented Programming With Java",
                "Dr. Tejas Modi",
                "Lab 203",
                "CSE",
                "Lab",
                "",
                "A2",
                "Mon",
                "11:00",
                "12:40"));
        sessions.add(new Session(
                "S4",
                "ECSCI24204",
                "Operating System",
                "Dr. Ritu Patel",
                "Lab 403",
                "CSE",
                "Lab",
                "",
                "A1",
                "Mon",
                "11:00",
                "12:40"));
        sessions.add(new Session(
                "S5",
                "EICCI24203",
                "Data Communication and Computer Netwroks",
                "Dr. Mani Shekhar Gupta",
                "Lab 201",
                "CSE",
                "Lab",
                "",
                "A3",
                "Mon",
                "11:00",
                "12:40"));
        sessions.add(new Session(
                "S6",
                "EMABT24202",
                "Discrete Mathematics and Graph Theory",
                "Mr. Mitesh Bhavsar",
                "Room 305",
                "CSE",
                "Tutorial",
                "",
                "A1",
                "Mon",
                "13:30",
                "14:20"));
        sessions.add(new Session(
                "S7",
                "ECSAJ24202",
                "Ideation and Conceptualization",
                "Dr. Mihir Velani",
                "Room 303B",
                "CSE",
                "Lab",
                "",
                "A3",
                "Mon",
                "13:30",
                "14:20"));
        // Tuesday TimeTable CSE A
        sessions.add(new Session(
                "S8",
                "ECSCI24204",
                "Operating System",
                "Dr. Hitesh Chhinkaniwala",
                "Room 305",
                "CSE",
                "Lecture",
                "A",
                "",
                "Tue",
                "10:00",
                "10:50"));
        sessions.add(new Session(
                "S9",
                "EICCI24203",
                "Data Communication and Computer Netwroks",
                "Dr. Mani Shekhar Gupta",
                "Room 305",
                "CSE",
                "Lecture",
                "A",
                "",
                "Tue",
                "11:00",
                "12:40"));
        sessions.add(new Session(
                "S10",
                "EMABT24202",
                "Discrete Mathematics and Graph Theory",
                "Dr. Sougata Mandal",
                "Room 305",
                "CSE",
                "Lecture",
                "A",
                "",
                "Tue",
                "12:40",
                "13:30"));
        sessions.add(new Session(
                "S11",
                "EMSAT24201",
                "Engineering Economics",
                "Dr. Jignesh Thaker",
                "Room 305",
                "CSE",
                "Lecture",
                "A",
                "",
                "Tue",
                "13:30",
                "14:20"));
        // Wednesday TimeTable CSE A
        sessions.add(new Session(
                "S12",
                "ECSCI24204",
                "Operating System",
                "Dr. Hitesh Chhinkaniwala",
                "Room 305",
                "CSE",
                "Lecture",
                "a",
                "",
                "Wed",
                "09:10",
                "10:00"));
        sessions.add(new Session(
                "S13",
                "EMABT24202",
                "Discrete Mathematics and Graph Theory",
                "Dr. Ashlesha Bhise",
                "Room 305",
                "CSE",
                "Lecture",
                "A",
                "",
                "Wed",
                "10:00",
                "10:50"));
        sessions.add(new Session(
                "S14",
                "EICCI24203",
                "Data Communication and Computer Netwroks",
                "Dr. Mani Shekhar Gupta",
                "Lab 201",
                "CSE",
                "Lab",
                "",
                "A1",
                "Wed",
                "11:00",
                "12:40"));
        sessions.add(new Session(
                "S15",
                "ECSCI24203",
                "Object Oriented Programming with Java",
                "Ms. Nidhi Acharya",
                "Lab 401",
                "CSE",
                "Lab",
                "",
                "A3",
                "Wed",
                "11:00",
                "12:40"));
        sessions.add(new Session(
                "S16",
                "ECSCI24204",
                "Operating System ",
                "Dr. Anubhava Shrivastava",
                "Lab 403",
                "CSE",
                "Lab",
                "",
                "A2",
                "Wed",
                "11:00",
                "12:40"));
        sessions.add(new Session(
                "S17",
                "EMABT24202",
                "Discrete Mathematics and Graph Theory",
                "Dr. Sougata Mandal",
                "Room 305",
                "CSE",
                "Tutorial",
                "",
                "A2",
                "Wed",
                "13:30",
                "15:10"));
        sessions.add(new Session(
                "S18",
                "ECSAJ24204",
                "Ideation and Conceptualization",
                "Ms. Devashree Oza",
                "Room 303B",
                "CSE",
                "Lab",
                "",
                "A1",
                "Wed",
                "13:30",
                "15:10"));
        // Thursday TimeTable CSE A
        sessions.add(new Session(
                "S19",
                "EICCI24203",
                "Data Communication and Computer Networks",
                "Dr. Mani Shekhar Gupta",
                "Room 305",
                "CSE",
                "Lecture",
                "A",
                "",
                "Thu",
                "09:10",
                "10:00"));
        sessions.add(new Session(
                "S20",
                "EMBAT24202",
                "Discrete Mathematics and Graph Theory",
                "Dr. Sougata Mandal",
                "Room 305",
                "CSE",
                "Lab",
                "A",
                "",
                "Thu",
                "10:00",
                "10:50"));
        sessions.add(new Session(
                "S21",
                "ECSCI24203",
                "Object Oriented Programming with Java",
                "Dr. Tejas Modi",
                "Room 305",
                "CSE",
                "Lecture",
                "A",
                "",
                "Thu",
                "11:00",
                "11:50"));
        sessions.add(new Session(
                "S22",
                "",
                "Engineering Economics",
                "Dr. Jignesh Thaker",
                "Room 305",
                "CSE",
                "Lecture",
                "A",
                "",
                "Thu",
                "12:40",
                "13:30"));
        sessions.add(new Session(
                "S23",
                "EMBAT24202",
                "Discrete Mathematics and Graph Theory",
                "Dr. Sougata Mandal",
                "Room 305",
                "CSE",
                "Tutorial",
                "",
                "A3",
                "Thu",
                "13:30",
                "15:10"));
        sessions.add(new Session(
                "S24",
                "ECSAJ24204",
                "Ideation and Conceptualization",
                "Ms. Devashree Oza",
                "Room 303B",
                "CSE",
                "Lab",
                "",
                "A2",
                "Thu",
                "13:30",
                "15:10"));
        // Friday TimeTable CSE A
        sessions.add(new Session(
                "S25",
                "ECSCI24203",
                "Operating System",
                "Dr. Hitesh Chhinkaniwala",
                "Room 305",
                "CSE",
                "Lecture",
                "A",
                "",
                "Fri",
                "09:10",
                "10:00"));
        sessions.add(new Session(
                "S26",
                "ECSCI24203",
                "Data Communication and Computer Networks",
                "Dr. Mani Shekhar Gupta",
                "Room 305",
                "CSE",
                "Lecture",
                "A",
                "",
                "Fri",
                "10:00",
                "10:50"));
        sessions.add(new Session(
                "S27",
                "EPDAJ24201",
                "Career Development Cell",
                "",
                "Room 203",
                "CSE",
                "Lecture",
                "A",
                "",
                "Fri",
                "11:00",
                "11:50"));
        sessions.add(new Session(
                "S28",
                "ECSCI24203",
                "Object Oriented Programming with Java",
                "Dr. Tejas Modi",
                "Room 305",
                "CSE",
                "Lecture",
                "A",
                "",
                "Fri",
                "12:40",
                "13:30"));
        sessions.add(new Session(
                "S29",
                "ECSCI24203",
                "Object Oriented Programming with Java",
                "Ms. Nidhi Acharya",
                "Lab 203",
                "CSE",
                "Lab",
                "",
                "A1",
                "Fri",
                "13:30",
                "15:10"));
        sessions.add(new Session(
                "S30",
                "EICCI24203",
                "Data Communication and Communication Networks",
                "Dr. Mani Shekhar Gupta",
                "Lab 201",
                "CSE",
                "Lab",
                "",
                "A2",
                "Fri",
                "13:30",
                "15:10"));
        sessions.add(new Session(
                "S31",
                "ECSCI24203",
                "Operating System",
                "Dr. Anubhava Shrivastava",
                "Lab 403",
                "CSE",
                "Lab",
                "",
                "A3",
                "Fri",
                "13:30",
                "15:10"));

        return sessions;
    }
}

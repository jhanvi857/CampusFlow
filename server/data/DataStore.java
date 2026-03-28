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
        // Monday TimeTable CSE A
        sessions.add(new Session(
            "1",
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
            "10:00"
        ));
        sessions.add(new Session(
            "2",
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
            "10:50"
        ));
        sessions.add(new Session(
            "3",
            "ECSCI224203",
            "Object Oriented Programming With Java Lab",
            "Dr. Tejas Modi",
            "Lab 203",
            "CSE",
            "Lab",
            "",
            "A2",
            "Monday",
            "11:00",
            "12:40"
        ));
        sessions.add(new Session(
            "3",
            "ECSCI24204",
            "Operating System",
            "Dr. Ritu Patel",
            "Lab 403",
            "CSE",
            "Lab",
            "",
            "A1",
            "Monday",
            "11:00",
            "12:40"
        ));
        sessions.add(new Session(
            "3",
            "EICCI24203",
            "Data Communication and Computer Netwroks",
            "Dr. Mani Shekhar Gupta",
            "Lab 201",
            "CSE",
            "Lab",
            "",
            "A3",
            "Monday",
            "11:00",
            "12:40"
        ));
        sessions.add(new Session(
            "4",
            "EMABT24202",
            "Discrete Mathematics and Graph Theory",
            "Mr. Mitesh Bhavsar",
            "Room 305",
            "CSE",
            "Tutorial",
            "",
            "A1",
            "Monday",
            "13:30",
            "14:20"
        ));
        sessions.add(new Session(
            "4",
            "ECSAJ24202",
            "Ideation and Conceptualization",
            "Dr. Mihir Velani",
            "Room 303B",
            "CSE",
            "Lab",
            "",
            "A3",
            "Monday",
            "13:30",
            "14:20"
        ));
        // Tuesday TimeTable CSE A
        sessions.add(new Session(
            "1",
            "ECSCI24204",
            "Operating System",
            "Dr. Hitesh Chhinkaniwala",
            "Room 305",
            "CSE",
            "Lecture",
            "A",
            "",
            "Tuesday",
            "10:00",
            "10:50"
        ));
        sessions.add(new Session(
            "2",
            "EICCI24203",
            "Data Communication and Computer Netwroks",
            "Dr. Mani Shekhar Gupta",
            "Room 305",
            "CSE",
            "Lecture",
            "A",
            "",
            "Tuesday",
            "11:00",
            "12:40"
        ));
        sessions.add(new Session(
            "3",
            "EMABT24202",
            "Discrete Mathematics and Graph Theory",
            "Dr. Sougata Mandal",
            "Room 305",
            "CSE",
            "Lecture",
            "A",
            "",
            "Tuesday",
            "12:40",
            "13:30"
        ));
        sessions.add(new Session(
            "4",
            "EMSAT24201",
            "Engineering Economics",
            "Dr. Jignesh Thaker",
            "Room 305",
            "CSE",
            "Lecture",
            "A",
            "",
            "Tuesday",
            "13:30",
            "14:20"
        ));
        //Wednesday TimeTable CSE A
        sessions.add(new Session(
            "1",
            "ECSCI24204",
            "Operating System",
            "Dr. Hitesh Chhinkaniwala",
            "Room 305",
            "CSE",
            "Lecture",
            "a",
            "",
            "Wednesday",
            "09:10",
            "10:00"
        ));
        sessions.add(new Session(
            "2",
            "EMABT24202",
            "Discrete Mathematics and Graph Theory",
            "Dr. Ashlesha Bhise",
            "Room 305",
            "CSE",
            "Lecture",
            "A",
            "",
            "Wednesday",
            "10:00",
            "10:50"
        ));
        sessions.add(new Session(
            "3",
            "EICCI24203",
            "Data Communication and Computer Netwroks",
            "Dr. Mani Shekhar Gupta",
            "Lab 201",
            "CSE",
            "Lab",
            "",
            "A1",
            "Wednesday",
            "11:00",
            "12:40"
        ));
        sessions.add(new Session(
            "3",
            "ECSCI24203",
            "Object Oriented Programming with Java",
            "Ms. Nidhi Acharya",
            "Lab 401",
            "CSE",
            "Lab",
            "",
            "A3",
            "Wednesday",
            "11:00",
            "12:40"
        ));
        sessions.add(new Session(
            "3",
            "ECSCI24204",
            "Operating System ",
            "Dr. Anubhava Shrivastava",
            "Lab 403",
            "CSE",
            "Lab",
            "",
            "A2",
            "Wednesday",
            "11:00",
            "12:40"
        ));
        sessions.add(new Session(
            "4",
            "EMABT24202",
            "Discrete Mathematics and Graph Theory",
            "Dr. Sougata Mandal",
            "Room 305",
            "CSE",
            "Tutorial",
            "",
            "A2",
            "Wednesday",
            "13:30",
            "15:10"
        ));
        sessions.add(new Session(
            "4",
            "ECSAJ24204",
            "Ideation and Conceptualization",
            "Ms. Devashree Oza",
            "Room 303B",
            "CSE",
            "Lab",
            "",
            "A1",
            "Wedanesday",
            "13:30",
            "15:10"
        ));
        //Thursday TimeTable CSE A
        sessions.add(new Session(
            "1",
            "EICCI24203",
            "Data Communication and Computer Networks",
            "Dr. Mani Shekhar Gupta",
            "Room 305",
            "CSE",
            "Lecture",
            "A",
            "",
            "Thursday",
            "09:10",
            "10:00"
        ));
        sessions.add(new Session(
            "2",
            "EMBAT24202",
            "Discrete Mathematics and Graph Theory",
            "Dr. Sougata Mandal",
            "Room 305",
            "CSE",
            "Lab",
            "A",
            "",
            "Thursday",
            "10:00",
            "10:50"
        ));
        sessions.add(new Session(
            "3",
            "ECSCI24203",
            "Object Oriented Programming with Java",
            "Dr. Tejas Modi",
            "Room 305",
            "CSE",
            "Lecture",
            "A",
            "",
            "Thursday",
            "11:00",
            "11:50"
        ));
        sessions.add(new Session(
            "4",
            "",
            "Engineering Economics",
            "Dr. Jignesh Thaker",
            "Room 305",
            "CSE",
            "Lecture",
            "A",
            "",
            "Thursday",
            "12:40",
            "13:30"
        ));
        sessions.add(new Session(
            "5",
            "EMBAT24202",
            "Discrete Mathematics and Graph Theory",
            "Dr. Sougata Mandal",
            "Room 305",
            "CSE",
            "Tutorial",
            "",
            "A3",
            "Thursday",
            "13:30",
            "15:10"
        ));
        sessions.add(new Session(
            "5",
            "ECSAJ24204",
            "Ideation and Conceptualization",
            "Ms. Devashree Oza",
            "Room 303B",
            "CSE",
            "Lab",
            "",
            "A2",
            "Thusrday",
            "13:30",
            "15:10"
        ));
        return sessions;
    }
}

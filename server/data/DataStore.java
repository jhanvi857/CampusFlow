package data;

import java.util.ArrayList;
import java.util.List;

import model.Session;

public class DataStore {
    public static List<Session> getSessions() {
        List<Session> sessions = new ArrayList<>();

        sessions.add(new Session(
            "1",
            "CS101",
            "Operating systems",
            "Hitesh chhikniwala",
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
            "CS202",
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
            "CS102",
            "Object Oriented Programming With Java Lab",
            "Dr. Tejas Modi",
            "Room 102",
            "CSE",
            "Lab",
            "",
            "A2",
            "Monday",
            "11:00",
            "12:40"
        ));

        sessions.add(new Session(
            "4",
            "CS102",
            "Osperating System",
            "Dr. Ritu Patel",
            "Room 103",
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
            "CS102",
            "Data Communication and Computer Netwroks",
            "Dr. Mani Shekhar Gupta",
            "Room 104",
            "CSE",
            "Lab",
            "",
            "A3",
            "Monday",
            "11:00",
            "12:40"
        ));

        return sessions;
    }
}

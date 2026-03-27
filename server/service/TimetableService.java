package service;

import data.DataStore;
import model.Session;
import java.util.*;

public class TimetableService {

    public List<Session> getAllSessions() {
        return DataStore.getSessions();
    }
}
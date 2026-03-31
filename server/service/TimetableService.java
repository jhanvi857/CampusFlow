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
}
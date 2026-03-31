package data;

import java.util.ArrayList;
import java.util.List;
import java.util.Iterator;
import model.Session;

public class ExtraSessionStore {
    private static final List<Session> extraSessions = new ArrayList<>();
    // sessions will expire after 24 hours of creation for simplicity
    private static final long EXPIRY_MS = 24 * 60 * 60 * 1000L; 

    public static synchronized void addSession(Session session) {
        extraSessions.add(session);
    }

    public static synchronized void removeSession(String id) {
        extraSessions.removeIf(s -> s.id.equals(id));
    }

    public static synchronized List<Session> getAllSessions() {
        cleanupOldSessions();
        return new ArrayList<>(extraSessions);
    }

    private static void cleanupOldSessions() {
        long current = System.currentTimeMillis();
        Iterator<Session> it = extraSessions.iterator();
        while (it.hasNext()) {
            Session s = it.next();
            if (current - s.createdAt > EXPIRY_MS) {
                it.remove();
            }
        }
    }
}

package data;

import java.util.HashSet;
import java.util.Set;

public class CancelledSessionStore {
    private static final Set<String> cancelledIds = new HashSet<>();

    public static void cancelSession(String id) {
        cancelledIds.add(id);
    }

    public static void restoreSession(String id) {
        cancelledIds.remove(id);
    }

    public static boolean isCancelled(String id) {
        return cancelledIds.contains(id);
    }

    public static Set<String> getCancelledIds() {
        return cancelledIds;
    }
}

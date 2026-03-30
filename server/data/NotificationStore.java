package data;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;
import model.Notification;

public class NotificationStore {
    private static final List<Notification> notifications = new ArrayList<>();
    private static final AtomicInteger counter = new AtomicInteger(0);

    public static synchronized String nextId() {
        return "NOTIF-" + counter.incrementAndGet();
    }

    public static synchronized void addNotification(Notification notification) {
        notifications.add(0, notification); // newest first
    }

    public static synchronized List<Notification> getAllNotifications() {
        return new ArrayList<>(notifications);
    }

    public static synchronized boolean markAsRead(String id) {
        for (Notification n : notifications) {
            if (n.id.equals(id)) {
                n.isRead = true;
                return true;
            }
        }
        return false;
    }

    public static synchronized boolean markAllAsRead() {
        for (Notification n : notifications) {
            n.isRead = true;
        }
        return true;
    }

    public static synchronized int getUnreadCount() {
        int count = 0;
        for (Notification n : notifications) {
            if (!n.isRead) count++;
        }
        return count;
    }
}

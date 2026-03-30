import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getNotifications, createNotification as apiCreateNotification, markNotificationRead as apiMarkRead, markAllNotificationsRead as apiMarkAllRead } from '../services/api';

const NotificationContext = createContext(null);

const POLL_INTERVAL = 8000; // Poll every 8 seconds
const LOCAL_STORAGE_KEY = 'campusflow-notifications';

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastFetched, setLastFetched] = useState(0);

  // Load from localStorage as instant cache
  useEffect(() => {
    try {
      const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.notifications) {
          setNotifications(parsed.notifications);
          setUnreadCount(parsed.unreadCount || 0);
        }
      }
    } catch { /* ignore */ }
  }, []);

  // Save to localStorage when data changes
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({ notifications, unreadCount }));
  }, [notifications, unreadCount]);

  const fetchNotifications = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      setError(null);
      const data = await getNotifications();
      if (data && data.notifications) {
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount || 0);
      }
      setLastFetched(Date.now());
    } catch (err) {
      if (!silent) setError(err.message);
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  // Initial fetch + polling
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(() => fetchNotifications(true), POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const sendNotification = useCallback(async (data) => {
    try {
      const result = await apiCreateNotification(data);
      if (result.success) {
        // Optimistic update
        if (result.notification) {
          setNotifications(prev => [result.notification, ...prev]);
          setUnreadCount(prev => prev + 1);
        }
        // Refresh from server
        setTimeout(() => fetchNotifications(true), 500);
      }
      return result;
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, [fetchNotifications]);

  const markAsRead = useCallback(async (id) => {
    try {
      // Optimistic update
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
      await apiMarkRead(id);
    } catch (err) {
      fetchNotifications(true); // revert on error
    }
  }, [fetchNotifications]);

  const markAllAsRead = useCallback(async () => {
    try {
      // Optimistic update
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
      await apiMarkAllRead();
    } catch (err) {
      fetchNotifications(true);
    }
  }, [fetchNotifications]);

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      loading,
      error,
      sendNotification,
      markAsRead,
      markAllAsRead,
      fetchNotifications,
      lastFetched
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within a NotificationProvider');
  return ctx;
};

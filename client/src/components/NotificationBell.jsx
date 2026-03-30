import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useNotifications } from '../context/NotificationContext'

function formatTimeAgo(timestamp) {
  const now = Date.now()
  const diff = now - timestamp
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

function getTypeIcon(type) {
  switch (type) {
    case 'reschedule': return '🔄'
    case 'extra': return '➕'
    case 'cancellation': return '❌'
    default: return '📢'
  }
}

function getTypeBadgeClass(type) {
  switch (type) {
    case 'reschedule': return 'bg-amber-100 text-amber-700 border-amber-200'
    case 'extra': return 'bg-honolulu-50 text-honolulu-700 border-honolulu-200'
    case 'cancellation': return 'bg-red-50 text-red-700 border-red-200'
    default: return 'bg-slate-50 text-slate-700 border-slate-200'
  }
}

function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)
  const navigate = useNavigate()
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications()

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    if (isOpen) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  const recentNotifications = notifications.slice(0, 5)

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative grid h-10 w-10 place-items-center rounded-xl border border-honolulu-100/60 bg-white/70 text-slate-500 transition-all duration-300 hover:border-honolulu-200 hover:bg-honolulu-50 hover:text-honolulu-600 hover:shadow-md hover:shadow-honolulu-500/10"
        aria-label="Notifications"
        id="notification-bell"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
        </svg>

        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-rose-600 text-[10px] font-black text-white shadow-lg shadow-red-500/30 ring-2 ring-white animate-bounce-subtle">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 top-14 z-[100] w-[380px] overflow-hidden rounded-2xl border border-honolulu-100/50 bg-white/95 backdrop-blur-2xl shadow-2xl shadow-slate-900/10 animate-in-notification">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold text-slate-800">Notifications</h3>
              {unreadCount > 0 && (
                <span className="rounded-full bg-gradient-to-r from-honolulu-500 to-amethyst-500 px-2.5 py-0.5 text-[10px] font-black text-white">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllAsRead()}
                className="text-[11px] font-bold text-honolulu-500 hover:text-honolulu-700 transition-colors"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Notification List */}
          <div className="max-h-[360px] overflow-y-auto">
            {recentNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-6">
                <div className="mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-honolulu-50 to-amethyst-50 text-2xl">
                  🔔
                </div>
                <p className="text-sm font-semibold text-slate-500">No notifications yet</p>
                <p className="mt-1 text-xs text-slate-400">Notifications will appear when lectures are rescheduled</p>
              </div>
            ) : (
              recentNotifications.map((notif) => (
                <button
                  key={notif.id}
                  onClick={() => {
                    markAsRead(notif.id)
                    setIsOpen(false)
                    navigate('/notifications')
                  }}
                  className={`w-full text-left px-5 py-4 border-b border-slate-50 transition-all duration-200 hover:bg-honolulu-50/40 ${
                    !notif.isRead ? 'bg-honolulu-50/20' : ''
                  }`}
                >
                  <div className="flex gap-3">
                    <div className="mt-0.5 flex-shrink-0">
                      <span className="text-lg">{getTypeIcon(notif.type)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`inline-block rounded-md border px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider ${getTypeBadgeClass(notif.type)}`}>
                          {notif.type}
                        </span>
                        {!notif.isRead && (
                          <span className="h-2 w-2 rounded-full bg-honolulu-500 animate-pulse" />
                        )}
                      </div>
                      <p className="text-sm font-bold text-slate-800 leading-snug truncate">{notif.title}</p>
                      <p className="mt-0.5 text-xs text-slate-500 line-clamp-2">{notif.message}</p>
                      <p className="mt-1.5 text-[10px] font-semibold text-slate-400">{formatTimeAgo(notif.timestamp)}</p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="border-t border-slate-100 p-3">
              <button
                onClick={() => { setIsOpen(false); navigate('/notifications') }}
                className="w-full rounded-xl bg-gradient-to-r from-honolulu-50 to-amethyst-50 py-2.5 text-center text-xs font-bold text-honolulu-600 transition-all hover:from-honolulu-100 hover:to-amethyst-100 hover:shadow-sm"
              >
                View All Notifications →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default NotificationBell

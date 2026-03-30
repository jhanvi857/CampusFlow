import { useState, useMemo } from 'react'
import { useNotifications } from '../context/NotificationContext'
import { useAuth } from '../context/AuthContext'

function formatTime(timestamp) {
  const d = new Date(timestamp)
  const now = new Date()
  const diff = now - d
  const mins = Math.floor(diff / 60000)
  
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins} minute${mins > 1 ? 's' : ''} ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs} hour${hrs > 1 ? 's' : ''} ago`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function formatFullDate(timestamp) {
  return new Date(timestamp).toLocaleString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function getTypeConfig(type) {
  switch (type) {
    case 'reschedule':
      return {
        icon: '🔄',
        label: 'Rescheduled',
        gradient: 'from-amber-500 to-orange-500',
        bgLight: 'bg-amber-50',
        borderColor: 'border-amber-200',
        textColor: 'text-amber-700',
        dotColor: 'bg-amber-500'
      }
    case 'extra':
      return {
        icon: '➕',
        label: 'Extra Lecture',
        gradient: 'from-honolulu-500 to-cyan-500',
        bgLight: 'bg-honolulu-50',
        borderColor: 'border-honolulu-200',
        textColor: 'text-honolulu-700',
        dotColor: 'bg-honolulu-500'
      }
    case 'cancellation':
      return {
        icon: '❌',
        label: 'Cancelled',
        gradient: 'from-red-500 to-rose-500',
        bgLight: 'bg-red-50',
        borderColor: 'border-red-200',
        textColor: 'text-red-700',
        dotColor: 'bg-red-500'
      }
    default:
      return {
        icon: '📢',
        label: 'Update',
        gradient: 'from-slate-500 to-slate-600',
        bgLight: 'bg-slate-50',
        borderColor: 'border-slate-200',
        textColor: 'text-slate-700',
        dotColor: 'bg-slate-500'
      }
  }
}

function Notifications() {
  const { user } = useAuth()
  const { notifications, unreadCount, markAsRead, markAllAsRead, loading } = useNotifications()
  const [filter, setFilter] = useState('all')
  const [expandedId, setExpandedId] = useState(null)

  const isStudent = user?.role === 'student'

  // Filter notifications relevant to the current student
  const relevantNotifications = useMemo(() => {
    if (!isStudent) return notifications

    const clean = (str) => (str || '').toLowerCase().replace(/[\s.-]/g, '')
    const uCourse = clean(user?.course || '')
    const uSection = clean(user?.section || '')
    const uBatch = clean(user?.batch || '')

    return notifications.filter(n => {
      const nClass = clean(n.className || '')
      const nSection = clean(n.section || '')
      const nBatch = clean(n.batch || '')

      const classMatch = !uCourse || nClass.includes(uCourse) || !nClass
      const sectionMatch = !uSection || nSection === uSection || !nSection
      const batchMatch = !uBatch || nBatch === uBatch || !nBatch

      return classMatch && sectionMatch && batchMatch
    })
  }, [notifications, user, isStudent])

  const filteredNotifications = useMemo(() => {
    if (filter === 'all') return relevantNotifications
    if (filter === 'unread') return relevantNotifications.filter(n => !n.isRead)
    return relevantNotifications.filter(n => n.type === filter)
  }, [relevantNotifications, filter])

  const toggleExpand = (id) => {
    setExpandedId(prev => prev === id ? null : id)
    // Mark as read when expanding
    const notif = notifications.find(n => n.id === id)
    if (notif && !notif.isRead) {
      markAsRead(id)
    }
  }

  if (loading && notifications.length === 0) {
    return (
      <div className="glass-card p-8 text-center">
        <div className="inline-block h-8 w-8 rounded-full border-2 border-honolulu-200 border-t-honolulu-500 animate-spin mb-3" />
        <p className="text-base font-medium text-honolulu-600">Loading notifications...</p>
      </div>
    )
  }

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="glass-card-strong relative overflow-hidden p-6">
        <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-honolulu-500 via-amethyst-500 to-honolulu-500" />
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-slate-800">
              <span className="bg-gradient-to-r from-honolulu-500 to-amethyst-500 bg-clip-text text-transparent">Notifications</span>
            </h1>
            <p className="mt-2 text-slate-500">
              {isStudent
                ? 'Stay updated with lecture reschedules, extra classes, and schedule changes.'
                : 'Track all schedule change notifications sent to students.'}
            </p>
          </div>

          <div className="flex gap-2">
            <div className="stat-pill py-2 px-4 flex flex-col items-center">
              <span className="text-[9px] font-bold uppercase tracking-widest text-honolulu-500">Total</span>
              <span className="text-xl font-black text-slate-800">{relevantNotifications.length}</span>
            </div>
            {unreadCount > 0 && (
              <div className="stat-pill-purple py-2 px-4 flex flex-col items-center">
                <span className="text-[9px] font-bold uppercase tracking-widest text-amethyst-500">Unread</span>
                <span className="text-xl font-black text-slate-800">{unreadCount}</span>
              </div>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="mt-6 flex flex-wrap items-center gap-2">
          {[
            { value: 'all', label: 'All' },
            { value: 'unread', label: 'Unread' },
            { value: 'reschedule', label: '🔄 Rescheduled' },
            { value: 'extra', label: '➕ Extra' },
          ].map(f => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-300 ${
                filter === f.value
                  ? 'bg-gradient-to-r from-honolulu-500 to-amethyst-500 text-white shadow-md shadow-honolulu-500/20'
                  : 'bg-white/60 text-slate-500 border border-slate-100 hover:bg-honolulu-50 hover:text-honolulu-700'
              }`}
            >
              {f.label}
            </button>
          ))}

          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="ml-auto rounded-xl border border-honolulu-200 bg-honolulu-50 px-4 py-2 text-sm font-bold text-honolulu-600 transition-all hover:bg-honolulu-100 hover:shadow-sm"
            >
              ✓ Mark All Read
            </button>
          )}
        </div>
      </div>

      {/* Notification Cards */}
      {filteredNotifications.length === 0 ? (
        <div className="glass-card border-dashed p-16 text-center">
          <div className="mx-auto mb-4 grid h-20 w-20 place-items-center rounded-3xl bg-gradient-to-br from-honolulu-50 to-amethyst-50 text-4xl">
            🔔
          </div>
          <p className="text-lg font-bold text-slate-500">No notifications found</p>
          <p className="mt-2 text-sm text-slate-400">
            {filter !== 'all'
              ? 'Try changing the filter to see more notifications.'
              : 'Notifications will appear here when faculty reschedules or adds lectures.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3 animate-in fade-in duration-700">
          {filteredNotifications.map((notif, idx) => {
            const config = getTypeConfig(notif.type)
            const isExpanded = expandedId === notif.id

            return (
              <div
                key={notif.id}
                className={`glass-card relative overflow-hidden transition-all duration-300 hover:shadow-lg ${
                  !notif.isRead ? 'ring-1 ring-honolulu-200/50 bg-white/90' : 'bg-white/70'
                }`}
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                {/* Unread indicator bar */}
                {!notif.isRead && (
                  <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${config.gradient}`} />
                )}

                <button
                  onClick={() => toggleExpand(notif.id)}
                  className="w-full text-left p-5 pl-6"
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={`flex-shrink-0 grid h-12 w-12 place-items-center rounded-2xl ${config.bgLight} border ${config.borderColor} text-xl transition-transform ${isExpanded ? 'scale-110' : ''}`}>
                      {config.icon}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className={`inline-flex items-center rounded-lg border px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${config.bgLight} ${config.textColor} ${config.borderColor}`}>
                          {config.label}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-400">
                          {formatTime(notif.timestamp)}
                        </span>
                        {!notif.isRead && (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-honolulu-500 ml-auto">
                            <span className="h-1.5 w-1.5 rounded-full bg-honolulu-500 animate-pulse" /> New
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-bold text-slate-800 leading-snug">{notif.title}</h3>
                      <p className="mt-1 text-sm text-slate-500 leading-relaxed">{notif.message}</p>

                      {/* Expand indicator */}
                      <div className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-honolulu-400">
                        <svg className={`h-3.5 w-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                        {isExpanded ? 'Hide details' : 'View details'}
                      </div>
                    </div>
                  </div>
                </button>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="border-t border-slate-100 bg-slate-50/50 px-6 py-5 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="grid gap-4 sm:grid-cols-2">
                      {/* Subject & Faculty */}
                      <div className="space-y-3">
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Subject</span>
                          <p className="mt-0.5 text-sm font-bold text-slate-800">{notif.subjectName || '—'}</p>
                        </div>
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Faculty</span>
                          <p className="mt-0.5 text-sm font-bold text-slate-800">{notif.faculty || '—'}</p>
                        </div>
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Class / Section / Batch</span>
                          <p className="mt-0.5 text-sm font-bold text-slate-800">
                            {[notif.className, notif.section, notif.batch].filter(Boolean).join(' / ') || '—'}
                          </p>
                        </div>
                      </div>

                      {/* Schedule Change */}
                      <div className="space-y-3">
                        {notif.type === 'reschedule' && notif.oldDay && (
                          <div className="rounded-xl border border-red-100 bg-red-50/50 p-3">
                            <span className="text-[10px] font-black uppercase tracking-widest text-red-400">Original Schedule</span>
                            <div className="mt-1 flex items-center gap-2">
                              <span className="inline-block rounded-lg bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700">{notif.oldDay}</span>
                              <span className="text-sm font-bold text-red-800">{notif.oldStartTime} – {notif.oldEndTime}</span>
                            </div>
                            <p className="mt-1 text-xs text-red-600">{notif.oldRoom}</p>
                          </div>
                        )}

                        {notif.newDay && (
                          <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-3">
                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">New Schedule</span>
                            <div className="mt-1 flex items-center gap-2">
                              <span className="inline-block rounded-lg bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-700">{notif.newDay}</span>
                              <span className="text-sm font-bold text-emerald-800">{notif.newStartTime} – {notif.newEndTime}</span>
                            </div>
                            <p className="mt-1 text-xs text-emerald-600">{notif.newRoom}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Timestamp */}
                    <div className="mt-4 pt-3 border-t border-slate-100/80 flex items-center justify-between">
                      <span className="text-[10px] font-semibold text-slate-400">
                        {formatFullDate(notif.timestamp)}
                      </span>
                      {!notif.isRead && (
                        <button
                          onClick={(e) => { e.stopPropagation(); markAsRead(notif.id) }}
                          className="rounded-lg bg-honolulu-50 px-3 py-1.5 text-[11px] font-bold text-honolulu-600 transition-all hover:bg-honolulu-100"
                        >
                          Mark as Read
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}

export default Notifications

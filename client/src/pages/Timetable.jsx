import { useEffect, useMemo, useState } from 'react'
import SessionCard from '../components/SessionCard'
import ScheduleRequestForm from '../components/ScheduleRequestForm'
import { getTimetable } from '../services/api'

const BOOKED_SESSION_STORAGE_KEY = 'campusflow-booked-sessions'
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function toMinutes(timeValue) {
  if (!timeValue || !timeValue.includes(':')) {
    return null
  }

  const [hourText, minuteText] = timeValue.split(':')
  const hour = Number(hourText)
  const minute = Number(minuteText)

  if (Number.isNaN(hour) || Number.isNaN(minute)) {
    return null
  }

  return hour * 60 + minute
}

function toTimeLabel(totalMinutes) {
  const hour = Math.floor(totalMinutes / 60)
  const minute = totalMinutes % 60
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
}

function parseLegacyTimeFormat(raw) {
  if (!raw || typeof raw !== 'string') {
    return null
  }

  const normalized = raw.trim()
  const legacyMatch = normalized.match(/^([A-Za-z]{3})-(\d{1,2})(AM|PM)$/i)

  if (!legacyMatch) {
    return null
  }

  const day = legacyMatch[1]
  let hour = Number(legacyMatch[2])
  const suffix = legacyMatch[3].toUpperCase()

  if (suffix === 'PM' && hour !== 12) {
    hour += 12
  }

  if (suffix === 'AM' && hour === 12) {
    hour = 0
  }

  const start = hour * 60
  const end = start + 60

  return {
    day,
    start,
    end,
  }
}

function getSessionWindow(session) {
  const explicitDay = session.day
  const explicitStart = toMinutes(session.startTime)
  const explicitEnd = toMinutes(session.endTime)

  if (explicitDay && explicitStart !== null && explicitEnd !== null) {
    return {
      day: explicitDay,
      start: explicitStart,
      end: explicitEnd,
    }
  }

  return parseLegacyTimeFormat(session.time)
}

function sessionsOverlap(left, right) {
  return left.start < right.end && right.start < left.end
}

function isSameText(left, right) {
  if (!left || !right) {
    return false
  }

  return String(left).trim().toLowerCase() === String(right).trim().toLowerCase()
}

function toBookableSession(formData) {
  return {
    id: `CF-${Date.now()}`,
    subjectName: formData.subjectName,
    subjectCode: formData.subjectName,
    courseCode: formData.subjectName,
    faculty: formData.faculty,
    room: formData.venue,
    className: formData.className,
    section: formData.section,
    batch: formData.batch,
    sessionType: formData.sessionType,
    requestType: formData.requestType,
    day: formData.day,
    startTime: formData.startTime,
    endTime: formData.endTime,
    time: `${formData.day} ${formData.startTime}-${formData.endTime}`,
  }
}

function findConflicts(candidateSession, allSessions) {
  const candidateWindow = getSessionWindow(candidateSession)

  if (!candidateWindow) {
    return []
  }

  return allSessions.filter((session) => {
    const existingWindow = getSessionWindow(session)

    if (!existingWindow || existingWindow.day !== candidateWindow.day) {
      return false
    }

    if (!sessionsOverlap(candidateWindow, existingWindow)) {
      return false
    }

    const roomConflict = isSameText(candidateSession.room, session.room)
    const facultyConflict = isSameText(candidateSession.faculty, session.faculty)
    const sameClass = isSameText(candidateSession.className, session.className)
    const sectionConflict = sameClass && isSameText(candidateSession.section, session.section)
    const batchConflict = sameClass && isSameText(candidateSession.batch, session.batch)

    return roomConflict || facultyConflict || sectionConflict || batchConflict
  })
}

function findAlternativeSlots(baseSession, allSessions) {
  const baseStart = toMinutes(baseSession.startTime)
  const baseEnd = toMinutes(baseSession.endTime)
  const duration = baseStart !== null && baseEnd !== null && baseEnd > baseStart ? baseEnd - baseStart : 60
  const orderedDays = [baseSession.day, ...DAYS.filter((day) => day !== baseSession.day)]
  const suggestions = []

  for (const day of orderedDays) {
    for (let start = 8 * 60; start <= 18 * 60 - duration; start += 60) {
      const tentative = {
        ...baseSession,
        day,
        startTime: toTimeLabel(start),
        endTime: toTimeLabel(start + duration),
      }

      const conflicts = findConflicts(tentative, allSessions)

      if (!conflicts.length) {
        suggestions.push({
          day,
          startTime: tentative.startTime,
          endTime: tentative.endTime,
          venue: tentative.room,
        })
      }

      if (suggestions.length >= 4) {
        return suggestions
      }
    }
  }

  return suggestions
}

function normalizeTimetablePayload(payload) {
  if (Array.isArray(payload)) {
    return payload
  }

  if (payload && Array.isArray(payload.sessions)) {
    return payload.sessions
  }

  if (payload && typeof payload === 'object') {
    return Object.values(payload)
  }

  return []
}

function Timetable() {
  const [sessions, setSessions] = useState([])
  const [bookedSessions, setBookedSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [dayFilter, setDayFilter] = useState('all')

  useEffect(() => {
    try {
      const cached = localStorage.getItem(BOOKED_SESSION_STORAGE_KEY)
      if (!cached) {
        return
      }

      const parsed = JSON.parse(cached)
      if (Array.isArray(parsed)) {
        setBookedSessions(parsed)
      }
    } catch {
      setBookedSessions([])
    }
  }, [])

  useEffect(() => {
    async function loadTimetable() {
      try {
        setLoading(true)
        setError('')
        const data = await getTimetable()
        setSessions(normalizeTimetablePayload(data))
      } catch (err) {
        setError(err.message || 'Unable to load timetable data')
      } finally {
        setLoading(false)
      }
    }

    loadTimetable()
  }, [])

  useEffect(() => {
    localStorage.setItem(BOOKED_SESSION_STORAGE_KEY, JSON.stringify(bookedSessions))
  }, [bookedSessions])

  const allSessions = useMemo(() => [...sessions, ...bookedSessions], [bookedSessions, sessions])

  const stats = useMemo(() => {
    const base = {
      total: allSessions.length,
      lecture: 0,
      lab: 0,
      tutorial: 0,
    }

    allSessions.forEach((session) => {
      const type = (session.sessionType || '').toLowerCase()
      if (type === 'lecture') {
        base.lecture += 1
      } else if (type === 'lab') {
        base.lab += 1
      } else if (type === 'tutorial') {
        base.tutorial += 1
      }
    })

    return base
  }, [allSessions])

  const uniqueDays = useMemo(() => {
    const days = allSessions
      .map((session) => session.day)
      .filter(Boolean)
      .map((day) => String(day))
    return [...new Set(days)]
  }, [allSessions])

  const filteredSessions = useMemo(() => {
    return allSessions.filter((session) => {
      const typeText = (session.sessionType || '').toLowerCase()
      const dayText = (session.day || '').toLowerCase()
      const haystack = [
        session.subjectName,
        session.subjectCode,
        session.courseCode,
        session.faculty,
        session.className,
        session.section,
        session.batch,
        session.room,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      const matchesQuery = !query || haystack.includes(query.toLowerCase())
      const matchesType = typeFilter === 'all' || typeText === typeFilter
      const matchesDay = dayFilter === 'all' || dayText === dayFilter.toLowerCase()

      return matchesQuery && matchesType && matchesDay
    })
  }, [allSessions, dayFilter, query, typeFilter])

  function handleSlotRequest(formData) {
    const candidate = toBookableSession(formData)
    const conflicts = findConflicts(candidate, allSessions)

    if (!conflicts.length) {
      setBookedSessions((prev) => [...prev, candidate])
      return {
        ok: true,
        message: 'Slot is available. Session has been booked successfully.',
        bookedSlot: {
          day: candidate.day,
          startTime: candidate.startTime,
          endTime: candidate.endTime,
          venue: candidate.room,
        },
      }
    }

    const suggestions = findAlternativeSlots(candidate, allSessions)
    return {
      ok: false,
      message: 'Requested slot is not available due to a room, faculty, or section overlap.',
      suggestions,
    }
  }

  const content = useMemo(() => {
    if (loading) {
      return (
        <div className="rounded-2xl border border-campus-100 bg-white/90 p-8 text-center shadow-lg">
          <p className="text-base font-medium text-campus-700">Loading timetable sessions...</p>
        </div>
      )
    }

    if (error) {
      return (
        <div className="badge-conflict rounded-2xl p-6 text-center text-sm font-medium shadow-lg">
          {error}
        </div>
      )
    }

    if (!allSessions.length) {
      return (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white/75 p-8 text-center shadow-lg">
          <p className="text-slate-600">No timetable sessions found.</p>
        </div>
      )
    }

    if (!filteredSessions.length) {
      return (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white/75 p-8 text-center shadow-lg">
          <p className="text-slate-700">No sessions match your current filters.</p>
          <p className="mt-1 text-sm text-slate-500">Try clearing search text or selecting another type/day.</p>
        </div>
      )
    }

    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filteredSessions.map((session, index) => (
          <SessionCard
            key={session.id || session.sessionId || `${session.course || session.courseCode || 'session'}-${index}`}
            session={session}
          />
        ))}
      </div>
    )
  }, [allSessions, error, filteredSessions, loading])

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-panel">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">Timetable</h1>
        <p className="mt-2 text-slate-600">
          Browse complete academic sessions with class, type, section or batch, and exact time windows.
        </p>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-campus-100 bg-campus-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-campus-700">Total Sessions</p>
            <p className="mt-2 text-2xl font-black text-campus-800">{stats.total}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Lectures</p>
            <p className="mt-2 text-2xl font-black text-slate-900">{stats.lecture}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Labs</p>
            <p className="mt-2 text-2xl font-black text-slate-900">{stats.lab}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Tutorials</p>
            <p className="mt-2 text-2xl font-black text-slate-900">{stats.tutorial}</p>
          </div>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by subject, faculty, class, room..."
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-700 focus:border-campus-500 focus:outline-none"
          />
          <select
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value)}
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-700 focus:border-campus-500 focus:outline-none"
          >
            <option value="all">All Session Types</option>
            <option value="lecture">Lecture</option>
            <option value="lab">Lab</option>
            <option value="tutorial">Tutorial</option>
          </select>
          <select
            value={dayFilter}
            onChange={(event) => setDayFilter(event.target.value)}
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-700 focus:border-campus-500 focus:outline-none"
          >
            <option value="all">All Days</option>
            {uniqueDays.map((day) => (
              <option key={day} value={day}>
                {day}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <ScheduleRequestForm onRequest={handleSlotRequest} />
      </div>

      {content}
    </section>
  )
}

export default Timetable

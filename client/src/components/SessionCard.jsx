function valueOrFallback(value, fallback = 'Not assigned') {
  if (value === null || value === undefined || value === '') {
    return fallback
  }
  return String(value)
}

function SessionCard({ session }) {
  const course = session.subjectName || session.course || session.subjectCode || session.courseCode || session.courseName || session.subject || session.name || session.id || 'Course'
  const faculty = session.faculty || session.teacher || session.professor || session.instructor || 'Faculty TBD'
  const room = session.room || session.location || session.classroom || 'Room TBD'
  const className = session.className || session.class || 'Class TBD'
  const day = session.day || ''
  const start = session.startTime || ''
  const end = session.endTime || ''
  const fullTime = day && start && end ? `${day} ${start}-${end}` : session.time || session.slot || 'Time TBD'
  const section = session.section || session.class || session.batch || ''
  const batch = session.batch || ''
  const sessionType = session.sessionType || session.type || ''
  const topicLabel = session.subjectCode || session.courseCode || session.id
  const isLab = (sessionType || '').toLowerCase() === 'lab'
  const isBooked = session.id?.startsWith?.('CF-')

  return (
    <article className="timetable-cell glass-card group relative overflow-hidden p-5">
      <div className={`absolute inset-x-0 top-0 h-[3px] ${isLab ? 'bg-gradient-to-r from-amethyst-400 to-amethyst-600' : 'bg-gradient-to-r from-honolulu-400 to-amethyst-400'}`} />

      <div className="mb-4 flex items-start justify-between gap-2">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">{valueOrFallback(topicLabel)}</p>
          <h3 className="mt-1 text-lg font-bold tracking-tight text-slate-800 group-hover:text-honolulu-600 transition-colors">{valueOrFallback(course)}</h3>
        </div>
        <span className={`rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${isBooked ? 'bg-amethyst-50 text-amethyst-600 border border-amethyst-200' : 'bg-honolulu-50 text-honolulu-600 border border-honolulu-200'}`}>
          {isBooked ? 'Booked' : 'Session'}
        </span>
      </div>

      <div className="mb-4 flex flex-wrap gap-1.5">
        {!!sessionType && (
          <span className={`rounded-lg px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${isLab ? 'bg-amethyst-50 text-amethyst-600 border border-amethyst-200' : 'bg-honolulu-50 text-honolulu-600 border border-honolulu-200'}`}>
            {sessionType}
          </span>
        )}
        <span className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          {className}
        </span>
        {!!section && (
          <span className="rounded-lg border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Sec {section}
          </span>
        )}
        {!!batch && (
          <span className="rounded-lg border border-amethyst-200 bg-amethyst-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amethyst-600">
            Batch {batch}
          </span>
        )}
      </div>

      <div className="space-y-1.5 text-sm">
        <p className="flex items-center gap-2 text-slate-400">
          <span className="text-honolulu-500">◉</span>
          <span className="font-medium text-slate-600">{valueOrFallback(faculty)}</span>
        </p>
        <p className="flex items-center gap-2 text-slate-400">
          <span className="text-amethyst-500">◎</span>
          <span className="font-medium text-slate-600">{valueOrFallback(room)}</span>
        </p>
        <p className="flex items-center gap-2 text-slate-400">
          <span className="text-honolulu-400">◷</span>
          <span className="font-medium text-slate-600">{valueOrFallback(fullTime)}</span>
        </p>
      </div>
    </article>
  )
}

export default SessionCard

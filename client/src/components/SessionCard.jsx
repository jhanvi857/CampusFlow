function valueOrFallback(value, fallback = 'Not assigned') {
  if (value === null || value === undefined || value === '') {
    return fallback
  }

  return String(value)
}

function SessionCard({ session }) {
  const course =
    session.subjectName ||
    session.course ||
    session.subjectCode ||
    session.courseCode ||
    session.courseName ||
    session.subject ||
    session.name ||
    session.id ||
    'Course'

  const faculty =
    session.faculty || session.teacher || session.professor || session.instructor || 'Faculty TBD'

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

  return (
    <article className="timetable-cell rounded-3xl border border-slate-200/80 bg-white/90 p-5 shadow-lg backdrop-blur-sm hover:scale-[1.02] hover:shadow-xl">
      <div className="mb-4 flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{valueOrFallback(topicLabel)}</p>
          <h3 className="mt-1 text-lg font-extrabold tracking-tight text-slate-900">{valueOrFallback(course)}</h3>
        </div>
        <span className="rounded-full bg-campus-50 px-3 py-1 text-xs font-semibold text-campus-700">Session</span>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {!!sessionType && (
          <span className="rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
            {sessionType}
          </span>
        )}
        <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700">
          {className}
        </span>
        {!!section && (
          <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700">
            Section {section}
          </span>
        )}
        {!!batch && (
          <span className="rounded-full border border-indigo-100 bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">
            Batch {batch}
          </span>
        )}
      </div>

      <div className="space-y-2 text-sm text-slate-600">
        <p>
          <span className="font-semibold text-slate-800">Faculty:</span> {valueOrFallback(faculty)}
        </p>
        <p>
          <span className="font-semibold text-slate-800">Room:</span> {valueOrFallback(room)}
        </p>
        <p>
          <span className="font-semibold text-slate-800">Time:</span> {valueOrFallback(fullTime)}
        </p>
      </div>
    </article>
  )
}

export default SessionCard

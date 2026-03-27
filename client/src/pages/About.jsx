function About() {
  return (
    <section className="space-y-6">
      <article className="rounded-3xl border border-slate-200/80 bg-white/90 p-7 shadow-panel">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">About CampusFlow</h1>
        <p className="mt-3 max-w-4xl text-base leading-7 text-slate-600">
          CampusFlow is designed as an operations-grade academic platform that combines timetable planning, conflict
          intelligence, complaint escalation, and algorithm transparency. The objective is not just to display data,
          but to support decision-making for students, faculty, and campus administrators.
        </p>
      </article>

      <div className="grid gap-4 md:grid-cols-2">
        <article className="rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-panel">
          <h2 className="text-xl font-bold text-slate-900">What This Solves</h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            <li>Timetable conflicts caused by room/faculty/section overlap.</li>
            <li>Manual coordination burden for extra lectures and rescheduling.</li>
            <li>Unclear complaint routing for campus infrastructure issues.</li>
            <li>Lack of explainability in graph-based scheduling logic.</li>
          </ul>
        </article>

        <article className="rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-panel">
          <h2 className="text-xl font-bold text-slate-900">Production Readiness Path</h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            <li>Persist bookings and complaints in backend database.</li>
            <li>Role-based approvals for slot booking and complaint closure.</li>
            <li>Notification workflows (email, SMS, internal alerts).</li>
            <li>Audit logs and SLA analytics dashboards.</li>
          </ul>
        </article>
      </div>

      <article className="rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-panel">
        <h2 className="text-xl font-bold text-slate-900">Suggested Ownership Model For Complaints</h2>
        <div className="mt-4 grid gap-3 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Primary Layer</p>
            <p className="mt-1 font-bold text-slate-900">Category Owner Teams</p>
            <p className="mt-1 text-sm text-slate-600">IT, Facilities, Lab Tech, Electrical based on issue type.</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Escalation Layer</p>
            <p className="mt-1 font-bold text-slate-900">Ops Control Room</p>
            <p className="mt-1 text-sm text-slate-600">Handles SLA breach, repeated failures, and critical outages.</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Governance Layer</p>
            <p className="mt-1 font-bold text-slate-900">Dean / HoD Reviews</p>
            <p className="mt-1 text-sm text-slate-600">Monthly review of unresolved and recurring complaint patterns.</p>
          </div>
        </div>
      </article>
    </section>
  )
}

export default About

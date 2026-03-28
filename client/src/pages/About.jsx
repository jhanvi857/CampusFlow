function About() {
  return (
    <section className="space-y-6">
      <article className="glass-card-strong relative overflow-hidden p-7">
        <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-honolulu-500 via-amethyst-500 to-honolulu-500" />
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
          <span className="text-slate-800">About </span>
          <span className="bg-gradient-to-r from-honolulu-500 to-amethyst-500 bg-clip-text text-transparent">CampusFlow</span>
        </h1>
        <p className="mt-3 max-w-4xl text-base leading-7 text-slate-500">
          CampusFlow is designed as an operations-grade academic platform that combines timetable planning, conflict
          intelligence, complaint escalation, and algorithm transparency. The objective is not just to display data,
          but to support decision-making for students, faculty, and campus administrators.
        </p>
      </article>

      <div className="grid gap-4 md:grid-cols-2">
        <article className="glass-card relative overflow-hidden p-6">
          <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-honolulu-500 to-honolulu-300" />
          <h2 className="text-xl font-bold text-slate-800">What This Solves</h2>
          <ul className="mt-3 space-y-2.5 text-sm text-slate-500">
            {['Timetable conflicts caused by room/faculty/section overlap.','Manual coordination burden for extra lectures and rescheduling.','Unclear complaint routing for campus infrastructure issues.','Lack of explainability in graph-based scheduling logic.'].map(i => (
              <li key={i} className="flex items-start gap-2"><span className="mt-0.5 text-honolulu-500">◆</span><span>{i}</span></li>
            ))}
          </ul>
        </article>
        <article className="glass-card relative overflow-hidden p-6">
          <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-amethyst-500 to-amethyst-300" />
          <h2 className="text-xl font-bold text-slate-800">Production Readiness Path</h2>
          <ul className="mt-3 space-y-2.5 text-sm text-slate-500">
            {['Persist bookings and complaints in backend database.','Role-based approvals for slot booking and complaint closure.','Notification workflows (email, SMS, internal alerts).','Audit logs and SLA analytics dashboards.'].map(i => (
              <li key={i} className="flex items-start gap-2"><span className="mt-0.5 text-amethyst-500">◆</span><span>{i}</span></li>
            ))}
          </ul>
        </article>
      </div>

      <article className="glass-card relative overflow-hidden p-6">
        <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-honolulu-500 via-amethyst-500 to-honolulu-500" />
        <h2 className="text-xl font-bold text-slate-800">Suggested Ownership Model For Complaints</h2>
        <div className="mt-4 grid gap-3 lg:grid-cols-3">
          {[
            { layer: 'Primary Layer', title: 'Category Owner Teams', desc: 'IT, Facilities, Lab Tech, Electrical based on issue type.', c: 'honolulu' },
            { layer: 'Escalation Layer', title: 'Ops Control Room', desc: 'Handles SLA breach, repeated failures, and critical outages.', c: 'amethyst' },
            { layer: 'Governance Layer', title: 'Dean / HoD Reviews', desc: 'Monthly review of unresolved and recurring complaint patterns.', c: 'honolulu' },
          ].map(i => (
            <div key={i.layer} className={i.c === 'honolulu' ? 'stat-pill' : 'stat-pill-purple'}>
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">{i.layer}</p>
              <p className="mt-1 font-bold text-slate-800">{i.title}</p>
              <p className="mt-1 text-sm text-slate-500">{i.desc}</p>
            </div>
          ))}
        </div>
      </article>

      <article className="glass-card relative overflow-hidden p-6">
        <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-amethyst-500 to-honolulu-500" />
        <h2 className="text-xl font-bold text-slate-800">Technology Stack</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <div className="stat-pill"><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-honolulu-500">Frontend</p><p className="mt-1 text-sm text-slate-600">React 19 • React Router • Vite • Tailwind CSS</p></div>
          <div className="stat-pill-purple"><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-amethyst-500">Backend</p><p className="mt-1 text-sm text-slate-600">Java • NioFlow Framework • Graph Algorithms</p></div>
        </div>
      </article>

      <article className="glass-card relative overflow-hidden p-6">
        <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-honolulu-500 to-amethyst-500" />
        <h2 className="text-xl font-bold text-slate-800">Academic Value</h2>
        <p className="mt-2 text-sm text-slate-500">This project demonstrates practical use of:</p>
        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {['Graph representation using adjacency lists','Resource conflict detection via interval overlap','DFS-based cycle detection','Full-stack integration (UI ↔ Backend)','Applied campus scheduling modeling','Complaint routing automation'].map(i => (
            <div key={i} className="flex items-center gap-2 rounded-lg border border-honolulu-100 bg-honolulu-50/40 p-3 text-sm text-slate-600">
              <span className="text-amethyst-500">✧</span>{i}
            </div>
          ))}
        </div>
      </article>
    </section>
  )
}

export default About

import { Link } from 'react-router-dom'

function Home() {
  return (
    <section className="space-y-8">
      {/* Hero */}
      <article className="glass-card-strong relative overflow-hidden px-6 py-16 sm:px-10 lg:px-14">
        <div className="pointer-events-none absolute -left-24 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-honolulu-400/10 blur-[80px] animate-pulse-glow" />
        <div className="pointer-events-none absolute -right-20 top-10 h-56 w-56 rounded-full bg-amethyst-400/10 blur-[80px] animate-pulse-glow" style={{ animationDelay: '1.5s' }} />
        <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-honolulu-400 via-amethyst-400 to-honolulu-400" />

        <div className="relative grid gap-12 lg:grid-cols-[1.4fr_1fr] lg:items-end">
          <div className="max-w-3xl animate-in">
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-honolulu-200 bg-honolulu-50 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-honolulu-600">
              <span className="h-1.5 w-1.5 rounded-full bg-honolulu-500 animate-pulse" />
              Campus Scheduling Insights
            </p>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
              <span className="text-slate-800">Graph-Based</span>
              <br />
              <span className="bg-gradient-to-r from-honolulu-500 via-amethyst-500 to-honolulu-400 bg-clip-text text-transparent">
                Academic Visualization
              </span>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-slate-500 sm:text-lg">
              CampusFlow transforms timetable complexity into a decision dashboard for academic operations,
              combining slot planning, conflict maps, and smart alternatives in one place.
            </p>

            <div className="mt-10 flex flex-wrap gap-3">
              <Link to="/timetable" className="btn-brand">Open Timetable Studio</Link>
              <Link to="/conflicts" className="btn-secondary">Explore Conflict Graph</Link>
              <Link to="/graph-lab" className="btn-secondary">Open Graph Lab</Link>
            </div>
          </div>

          <div className="grid gap-3 animate-in delay-2">
            <div className="stat-pill">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Visibility</p>
              <p className="mt-1 text-xl font-extrabold text-slate-800">Live Timetable</p>
            </div>
            <div className="stat-pill-purple">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Decision Support</p>
              <p className="mt-1 text-xl font-extrabold text-slate-800">Instant Suggestions</p>
            </div>
            <div className="stat-pill-danger">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Risk Detection</p>
              <p className="mt-1 text-xl font-extrabold text-slate-800">Conflict Mapping</p>
            </div>
          </div>
        </div>
      </article>

      {/* Feature cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {[
          { tag: 'Timetable View', title: 'Session-Centric Cards', desc: 'Each entry highlights subject, class, type, section or batch, room, and exact duration.', accent: 'honolulu' },
          { tag: 'Planner', title: 'Extra + Reschedule Flow', desc: 'Faculty can request slots with complete metadata and book immediately when capacity is free.', accent: 'amethyst' },
          { tag: 'Conflict Graph', title: 'Network-Level Insights', desc: 'Visual edges expose faculty, room, section, and batch overlaps across concurrent sessions.', accent: 'mixed' },
        ].map((card) => (
          <article key={card.tag} className="glass-card group relative overflow-hidden p-6 animate-in delay-3">
            <div className={`absolute inset-x-0 top-0 h-[3px] ${card.accent === 'honolulu' ? 'bg-gradient-to-r from-honolulu-500 to-honolulu-300' : card.accent === 'amethyst' ? 'bg-gradient-to-r from-amethyst-500 to-amethyst-300' : 'bg-gradient-to-r from-honolulu-500 to-amethyst-500'}`} />
            <h3 className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">{card.tag}</h3>
            <p className="mt-3 text-xl font-extrabold text-slate-800">{card.title}</p>
            <p className="mt-2 text-sm leading-6 text-slate-500">{card.desc}</p>
          </article>
        ))}
      </div>

      {/* Operations & Graph Lab */}
      <div className="grid gap-4 lg:grid-cols-2">
        <article className="glass-card relative overflow-hidden p-7">
          <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-amethyst-500 to-honolulu-500" />
          <h3 className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Campus Operations</h3>
          <p className="mt-3 text-2xl font-extrabold text-slate-800">Complaint Escalation Studio</p>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Report issues like AC, projector, lab equipment, electrical faults, or internet outages. CampusFlow
            recommends the correct department automatically and tracks action status.
          </p>
          <Link to="/complaints" className="btn-brand mt-5 inline-block">Go to Complaints Center</Link>
        </article>
        <article className="glass-card relative overflow-hidden p-7">
          <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-honolulu-500 to-amethyst-500" />
          <h3 className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Explainable Algorithms</h3>
          <p className="mt-3 text-2xl font-extrabold text-slate-800">Graph Build + Cycle Detection Demo</p>
          <p className="mt-2 text-sm leading-6 text-slate-500">See how nodes and edges are constructed, then run cycle detection step-by-step.</p>
          <Link to="/graph-lab" className="btn-brand mt-5 inline-block">Launch Graph Playground</Link>
        </article>
      </div>

      {/* Roadmap */}
      <section className="glass-card relative overflow-hidden p-8">
        <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-honolulu-500 via-amethyst-500 to-honolulu-500" />
        <h3 className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Roadmap</h3>
        <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            { phase: 'Phase 1', title: 'Timetable Digitization' },
            { phase: 'Phase 2', title: 'Conflict Intelligence' },
            { phase: 'Phase 3', title: 'Maintenance Complaints Hub' },
            { phase: 'Phase 4', title: 'Predictive Slot Allocation' },
          ].map((item, idx) => (
            <div key={item.phase} className={idx % 2 === 0 ? 'stat-pill' : 'stat-pill-purple'}>
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">{item.phase}</p>
              <p className="mt-1 font-bold text-slate-800">{item.title}</p>
            </div>
          ))}
        </div>
      </section>
    </section>
  )
}

export default Home

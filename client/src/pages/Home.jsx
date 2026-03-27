import { Link } from 'react-router-dom'

function Home() {
  return (
    <section className="space-y-6">
      <article className="cta-bg relative overflow-hidden rounded-3xl border border-white/70 px-6 py-14 shadow-panel sm:px-10 lg:px-12">
        <div className="pointer-events-none absolute -left-20 top-1/2 h-52 w-52 -translate-y-1/2 rounded-full bg-campus-500/15 blur-3xl" />
        <div className="pointer-events-none absolute -right-16 top-10 h-48 w-48 rounded-full bg-campus-800/20 blur-3xl" />

        <div className="relative grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:items-end">
          <div className="max-w-3xl">
            <p className="mb-4 inline-flex rounded-full border border-campus-100 bg-white/80 px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] text-campus-700">
              Campus Scheduling Insights
            </p>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl md:text-6xl">
              Graph-Based Academic Visualization
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-slate-700 sm:text-lg">
              CampusFlow transforms timetable complexity into a decision dashboard for academic operations,
              combining slot planning, conflict maps, and smart alternatives in one place.
            </p>

            <div className="mt-10 flex flex-wrap gap-3">
              <Link
                to="/timetable"
                className="rounded-2xl bg-gradient-to-r from-campus-500 to-campus-800 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:scale-105 hover:shadow-xl"
              >
                Open Timetable Studio
              </Link>
              <Link
                to="/conflicts"
                className="rounded-2xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-800 shadow-sm hover:scale-105 hover:border-campus-500 hover:text-campus-700"
              >
                Explore Conflict Graph
              </Link>
              <Link
                to="/graph-lab"
                className="rounded-2xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-800 shadow-sm hover:scale-105 hover:border-campus-500 hover:text-campus-700"
              >
                Open Graph Lab
              </Link>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            <div className="rounded-2xl border border-white/80 bg-white/90 p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Visibility</p>
              <p className="mt-1 text-2xl font-black text-campus-800">Live Timetable</p>
            </div>
            <div className="rounded-2xl border border-white/80 bg-white/90 p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Decision Support</p>
              <p className="mt-1 text-2xl font-black text-campus-800">Instant Suggestions</p>
            </div>
            <div className="rounded-2xl border border-white/80 bg-white/90 p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Risk Detection</p>
              <p className="mt-1 text-2xl font-black text-red-600">Conflict Mapping</p>
            </div>
          </div>
        </div>
      </article>

      <div className="grid gap-4 md:grid-cols-3">
        <article className="rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-panel">
          <h3 className="text-sm font-black uppercase tracking-[0.14em] text-slate-500">Timetable View</h3>
          <p className="mt-3 text-2xl font-extrabold text-slate-900">Session-Centric Cards</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Each entry highlights subject, class, type, section or batch, room, and exact duration.
          </p>
        </article>
        <article className="rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-panel">
          <h3 className="text-sm font-black uppercase tracking-[0.14em] text-slate-500">Planner</h3>
          <p className="mt-3 text-2xl font-extrabold text-slate-900">Extra + Reschedule Flow</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Faculty can request slots with complete metadata and book immediately when capacity is free.
          </p>
        </article>
        <article className="rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-panel">
          <h3 className="text-sm font-black uppercase tracking-[0.14em] text-slate-500">Conflict Graph</h3>
          <p className="mt-3 text-2xl font-extrabold text-slate-900">Network-Level Insights</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Visual edges expose faculty, room, section, and batch overlaps across concurrent sessions.
          </p>
        </article>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-3xl border border-slate-200/80 bg-white/90 p-7 shadow-panel">
          <h3 className="text-sm font-black uppercase tracking-[0.14em] text-slate-500">Campus Operations</h3>
          <p className="mt-3 text-2xl font-extrabold text-slate-900">Complaint Escalation Studio</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Report issues like AC, projector, lab equipment, electrical faults, or internet outages. CampusFlow
            recommends the correct department automatically and tracks action status.
          </p>
          <Link
            to="/complaints"
            className="mt-5 inline-flex rounded-2xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Go to Complaints Center
          </Link>
        </article>
        <article className="rounded-3xl border border-slate-200/80 bg-white/90 p-7 shadow-panel">
          <h3 className="text-sm font-black uppercase tracking-[0.14em] text-slate-500">Explainable Algorithms</h3>
          <p className="mt-3 text-2xl font-extrabold text-slate-900">Graph Build + Cycle Detection Demo</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            See how nodes and edges are constructed, then run cycle detection step-by-step.
          </p>
          <Link
            to="/graph-lab"
            className="mt-5 inline-flex rounded-2xl bg-campus-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-campus-800"
          >
            Launch Graph Playground
          </Link>
        </article>
      </div>

      <section className="rounded-3xl border border-slate-200/80 bg-white/90 p-8 shadow-panel">
        <h3 className="text-sm font-black uppercase tracking-[0.14em] text-slate-500">Roadmap</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Phase 1</p>
            <p className="mt-1 font-bold text-slate-900">Timetable Digitization</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Phase 2</p>
            <p className="mt-1 font-bold text-slate-900">Conflict Intelligence</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Phase 3</p>
            <p className="mt-1 font-bold text-slate-900">Maintenance Complaints Hub</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Phase 4</p>
            <p className="mt-1 font-bold text-slate-900">Predictive Slot Allocation</p>
          </div>
        </div>
      </section>
    </section>
  )
}

export default Home

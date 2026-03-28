import { useEffect, useMemo, useState } from 'react'
import ConflictGraph from '../components/ConflictGraph'
import { getConflicts, getTimetable } from '../services/api'

function normalizeConflictsPayload(p){if(!p)return{};if(Array.isArray(p))return p.reduce((a,i)=>{const s=i.session||i.source||i.id;const t=i.conflicts||i.targets||i.related||[];if(s)a[s]=Array.isArray(t)?t:[];return a},{});if(typeof p==='object')return p;return{}}

function Conflicts() {
  const [sessions, setSessions] = useState([])
  const [conflicts, setConflicts] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => { (async () => { try { 
    setLoading(true); setError(''); 
    const [c, t] = await Promise.all([getConflicts(), getTimetable()]);
    setConflicts(normalizeConflictsPayload(c));
    setSessions(Array.isArray(t) ? t : (t?.sessions || Object.values(t || {})));
  } catch (e) { setError(e.message || 'Unable to load conflict data') } finally { setLoading(false) } })() }, [])

  const items = useMemo(() => Object.entries(conflicts).map(([s, t]) => ({ source: s, targets: Array.isArray(t) ? t : [] })), [conflicts])
  const summary = useMemo(() => {
    const n = Object.keys(conflicts).length, e = items.reduce((s, i) => s + i.targets.length, 0)
    const h = items.reduce((m, i) => i.targets.length > m.targets ? { id: i.source, targets: i.targets.length } : m, { id: '-', targets: 0 })
    return { totalNodes: n, totalEdges: e, highest: h }
  }, [conflicts, items])

  return (
    <section className="space-y-6">
      <div className="glass-card-strong relative overflow-hidden p-6">
        <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-red-400 via-amethyst-500 to-red-400" />
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
          <span className="bg-gradient-to-r from-red-500 to-amethyst-500 bg-clip-text text-transparent">Conflicts</span>
        </h1>
        <p className="mt-2 text-slate-500">Visualize graph-based overlaps between sessions.</p>

        {!loading && !error && (
          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <div className="stat-pill-danger"><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-red-500">Conflict Nodes</p><p className="mt-2 text-2xl font-black text-slate-800">{summary.totalNodes}</p></div>
            <div className="stat-pill-danger"><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-red-500">Conflict Edges</p><p className="mt-2 text-2xl font-black text-slate-800">{summary.totalEdges}</p></div>
            <div className="stat-pill"><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-honolulu-500">Most Linked Session</p><p className="mt-2 text-2xl font-black text-slate-800">{summary.highest.id}</p></div>
          </div>
        )}
      </div>

      {loading && (
        <div className="glass-card p-8 text-center">
          <div className="inline-block h-8 w-8 rounded-full border-2 border-honolulu-200 border-t-honolulu-500 animate-spin mb-3" />
          <p className="text-base font-medium text-honolulu-600">Loading conflict graph...</p>
        </div>
      )}
      {!loading && error && <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-sm font-medium text-red-600">{error}</div>}
      {!loading && !error && !items.length && <div className="glass-card border-dashed p-8 text-center"><p className="text-slate-500">No conflicts detected right now.</p></div>}

      {!loading && !error && !!items.length && (
        <div className="space-y-6">
          <div className="glass-card p-4">
            <div className="mb-3 flex flex-wrap gap-2 text-xs font-semibold">
              <span className="rounded-lg bg-red-50 border border-red-200 px-3 py-1 text-red-600">Red Lines: Conflict Links</span>
              <span className="rounded-lg bg-honolulu-50 border border-honolulu-200 px-3 py-1 text-honolulu-600">Gradient Nodes: Sessions</span>
            </div>
            <ConflictGraph conflicts={conflicts} sessions={sessions} />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {items.map(item => (
              <article key={item.source} className="glass-card relative overflow-hidden p-5 group">
                <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-red-400 to-amethyst-400" />
                <h3 className="text-lg font-bold text-slate-800">Session {item.source}</h3>
                {item.targets.length ? <p className="mt-2 text-sm text-red-600">Conflicts with <span className="font-semibold">{item.targets.join(', ')}</span></p> : <p className="mt-2 text-sm text-slate-400">No direct conflict edges.</p>}
              </article>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}

export default Conflicts

import { useEffect, useMemo, useState } from 'react'
import ConflictGraph from '../components/ConflictGraph'
import { getConflicts } from '../services/api'

function normalizeConflictsPayload(payload) {
  if (!payload) {
    return {}
  }

  if (Array.isArray(payload)) {
    return payload.reduce((acc, item) => {
      const source = item.session || item.source || item.id
      const targets = item.conflicts || item.targets || item.related || []

      if (source) {
        acc[source] = Array.isArray(targets) ? targets : []
      }

      return acc
    }, {})
  }

  if (typeof payload === 'object') {
    return payload
  }

  return {}
}

function Conflicts() {
  const [conflicts, setConflicts] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadConflicts() {
      try {
        setLoading(true)
        setError('')
        const data = await getConflicts()
        setConflicts(normalizeConflictsPayload(data))
      } catch (err) {
        setError(err.message || 'Unable to load conflict data')
      } finally {
        setLoading(false)
      }
    }

    loadConflicts()
  }, [])

  const items = useMemo(
    () =>
      Object.entries(conflicts).map(([source, targets]) => ({
        source,
        targets: Array.isArray(targets) ? targets : [],
      })),
    [conflicts],
  )

  const summary = useMemo(() => {
    const totalNodes = Object.keys(conflicts).length
    const totalEdges = items.reduce((sum, item) => sum + item.targets.length, 0)
    const highest = items.reduce(
      (max, item) => (item.targets.length > max.targets ? { id: item.source, targets: item.targets.length } : max),
      { id: '-', targets: 0 },
    )

    return { totalNodes, totalEdges, highest }
  }, [conflicts, items])

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-panel">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">Conflicts</h1>
        <p className="mt-2 text-slate-600">Visualize graph-based overlaps between sessions.</p>

        {!loading && !error && (
          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <div className="rounded-2xl border border-red-100 bg-red-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-red-700">Conflict Nodes</p>
              <p className="mt-2 text-2xl font-black text-red-900">{summary.totalNodes}</p>
            </div>
            <div className="rounded-2xl border border-red-100 bg-red-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-red-700">Conflict Edges</p>
              <p className="mt-2 text-2xl font-black text-red-900">{summary.totalEdges}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Most Linked Session</p>
              <p className="mt-2 text-2xl font-black text-slate-900">{summary.highest.id}</p>
            </div>
          </div>
        )}
      </div>

      {loading && (
        <div className="rounded-2xl border border-campus-100 bg-white/90 p-8 text-center shadow-lg">
          <p className="text-base font-medium text-campus-700">Loading conflict graph...</p>
        </div>
      )}

      {!loading && error && (
        <div className="badge-conflict rounded-2xl p-6 text-center text-sm font-medium shadow-lg">{error}</div>
      )}

      {!loading && !error && !items.length && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white/75 p-8 text-center shadow-lg">
          <p className="text-slate-600">No conflicts detected right now.</p>
        </div>
      )}

      {!loading && !error && !!items.length && (
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200/80 bg-white/90 p-4 shadow-panel">
            <div className="mb-3 flex flex-wrap gap-2 text-xs font-semibold text-slate-600">
              <span className="rounded-full bg-red-50 px-3 py-1 text-red-700">Red Lines: Conflict Links</span>
              <span className="rounded-full bg-blue-50 px-3 py-1 text-blue-700">Blue Nodes: Sessions</span>
            </div>
            <ConflictGraph conflicts={conflicts} />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {items.map((item) => (
              <article
                key={item.source}
                className="rounded-2xl border border-red-200 bg-red-50/90 p-5 shadow-lg hover:scale-[1.01]"
              >
                <h3 className="text-lg font-bold text-red-900">Session {item.source}</h3>
                {item.targets.length ? (
                  <p className="mt-2 text-sm text-red-800">
                    Conflicts with{' '}
                    <span className="font-semibold">{item.targets.join(', ')}</span>
                  </p>
                ) : (
                  <p className="mt-2 text-sm text-red-700">No direct conflict edges.</p>
                )}
              </article>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}

export default Conflicts

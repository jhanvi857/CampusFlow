import { useEffect, useRef, useState, useMemo } from 'react'
import * as d3Force from 'd3-force'
import * as d3Zoom from 'd3-zoom'
import * as d3Selection from 'd3-selection'
import * as d3Drag from 'd3-drag'
import { getTimetable, analyzeCycle } from '../services/api'

const BOOKED_SESSION_STORAGE_KEY = 'campusflow-booked-sessions'

const sleep = ms => new Promise(res => setTimeout(res, ms))

function truncateLabel(v, max = 22) {
  return !v ? '' : v.length > max ? `${v.slice(0, max - 1)}...` : v
}

function GraphPlayground() {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [form, setForm] = useState({ subjectName: 'New Elective', faculty: 'Dr. Graph', className: 'CSE', section: 'A', batch: '', venue: 'Lab 101', day: 'Mon', startTime: '11:00', endTime: '12:00' })

  const [nodePositions, setNodePositions] = useState({})
  const [activeScanId, setActiveScanId] = useState('')
  const [phase, setPhase] = useState('idle') // idle, build, scan, link, cycle, done
  const [visibleBaseEdges, setVisibleBaseEdges] = useState(0)
  const [visibleCandidateEdges, setVisibleCandidateEdges] = useState(0)
  const [traceLogs, setTraceLogs] = useState([])
  const [cycleResult, setCycleResult] = useState(null)

  const svgRef = useRef(null)
  const gRef = useRef(null)
  const bufferMinutes = 0

  useEffect(() => {
    async function init() {
      try {
        const data = await getTimetable()
        const local = JSON.parse(localStorage.getItem(BOOKED_SESSION_STORAGE_KEY) || '[]')
        setSessions([...data, ...local])
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [])

  function updateField(e) { setForm(p => ({ ...p, [e.target.name]: e.target.value })) }

  const nodes = useMemo(() => {
    const list = sessions.map(s => ({ id: String(s.id), session: s }))
    list.push({ id: 'REQ', session: { ...form, id: 'REQ', startTime: form.startTime, endTime: form.endTime, day: form.day, room: form.venue } })
    return list
  }, [sessions, form])

  const analyzeConflict = (s1, s2, buffer = 0) => {
    const reasons = []
    if (s1.id === s2.id) return { conflict: false, reasons }
    if (s1.day !== s2.day) return { conflict: false, reasons }

    const t = (v) => { const [h, m] = v.split(':').map(Number); return h * 60 + m }
    const s1Start = t(s1.startTime), s1End = t(s1.endTime)
    const s2Start = t(s2.startTime), s2End = t(s2.endTime)

    const overlaps = s1Start < (s2End + buffer) && s2Start < (s1End + buffer)
    if (!overlaps) return { conflict: false, reasons }

    if (s1.faculty && s1.faculty === s2.faculty) reasons.push('Faculty')
    if (s1.room && s1.room === s2.room) reasons.push('Room')
    if (s1.className && s1.className === s2.className) {
      if (s1.section && s1.section === s2.section) reasons.push('Section')
      else if (s1.batch && s1.batch === s2.batch) reasons.push('Batch')
    }
    return { conflict: reasons.length > 0, reasons }
  }

  const baseEdges = useMemo(() => {
    const edges = []
    for (let i = 0; i < sessions.length; i++) {
      for (let j = i + 1; j < sessions.length; j++) {
        const res = analyzeConflict(sessions[i], sessions[j])
        if (res.conflict) edges.push({ left: String(sessions[i].id), right: String(sessions[j].id), reasons: res.reasons, type: 'structural' })
      }
    }
    return edges
  }, [sessions])

  const candidateSession = { ...form, id: 'REQ', startTime: form.startTime, endTime: form.endTime, day: form.day, room: form.venue }
  const candidateConflicts = useMemo(() => {
    return sessions.map(s => {
      const res = analyzeConflict(candidateSession, s, bufferMinutes)
      return res.conflict ? { session: s, reasons: res.reasons } : null
    }).filter(Boolean)
  }, [sessions, form])

  const candidateEdges = useMemo(() => {
    return candidateConflicts.map(c => ({ left: 'REQ', right: String(c.session.id), reasons: c.reasons, type: 'conflict' }))
  }, [candidateConflicts])

  const edges = useMemo(() => [...baseEdges, ...candidateEdges], [baseEdges, candidateEdges])
  const cycleEdgeSet = useMemo(() => {
    const set = new Set()
    if (cycleResult?.path) {
      for (let i = 0; i < cycleResult.path.length - 1; i++) {
        set.add([cycleResult.path[i], cycleResult.path[i + 1]].sort().join('|'))
      }
    }
    return set
  }, [cycleResult])

  const width = 1600
  const height = 1200

  const groupCenters = useMemo(() => {
    const groups = [...new Set(nodes.map(n => (n.session.className || 'Other') + (n.session.section || '')))];
    const centers = {};
    groups.forEach((g, i) => {
      const angle = (i / groups.length) * 2 * Math.PI;
      centers[g] = { x: width / 2 + Math.cos(angle) * 500, y: height / 2 + Math.sin(angle) * 400, label: g.toUpperCase() };
    });
    return centers;
  }, [nodes])

  useEffect(() => {
    if (!nodes.length) return
    const d3Nodes = nodes.map(n => ({ ...n, group: (n.session.className || 'Other') + (n.session.section || '') }))
    const d3Edges = edges.map(e => ({ source: e.left, target: e.right }))

    const simulation = d3Force.forceSimulation(d3Nodes)
      .force("link", d3Force.forceLink(d3Edges).id(d => d.id).distance(250).strength(0.1))
      .force("charge", d3Force.forceManyBody().strength(-7000))
      .force("center", d3Force.forceCenter(width / 2, height / 2))
      .force("x", d3Force.forceX().x(d => groupCenters[d.group]?.x || width / 2).strength(0.4))
      .force("y", d3Force.forceY().y(d => groupCenters[d.group]?.y || height / 2).strength(0.4))
      .force("collision", d3Force.forceCollide().radius(220))
      .alphaDecay(0.06)
      .velocityDecay(0.4)
      .on("tick", () => {
        const p = {}; d3Nodes.forEach(n => { p[n.id] = { x: n.x, y: n.y } }); setNodePositions({ ...p })
      })

    const svg = d3Selection.select(svgRef.current)
    const g = d3Selection.select(gRef.current)
    const zoom = d3Zoom.zoom().scaleExtent([0.1, 3]).on("zoom", (e) => g.attr("transform", e.transform))
    svg.call(zoom).call(zoom.transform, d3Zoom.zoomIdentity.translate(0, 0).scale(0.6))

    return () => simulation.stop()
  }, [nodes.length, edges.length, groupCenters])

  async function runSimulation() {
    if (loading || !!error) return
    setPhase('build'); setTraceLogs(['Initializing session topology...']); setCycleResult(null); setActiveScanId('')
    setVisibleBaseEdges(0); for (let i = 1; i <= baseEdges.length; i++) { setVisibleBaseEdges(i); await sleep(80) }

    setPhase('scan'); setTraceLogs(p => [...p, 'Scanning resource overlaps for REQ...'])
    for (const s of sessions) {
      const r = analyzeConflict(candidateSession, s, bufferMinutes);
      setActiveScanId(String(s.id)); await sleep(350);
      if (r.reasons.length) setTraceLogs(p => [...p, `Clash at ${s.id}: ${r.reasons.join('|')}`])
    }
    setActiveScanId('');

    setPhase('link'); setTraceLogs(p => [...p, 'Mapping conflict edges...'])
    setVisibleCandidateEdges(0); for (let i = 1; i <= candidateEdges.length; i++) { setVisibleCandidateEdges(i); await sleep(250) }

    setPhase('cycle'); setTraceLogs(p => [...p, 'Triggering backend DMGT Parser...'])
    try {
      const res = await analyzeCycle()
      setCycleResult(res); setTraceLogs(p => [...p, ...res.logs])
    } catch (err) { setTraceLogs(p => [...p, `Error: ${err.message}`]) }
    setPhase('done')
  }

  const stepStates = [
    { id: 'build', title: 'Preparation', active: phase === 'build', done: ['scan', 'link', 'cycle', 'done'].includes(phase) },
    { id: 'scan', title: 'Scanning', active: phase === 'scan', done: ['link', 'cycle', 'done'].includes(phase) },
    { id: 'link', title: 'Mapping', active: phase === 'link', done: ['cycle', 'done'].includes(phase) },
    { id: 'cycle', title: 'Analysis', active: phase === 'cycle', done: phase === 'done' },
  ]

  return (
    <section className="space-y-6">
      <div className="glass-card-strong p-7 text-center">
        <h1 className="text-4xl font-black tracking-tight bg-gradient-to-r from-honolulu-600 to-amethyst-600 bg-clip-text text-transparent">Topological Lab</h1>
        <p className="mt-2 text-slate-500 font-medium">Verify scheduling logical stability through Graph Theory DFS.</p>

        <div className="mt-8 flex flex-wrap justify-center gap-4">
          {stepStates.map((s, i) => (
            <div key={s.id} className={`flex items-center gap-3 px-6 py-3 rounded-2xl border-2 transition-all ${s.active ? 'bg-honolulu-600 text-white border-honolulu-700 scale-110 shadow-2xl' : s.done ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-white text-slate-400 border-slate-100'}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center font-black text-xs ${s.active ? 'bg-white text-honolulu-600' : 'bg-slate-200'}`}>{i + 1}</span>
              <span className="font-black uppercase tracking-widest text-xs">{s.title}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        <aside className="lg:col-span-1 space-y-6">
          <div className="glass-card p-6">
            <h2 className="text-lg font-black text-slate-800 uppercase mb-4">Slot Settings</h2>
            <div className="space-y-3">
              <input name="subjectName" value={form.subjectName} onChange={updateField} placeholder="Subject" className="input-glass text-sm" />
              <input name="faculty" value={form.faculty} onChange={updateField} placeholder="Faculty" className="input-glass text-sm" />
              <div className="grid grid-cols-2 gap-2">
                <input name="venue" value={form.venue} onChange={updateField} placeholder="Room" className="input-glass text-sm" />
                <select name="day" value={form.day} onChange={updateField} className="input-glass text-sm"><option value="Mon">Mon</option><option value="Tue">Tue</option><option value="Wed">Wed</option><option value="Thu">Thu</option><option value="Fri">Fri</option></select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input type="time" name="startTime" value={form.startTime} onChange={updateField} className="input-glass text-sm" />
                <input type="time" name="endTime" value={form.endTime} onChange={updateField} className="input-glass text-sm" />
              </div>
              <button onClick={runSimulation} disabled={phase !== 'idle' && phase !== 'done'} className="btn-brand w-full py-4 uppercase font-black tracking-widest mt-2">{phase === 'idle' || phase === 'done' ? 'Initiate Analysis' : 'Processing...'}</button>
            </div>
          </div>

          <div className="glass-card p-6 bg-slate-900 text-white border-0 shadow-2xl">
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Discovery Trace</h2>
            <div className="space-y-2 max-h-[350px] overflow-auto pr-2 scrollbar-hide text-[10px] font-mono leading-relaxed">
              {!traceLogs.length && <p className="text-slate-600 italic">Waiting for pipeline start...</p>}
              {traceLogs.map((log, i) => <p key={i} className="border-b border-slate-800 pb-1.5 text-gray-700"><span className="text-gray-900 mr-2">{String(i + 1).padStart(2, '0')}</span>{log}</p>)}
            </div>
            {cycleResult && (
              <div className={`mt-6 p-4 rounded-xl border-l-4 ${cycleResult.hasCycle ? 'bg-red-950/50 border-red-500' : 'bg-emerald-950/50 border-emerald-500'}`}>
                <p className="text-[10px] uppercase font-black tracking-tighter mb-1">{cycleResult.hasCycle ? 'Structural Impasse' : 'Topology Clear'}</p>
                {cycleResult.hasCycle && <p className="text-xs font-bold text-red-200">{(cycleResult.path || []).join(' -> ')}</p>}
                {!cycleResult.hasCycle && <p className="text-xs font-bold text-emerald-200 italic">Conflict graph verified stable.</p>}
              </div>
            )}
          </div>
        </aside>

        <section className="lg:col-span-3 glass-card relative overflow-hidden bg-slate-50/50 min-h-[900px]">
          <div className="absolute top-6 left-6 z-10 flex gap-4">
            <div className="px-4 py-2 bg-white/90 border border-slate-100 rounded-2xl shadow-xl">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Physics State</p>
              <p className="text-xs font-bold text-slate-800 uppercase">{phase === 'idle' ? 'Sleeping' : 'Neural Active'}</p>
            </div>
          </div>

          <svg ref={svgRef} viewBox={`0 0 ${width} ${height}`} className="w-full h-[900px] cursor-move">
            <defs>
              <linearGradient id="lecNodeGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#3B82F6" /><stop offset="100%" stopColor="#1D4ED8" /></linearGradient>
              <linearGradient id="labNodeGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#F59E0B" /><stop offset="100%" stopColor="#B45309" /></linearGradient>
              <linearGradient id="tutNodeGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#A855F7" /><stop offset="100%" stopColor="#7E22CE" /></linearGradient>
              <linearGradient id="reqNodeGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#10B981" /><stop offset="100%" stopColor="#059669" /></linearGradient>
              <filter id="nodeGlow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="15" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
            </defs>
            <g ref={gRef}>
              {Object.entries(groupCenters || {}).map(([key, center]) => (
                <g key={key}>
                  <circle cx={center.x} cy={center.y} r="400" fill="none" stroke="#E2E8F0" strokeWidth="2" strokeDasharray="15 15" opacity="0.2" />
                  <text x={center.x} y={center.y - 420} textAnchor="middle" fill="#CBD5E1" className="text-3xl font-black tracking-[0.4em] uppercase">{center.label}</text>
                </g>
              ))}
              {baseEdges.slice(0, visibleBaseEdges).map((e, i) => {
                const s = nodePositions[e.left], t = nodePositions[e.right]
                if (!s || !t) return null
                return <line key={i} x1={s.x} y1={s.y} x2={t.x} y2={t.y} stroke="#CBD5E1" strokeWidth="2" strokeDasharray="10 5" opacity="0.1" />
              })}
              {candidateEdges.slice(0, visibleCandidateEdges).map((e, i) => {
                const s = nodePositions[e.left], t = nodePositions[e.right]
                if (!s || !t) return null
                const inC = cycleEdgeSet.has([e.left, e.right].sort().join('|'))
                return <line key={i} x1={s.x} y1={s.y} x2={t.x} y2={t.y} stroke={inC ? '#EF4444' : '#F43F5E'} strokeWidth={inC ? 16 : 8} className={inC ? "animate-pulse" : ""} strokeLinecap="round" />
              })}
              {nodes.map(n => {
                const p = nodePositions[n.id], isR = n.id === 'REQ', inC = cycleResult?.path?.includes(n.id), isA = activeScanId === n.id
                if (!p) return null
                const sT = n.session?.sessionType?.toLowerCase() || 'lecture'
                const grad = inC ? '#EF4444' : isR ? 'url(#reqNodeGrad)' : sT === 'lab' ? 'url(#labNodeGrad)' : sT === 'tutorial' ? 'url(#tutNodeGrad)' : 'url(#lecNodeGrad)'
                const rS = isR ? 110 : inC ? 95 : 85
                return (
                  <g key={n.id} filter={isA || inC ? "url(#nodeGlow)" : ""}>
                    <circle cx={p.x} cy={p.y} r={rS} fill={grad} stroke={isA ? '#F59E0B' : inC ? '#000' : '#fff'} strokeWidth={isA ? 20 : 6} className={isA ? "animate-pulse" : ""} />
                    <text x={p.x} y={p.y + 10} textAnchor="middle" fill="#fff" className="text-2xl font-black">{isR ? 'REQ' : sT.slice(0, 3).toUpperCase()}</text>
                    <text x={p.x} y={p.y + rS + 40} textAnchor="middle" fill={inC ? '#EF4444' : '#1E293B'} className={`text-xl font-black uppercase tracking-tighter ${inC ? 'animate-bounce' : ''}`}>{isR ? 'REQUEST' : truncateLabel(n.session.subjectName || 'Session', 15).toUpperCase()}</text>
                    <text x={p.x} y={p.y + rS + 65} textAnchor="middle" fill="#94A3B8" className="text-sm font-bold uppercase tracking-widest">{n.session.room}</text>
                  </g>
                )
              })}
            </g>
          </svg>
        </section>
      </div>
    </section>
  )
}

export default GraphPlayground

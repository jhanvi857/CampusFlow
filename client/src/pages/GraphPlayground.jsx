import { useEffect, useMemo, useState, useRef } from 'react'
import * as d3Force from 'd3-force'
import * as d3Zoom from 'd3-zoom'
import * as d3Selection from 'd3-selection'
import * as d3Drag from 'd3-drag'
import { getTimetable } from '../services/api'

const BOOKED_SESSION_STORAGE_KEY = 'campusflow-booked-sessions'

function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }
function normalizeTimetablePayload(p) { if (Array.isArray(p)) return p; if (p && Array.isArray(p.sessions)) return p.sessions; if (p && typeof p === 'object') return Object.values(p); return [] }
function toMinutes(t) { if (!t || !t.includes(':')) return null; const [h, m] = t.split(':'); const hh = Number(h), mm = Number(m); return Number.isNaN(hh) || Number.isNaN(mm) ? null : hh * 60 + mm }
function getSessionWindow(s) { const d = s.day, st = toMinutes(s.startTime), en = toMinutes(s.endTime); if (!d || st === null || en === null) return null; return { day: d, start: st, end: en } }
function intervalsConflict(a, b, buf = 0) { return a.start < b.end + buf && b.start < a.end + buf }
function isSameText(a, b) { return !a || !b ? false : String(a).trim().toLowerCase() === String(b).trim().toLowerCase() }

function analyzeConflict(l, r, buf = 10) {
  const lw = getSessionWindow(l), rw = getSessionWindow(r)
  if (!lw || !rw) return { overlap: false, sameFaculty: false, sameRoom: false, sameClass: false, sameSection: false, sameBatch: false, reasons: [] }
  const ov = lw.day === rw.day && intervalsConflict(lw, rw, buf)
  const sf = ov && isSameText(l.faculty, r.faculty), sr = ov && isSameText(l.room, r.room)
  const sc = ov && isSameText(l.className, r.className)
  const ss = sc && !!l.section && !!r.section && isSameText(l.section, r.section)
  const sb = sc && !!l.batch && !!r.batch && isSameText(l.batch, r.batch)
  if (!ov) return { overlap: ov, sameFaculty: sf, sameRoom: sr, sameClass: sc, sameSection: ss, sameBatch: sb, reasons: [] }
  const reasons = []
  if (sf) reasons.push('Faculty Conflict'); if (sr) reasons.push('Room Conflict')
  if (sc && (ss || sb)) reasons.push('Class Conflict'); if (ss) reasons.push('Section Conflict'); if (sb) reasons.push('Batch Conflict')
  return { overlap: ov, sameFaculty: sf, sameRoom: sr, sameClass: sc, sameSection: ss, sameBatch: sb, reasons }
}

function findConflicts(c, all, buf = 10) { return all.map(s => { const d = analyzeConflict(c, s, buf); return { session: s, diagnostics: d, reasons: d.reasons } }).filter(e => e.reasons.length > 0) }

function buildBaseEdges(all, buf = 10) {
  const edges = []
  for (let i = 0; i < all.length; i++) for (let j = i + 1; j < all.length; j++) {
    const d = analyzeConflict(all[i], all[j], buf)
    if (d.reasons.length) edges.push({ left: String(all[i].id), right: String(all[j].id), reasons: d.reasons, kind: 'base' })
  }
  return edges
}

function buildAdjacency(nodes, edges) { const m = nodes.reduce((a, n) => { a[n.id] = []; return a }, {}); edges.forEach(e => { if (m[e.left]) m[e.left].push(e.right); if (m[e.right]) m[e.right].push(e.left) }); return m }

function detectCycle(nodes, edges) {
  const adj = buildAdjacency(nodes, edges), visited = new Set(), stack = new Set(), parent = {}, logs = []
  let cyclePath = []
  function dfs(id, pid = null) {
    visited.add(id); stack.add(id); logs.push(`Visit ${id}`)
    for (const nx of adj[id] || []) {
      logs.push(`Explore ${id} -> ${nx}`); if (nx === pid) continue
      if (!visited.has(nx)) { parent[nx] = id; if (dfs(nx, id)) return true }
      else if (stack.has(nx)) { logs.push(`Back-edge ${id} -> ${nx}: cycle detected`); const path = [nx]; let cur = id; while (cur && cur !== nx) { path.push(cur); cur = parent[cur] }; path.push(nx); cyclePath = path.reverse(); return true }
    }
    stack.delete(id); logs.push(`Leave ${id}`); return false
  }
  for (const n of nodes) if (!visited.has(n.id) && dfs(n.id, null)) return { hasCycle: true, cyclePath, logs }
  return { hasCycle: false, cyclePath: [], logs }
}

function toCandidateSession(f) { return { id: 'REQ', subjectName: f.subjectName, subjectCode: f.subjectName, faculty: f.faculty, className: f.className, sessionType: f.sessionType, section: f.section, batch: f.batch, room: f.room, day: f.day, startTime: f.startTime, endTime: f.endTime } }
function truncateLabel(v, max = 26) { return !v ? '' : v.length > max ? `${v.slice(0, max - 1)}...` : v }
function edgeColorForReasons(r) { if (r.includes('Faculty Conflict')) return '#EF4444'; if (r.includes('Room Conflict')) return '#0077B6'; if (r.includes('Batch Conflict') || r.includes('Section Conflict')) return '#F59E0B'; return '#8B5CF6' }

function GraphPlayground() {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ subjectName: 'CS999 Demo', faculty: 'Dr. Smith', className: 'CSE', sessionType: 'lecture', section: 'A', batch: '', room: 'Room 101', day: 'Mon', startTime: '09:30', endTime: '10:30' })
  const [phase, setPhase] = useState('idle')
  const [activeScanId, setActiveScanId] = useState('')
  const [visibleBaseEdges, setVisibleBaseEdges] = useState(0)
  const [visibleCandidateEdges, setVisibleCandidateEdges] = useState(0)
  const [traceLogs, setTraceLogs] = useState([])
  const [cycleResult, setCycleResult] = useState(null)
  const [bufferMinutes, setBufferMinutes] = useState(10)

  useEffect(() => { (async () => { try { setLoading(true); setError(''); const td = await getTimetable(); const bs = normalizeTimetablePayload(td); const bk = JSON.parse(localStorage.getItem(BOOKED_SESSION_STORAGE_KEY) || '[]'); setSessions([...bs, ...(Array.isArray(bk) ? bk : [])]) } catch (e) { setError(e.message || 'Unable to load graph data') } finally { setLoading(false) } })() }, [])

  function updateField(e) { const { name, value } = e.target; setForm(p => { const n = { ...p, [name]: value }; if (name === 'sessionType') { if (value === 'lab') { n.section = ''; n.batch = 'A1' } else { n.batch = ''; if (!n.section) n.section = 'A' } } return n }) }

  const candidateSession = useMemo(() => toCandidateSession(form), [form])
  const baseNodes = useMemo(() => sessions.map(s => ({ id: String(s.id), session: s })), [sessions])
  const sessionById = useMemo(() => sessions.reduce((a, s) => { a[String(s.id)] = s; return a }, {}), [sessions])
  const baseEdges = useMemo(() => buildBaseEdges(sessions, bufferMinutes).map(e => ({ ...e, type: 'conflict' })), [bufferMinutes, sessions])
  const candidateConflicts = useMemo(() => findConflicts(candidateSession, sessions, bufferMinutes), [bufferMinutes, candidateSession, sessions])
  const candidateEdges = useMemo(() => candidateConflicts.map(e => ({ left: 'REQ', right: String(e.session.id), reasons: e.reasons, kind: 'candidate', type: 'conflict' })), [candidateConflicts])
  
  const structuralEdges = useMemo(() => {
    const e = []; const all = [...sessions, candidateSession];
    for (let i = 0; i < all.length; i++) {
      for (let j = i + 1; j < all.length; j++) {
        if (all[i].subjectCode && all[i].subjectCode === all[j].subjectCode && all[i].className === all[j].className) {
          e.push({ left: String(all[i].id || 'REQ'), right: String(all[j].id || 'REQ'), kind: 'structural', type: 'structural' })
        }
      }
    }
    return e
  }, [sessions, candidateSession])

  const nodes = useMemo(() => [...baseNodes, { id: 'REQ', session: candidateSession }], [baseNodes, candidateSession])
  const edges = useMemo(() => {
     const visBase = baseEdges.slice(0, visibleBaseEdges)
     const visCand = candidateEdges.slice(0, visibleCandidateEdges)
     return [...visBase, ...visCand, ...structuralEdges]
  }, [baseEdges, visibleBaseEdges, candidateEdges, visibleCandidateEdges, structuralEdges])

  const cycleEdgeSet = useMemo(() => { if (!cycleResult?.cyclePath?.length) return new Set(); const s = new Set(); for (let i = 0; i < cycleResult.cyclePath.length - 1; i++) s.add([cycleResult.cyclePath[i], cycleResult.cyclePath[i + 1]].sort().join('|')); return s }, [cycleResult])

  const noCycleInsight = useMemo(() => {
    if (!cycleResult || cycleResult.hasCycle) return ''
    const ids = candidateConflicts.map(e => String(e.session.id))
    if (ids.length < 2) return 'Only one conflict neighbor connected to REQ, so no closed loop can exist.'
    const bkeys = new Set(baseEdges.map(e => [e.left, e.right].sort().join('|')))
    const missing = []; let hasLink = false
    for (let i = 0; i < ids.length; i++) for (let j = i + 1; j < ids.length; j++) {
      const k = [ids[i], ids[j]].sort().join('|')
      if (bkeys.has(k)) hasLink = true
      else { const ls = sessionById[ids[i]], rs = sessionById[ids[j]]; const pd = ls && rs ? analyzeConflict(ls, rs, bufferMinutes) : null; missing.push(pd ? `${ids[i]}--${ids[j]} (overlap=${pd.overlap}, faculty=${pd.sameFaculty}, room=${pd.sameRoom})` : `${ids[i]}--${ids[j]}`) }
    }
    if (!hasLink) return `No cycle: conflict nodes only connect through REQ (star shape). Missing: ${missing.join(' | ')}.`
    return `No cycle in current traversal. Potential missing links: ${missing.join(' | ')}.`
  }, [baseEdges, bufferMinutes, candidateConflicts, cycleResult, sessionById])

  const [nodePositions, setNodePositions] = useState({})
  const [isStable, setIsStable] = useState(false)
  const svgRef = useRef(null)
  const gRef = useRef(null)

  useEffect(() => {
    if (!nodes.length) return

    const width = 1000
    const height = 800
    
    // Initialize nodes for D3
    const d3Nodes = nodes.map(n => ({ ...n }))
    const d3Edges = edges.map(e => ({ source: e.left, target: e.right, kind: e.kind, reasons: e.reasons }))

    const simulation = d3Force.forceSimulation(d3Nodes)
      .force("link", d3Force.forceLink(d3Edges).id(d => d.id).distance(d => d.type === 'conflict' ? 380 : 250))
      .force("charge", d3Force.forceManyBody().strength(-3500))
      .force("center", d3Force.forceCenter(width / 2, height / 2))
      .force("collision", d3Force.forceCollide().radius(180))
      .alphaDecay(0.015)
      .velocityDecay(0.4)
      .on("tick", () => {
        const newPos = {}
        d3Nodes.forEach(n => {
          newPos[n.id] = { x: n.x, y: n.y }
        })
        setNodePositions({ ...newPos })
      })
      .on("end", () => setIsStable(true))

    // Zoom setup
    const svg = d3Selection.select(svgRef.current)
    const g = d3Selection.select(gRef.current)
    const zoom = d3Zoom.zoom()
      .scaleExtent([0.1, 4])
      .on("zoom", (event) => {
        g.attr("transform", event.transform)
      })

    svg.call(zoom)
    
    // Drag setup
    const drag = d3Drag.drag()
      .on("start", (event, d) => {
        if (!event.active) simulation.alphaTarget(0.2).restart()
        d.fx = d.x; d.fy = d.y
        setIsStable(false)
      })
      .on("drag", (event, d) => {
        d.fx = event.x; d.fy = event.y
      })
      .on("end", (event, d) => {
        if (!event.active) simulation.alphaTarget(0)
        d.fx = null; d.fy = null
      })

    d3Selection.selectAll(".node-group").data(d3Nodes).call(drag)

    return () => simulation.stop()
  }, [nodes.length, edges.length])

  async function runSimulation() {
    if (loading || !!error) return
    setPhase('build'); setTraceLogs(['Loading existing conflict edges...']); setCycleResult(null); setActiveScanId('')
    setVisibleBaseEdges(0); for (let i = 1; i <= baseEdges.length; i++) { setVisibleBaseEdges(i); await sleep(90) }
    setPhase('scan'); setTraceLogs(p => [...p, 'Scanning existing sessions against request node REQ...'])
    for (const s of sessions) { const r = analyzeConflict(candidateSession, s, bufferMinutes); setActiveScanId(String(s.id)); await sleep(260); setTraceLogs(p => [...p, r.reasons.length ? `Conflict with ${s.id} -> ${r.reasons.join(', ')}` : `No conflict with ${s.id}`]) }
    if (!candidateConflicts.length) setTraceLogs(p => [...p, 'No conflicts found.'])
    setActiveScanId(''); setPhase('link'); setTraceLogs(p => [...p, 'Creating request conflict edges...'])
    setVisibleCandidateEdges(0); for (let i = 1; i <= candidateEdges.length; i++) { setVisibleCandidateEdges(i); await sleep(140) }
    setPhase('cycle'); setTraceLogs(p => [...p, 'Running DFS cycle detection...'])
    const result = detectCycle(nodes, [...baseEdges, ...candidateEdges])
    setCycleResult(result); setTraceLogs(p => [...p, ...result.logs]); setPhase('done')
  }

  function resetVisual() { setVisibleBaseEdges(baseEdges.length); setVisibleCandidateEdges(candidateEdges.length); setActiveScanId(''); setTraceLogs([]); setCycleResult(null); setPhase('idle') }

  const stats = useMemo(() => ({ sessions: sessions.length, baseEdges: baseEdges.length, candidateEdges: candidateEdges.length, candidateConflicts: candidateConflicts.length }), [baseEdges.length, candidateConflicts.length, candidateEdges.length, sessions.length])

  const stepStates = [
    { id: 'build', title: 'Build Session Nodes', detail: 'Every lecture/lab/tutorial is modeled as one node.', active: phase === 'build', done: ['scan', 'link', 'cycle', 'done'].includes(phase) },
    { id: 'scan', title: 'Scan Request Against Sessions', detail: 'Compare day + time overlap and check faculty/room/section/batch.', active: phase === 'scan', done: ['link', 'cycle', 'done'].includes(phase) },
    { id: 'link', title: 'Create Conflict Edges', detail: 'Add undirected edges from request node to all conflicting sessions.', active: phase === 'link', done: ['cycle', 'done'].includes(phase) },
    { id: 'cycle', title: 'Run Cycle Detection', detail: 'Apply DFS on undirected conflict graph to detect cycle structures.', active: phase === 'cycle', done: phase === 'done' },
  ]

  return (
    <section className="space-y-6">
      <article className="glass-card-strong relative overflow-hidden p-7">
        <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-honolulu-500 via-amethyst-500 to-honolulu-500" />
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
          <span className="bg-gradient-to-r from-honolulu-500 to-amethyst-500 bg-clip-text text-transparent">Graph Lab</span>
          <span className="text-slate-800">: Real Conflict Pipeline</span>
        </h1>
        <p className="mt-3 max-w-4xl text-base text-slate-500">This view uses your real timetable nodes and conflict edges. It then injects a request node from the same fields used in reschedule/extra lecture flow, scans clashes, creates new edges, and finally runs cycle detection with trace logs.</p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="stat-pill"><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Sessions</p><p className="mt-2 text-2xl font-black text-slate-800">{stats.sessions}</p></div>
          <div className="stat-pill-danger"><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-red-500">Base Conflict Edges</p><p className="mt-2 text-2xl font-black text-slate-800">{stats.baseEdges}</p></div>
          <div className="stat-pill-warning"><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-amber-500">Request Conflict Edges</p><p className="mt-2 text-2xl font-black text-slate-800">{stats.candidateEdges}</p></div>
          <div className="stat-pill-purple"><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-amethyst-500">Detected Clashes</p><p className="mt-2 text-2xl font-black text-slate-800">{stats.candidateConflicts}</p></div>
        </div>
      </article>

      <article className="glass-card relative overflow-hidden p-7">
        <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-amethyst-500 to-honolulu-500" />
        <h2 className="text-2xl font-extrabold text-slate-800">Graph Model</h2>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <div className="stat-pill"><p className="text-sm font-bold text-slate-800">Nodes (Vertices)</p><p className="mt-1 text-sm text-slate-500">Each node represents one class session. Example: S1 = DSA | ProfA | L101 | Mon 09:00-10:00</p></div>
          <div className="stat-pill-purple"><p className="text-sm font-bold text-slate-800">Edges (Undirected)</p><p className="mt-1 text-sm text-slate-500">An edge exists when two sessions conflict: same faculty, same room, same section, or same batch at overlapping time.</p></div>
          <div className="stat-pill-danger"><p className="text-sm text-red-600">Faculty Conflict</p></div>
          <div className="stat-pill"><p className="text-sm text-honolulu-600">Room Conflict</p></div>
          <div className="stat-pill-warning"><p className="text-sm text-amber-600">Batch / Section Conflict</p></div>
          <div className="stat-pill-purple"><p className="text-sm text-amethyst-600">Advanced Note: can be reduced to graph coloring for slot assignment.</p></div>
        </div>
      </article>

      <article className="glass-card relative overflow-hidden p-6">
        <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-honolulu-500 to-amethyst-500" />
        <h2 className="text-2xl font-extrabold text-slate-800">Request Input Mirror</h2>
        <p className="mt-2 text-sm text-slate-400">These are the same fields used in timetable request/reschedule logic.</p>

        <div className="mt-4 grid gap-3 md:grid-cols-3 xl:grid-cols-5">
          <input name="subjectName" value={form.subjectName} onChange={updateField} placeholder="Subject" className="input-glass" />
          <input name="faculty" value={form.faculty} onChange={updateField} placeholder="Faculty" className="input-glass" />
          <input name="className" value={form.className} onChange={updateField} placeholder="Class" className="input-glass" />
          <select name="sessionType" value={form.sessionType} onChange={updateField} className="input-glass"><option value="lecture">Lecture</option><option value="lab">Lab</option><option value="tutorial">Tutorial</option></select>
          {form.sessionType === 'lab' ? <select name="batch" value={form.batch} onChange={updateField} className="input-glass"><option value="A1">A1</option><option value="A2">A2</option><option value="A3">A3</option></select> : <select name="section" value={form.section} onChange={updateField} className="input-glass"><option value="A">A</option><option value="B">B</option><option value="C">C</option></select>}
          <input name="room" value={form.room} onChange={updateField} placeholder="Room / Lab" className="input-glass" />
          <select name="day" value={form.day} onChange={updateField} className="input-glass"><option value="Mon">Mon</option><option value="Tue">Tue</option><option value="Wed">Wed</option><option value="Thu">Thu</option><option value="Fri">Fri</option><option value="Sat">Sat</option></select>
          <input type="time" name="startTime" value={form.startTime} onChange={updateField} className="input-glass" />
          <input type="time" name="endTime" value={form.endTime} onChange={updateField} className="input-glass" />
          <label className="flex items-center gap-2 input-glass text-slate-500">Buffer (min)<input type="number" min="0" max="30" value={bufferMinutes} onChange={e => setBufferMinutes(Number(e.target.value) || 0)} className="w-14 rounded-lg border border-honolulu-200 bg-honolulu-50 px-2 py-1 text-sm text-honolulu-600" /></label>
        </div>
        <p className="mt-3 text-xs text-slate-400">Detection policy: Same day + time-window intersection with {bufferMinutes} minute turnaround buffer, then resource checks.</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <button onClick={runSimulation} disabled={loading || !!error || phase === 'scan' || phase === 'link' || phase === 'cycle'} className="btn-brand disabled:opacity-40">Run Visual Check</button>
          <button onClick={resetVisual} className="btn-secondary">Reset Visual State</button>
        </div>
      </article>

      <div className="grid gap-6 lg:grid-cols-[1.55fr_1fr] lg:items-start">
        <article className="glass-card relative overflow-hidden p-4">
          <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-honolulu-300 to-transparent" />
          <div className="mb-3 rounded-xl border border-honolulu-100 bg-honolulu-50/50 p-3 text-xs text-slate-500">Edge labels show conflict reasons between sessions. A graph can have conflicts and still have no cycle.</div>
          {loading && <div className="p-8 text-center"><div className="inline-block h-8 w-8 rounded-full border-2 border-honolulu-200 border-t-honolulu-500 animate-spin mb-3" /><p className="text-sm font-medium text-honolulu-600">Loading graph from backend...</p></div>}
          {!!error && <p className="p-8 text-sm font-medium text-red-500">{error}</p>}

          {!loading && !error && (
            <svg ref={svgRef} viewBox="0 0 1000 800" className="h-[800px] w-full cursor-move" role="img" aria-label="Real graph lab">
              <defs>
                <linearGradient id="lecNodeGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#0EA5E9" /><stop offset="100%" stopColor="#0369A1" /></linearGradient>
                <linearGradient id="labNodeGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#F59E0B" /><stop offset="100%" stopColor="#D97706" /></linearGradient>
                <linearGradient id="tutNodeGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#8B5CF6" /><stop offset="100%" stopColor="#6D28D9" /></linearGradient>
                <linearGradient id="reqNodeGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#10B981" /><stop offset="100%" stopColor="#059669" /></linearGradient>
                <filter id="labNodeGlow"><feGaussianBlur stdDeviation="4" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
              </defs>

              <g ref={gRef}>
                {edges.map((edge, i) => {
                  const from = nodePositions[edge.left], to = nodePositions[edge.right]
                  if (!from || !to) return null
                  const ek = [edge.left, edge.right].sort().join('|'), isCycle = cycleEdgeSet.has(ek), isConf = edge.type === 'conflict'
                  return (
                    <line 
                      key={`${edge.left}-${edge.right}-${edge.kind}-${i}`} 
                      x1={from.x} y1={from.y} x2={to.x} y2={to.y} 
                      stroke={isCycle ? '#EF4444' : isConf ? edgeColorForReasons(edge.reasons) : '#E2E8F0'} 
                      strokeWidth={isConf ? "4" : "1.5"} 
                      strokeDasharray={isConf ? "0" : "6 4"}
                      opacity="0.6" 
                    />
                  )
                })}

                {nodes.map(node => {
                  const pos = nodePositions[node.id], isReq = node.id === 'REQ', inCycle = cycleResult?.cyclePath?.includes(node.id), isAS = activeScanId === node.id
                  if (!pos) return null
                  const sType = node.session?.sessionType?.toLowerCase() || 'lecture'
                  const grad = inCycle ? '#EF4444' : isReq ? 'url(#reqNodeGrad)' : sType === 'lab' ? 'url(#labNodeGrad)' : sType === 'tutorial' ? 'url(#tutNodeGrad)' : 'url(#lecNodeGrad)'
                  
                  const sLabel = isReq ? 'Requested Slot' : truncateLabel(node.session.subjectName || 'Session', 18)
                  const rLabel = isReq ? `${node.session.room || 'Room TBD'} | ${node.session.day || ''} ${node.session.startTime || ''}-${node.session.endTime || ''}` : node.session.room || 'Room TBD'
                  const rSize = isReq ? 70 : 55
                  return (
                    <g key={node.id} filter="url(#labNodeGlow)" className="node-group transition-transform duration-300">
                      <circle cx={pos.x} cy={pos.y} r={rSize} fill={grad} stroke={isAS ? '#F59E0B' : '#E2E8F0'} strokeWidth={isAS ? 8 : 2} />
                      <text x={pos.x} y={pos.y + 2} textAnchor="middle" fill="#fff" className="text-[14px] font-black">{isReq ? 'REQ' : sType.slice(0, 3).toUpperCase()}</text>
                      
                      <g className={`transition-opacity duration-300 ${isStable || isAS ? 'opacity-100' : 'opacity-60'}`}>
                        <text x={pos.x} y={pos.y + rSize + 25} textAnchor="middle" fill="#1E293B" className="text-[14px] font-black">{sLabel}</text>
                        <text x={pos.x} y={pos.y + rSize + 42} textAnchor="middle" fill="#64748B" className="text-[12px] font-bold" opacity="0.8">{truncateLabel(rLabel, 50)}</text>
                        <text x={pos.x} y={pos.y + rSize + 58} textAnchor="middle" fill="#94A3B8" className="text-[10px] font-medium">{node.id}</text>
                      </g>
                    </g>
                  )
                })}
              </g>
            </svg>
          )}
        </article>

        <article className="glass-card relative overflow-hidden p-6">
          <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-amethyst-300 to-transparent" />
          <h2 className="text-2xl font-extrabold text-slate-800">Live Process + Logs</h2>
          <p className="mt-2 text-sm text-slate-500">Current phase: <span className="font-semibold uppercase text-honolulu-600">{phase}</span></p>

          <div className="mt-4 space-y-3">
            {stepStates.map((step, i) => (
              <div key={step.id} className={`rounded-xl border p-3 transition-all ${step.active ? 'border-honolulu-300 bg-honolulu-50' : step.done ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-slate-50'}`}>
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Step {i + 1}</p>
                <p className="mt-1 text-sm font-bold text-slate-800">{step.title}</p>
                <p className="mt-1 text-xs text-slate-400">{step.detail}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 max-h-[300px] space-y-1.5 overflow-auto rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-500 font-mono">
            {!traceLogs.length && <p className="text-slate-400">No logs yet. Click Run Visual Check.</p>}
            {traceLogs.map((log, i) => <p key={`${log}-${i}`} className="leading-5"><span className="text-honolulu-500">{String(i + 1).padStart(2, '0')}.</span> {log}</p>)}
          </div>

          {cycleResult && (
            <div className={`mt-4 rounded-xl border p-3 text-sm ${cycleResult.hasCycle ? 'border-red-200 bg-red-50 text-red-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`}>
              {cycleResult.hasCycle ? `Cycle detected: ${cycleResult.cyclePath.join(' -> ')}` : 'No cycle detected in the current graph.'}
            </div>
          )}
          {!!noCycleInsight && <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs font-medium text-amber-700">Why no cycle: {noCycleInsight}</div>}
        </article>
      </div>
    </section>
  )
}

export default GraphPlayground

import { useEffect, useMemo, useState } from 'react'
import { getTimetable } from '../services/api'

const BOOKED_SESSION_STORAGE_KEY = 'campusflow-booked-sessions'

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function normalizeTimetablePayload(payload) {
  if (Array.isArray(payload)) {
    return payload
  }

  if (payload && Array.isArray(payload.sessions)) {
    return payload.sessions
  }

  if (payload && typeof payload === 'object') {
    return Object.values(payload)
  }

  return []
}

function toMinutes(timeValue) {
  if (!timeValue || !timeValue.includes(':')) {
    return null
  }

  const [hourText, minuteText] = timeValue.split(':')
  const hour = Number(hourText)
  const minute = Number(minuteText)

  if (Number.isNaN(hour) || Number.isNaN(minute)) {
    return null
  }

  return hour * 60 + minute
}

function getSessionWindow(session) {
  const day = session.day
  const start = toMinutes(session.startTime)
  const end = toMinutes(session.endTime)

  if (!day || start === null || end === null) {
    return null
  }

  return { day, start, end }
}

function intervalsConflict(left, right, bufferMinutes = 0) {
  // Real-world scheduling: include turnaround buffer for room/faculty transitions.
  return left.start < right.end + bufferMinutes && right.start < left.end + bufferMinutes
}

function isSameText(left, right) {
  if (!left || !right) {
    return false
  }

  return String(left).trim().toLowerCase() === String(right).trim().toLowerCase()
}

function analyzeConflict(left, right, bufferMinutes = 10) {
  const leftWindow = getSessionWindow(left)
  const rightWindow = getSessionWindow(right)

  if (!leftWindow || !rightWindow) {
    return {
      overlap: false,
      sameFaculty: false,
      sameRoom: false,
      sameClass: false,
      sameSection: false,
      sameBatch: false,
      reasons: [],
    }
  }

  const overlap = leftWindow.day === rightWindow.day && intervalsConflict(leftWindow, rightWindow, bufferMinutes)

  const sameFaculty = overlap && isSameText(left.faculty, right.faculty)
  const sameRoom = overlap && isSameText(left.room, right.room)
  const sameClass = overlap && isSameText(left.className, right.className)

  const hasSectionValues = !!left.section && !!right.section
  const hasBatchValues = !!left.batch && !!right.batch
  const sameSection = sameClass && hasSectionValues && isSameText(left.section, right.section)
  const sameBatch = sameClass && hasBatchValues && isSameText(left.batch, right.batch)

  if (!overlap) {
    return {
      overlap,
      sameFaculty,
      sameRoom,
      sameClass,
      sameSection,
      sameBatch,
      reasons: [],
    }
  }

  const reasons = []
  if (sameFaculty) {
    reasons.push('Faculty Conflict')
  }

  if (sameRoom) {
    reasons.push('Room Conflict')
  }

  if (sameClass && (sameSection || sameBatch)) {
    reasons.push('Class Conflict')
  }

  if (sameSection) {
    reasons.push('Section Conflict')
  }

  if (sameBatch) {
    reasons.push('Batch Conflict')
  }

  return {
    overlap,
    sameFaculty,
    sameRoom,
    sameClass,
    sameSection,
    sameBatch,
    reasons,
  }
}

function getConflictReasons(left, right) {
  return analyzeConflict(left, right, 10).reasons
}

function findConflicts(candidateSession, allSessions, bufferMinutes = 10) {
  return allSessions
    .map((session) => {
      const diagnostics = analyzeConflict(candidateSession, session, bufferMinutes)
      return {
        session,
        diagnostics,
        reasons: diagnostics.reasons,
      }
    })
    .filter((entry) => entry.reasons.length > 0)
}

function buildBaseEdgesFromSessions(allSessions, bufferMinutes = 10) {
  const edges = []

  for (let i = 0; i < allSessions.length; i++) {
    for (let j = i + 1; j < allSessions.length; j++) {
      const leftSession = allSessions[i]
      const rightSession = allSessions[j]
      const diagnostics = analyzeConflict(leftSession, rightSession, bufferMinutes)

      if (diagnostics.reasons.length) {
        edges.push({
          left: String(leftSession.id),
          right: String(rightSession.id),
          reasons: diagnostics.reasons,
          kind: 'base',
        })
      }
    }
  }

  return edges
}

function buildAdjacency(nodes, edges) {
  const map = nodes.reduce((acc, node) => {
    acc[node.id] = []
    return acc
  }, {})

  edges.forEach((edge) => {
    if (map[edge.left]) {
      map[edge.left].push(edge.right)
    }

    if (map[edge.right]) {
      map[edge.right].push(edge.left)
    }
  })

  return map
}

function detectCycle(nodes, edges) {
  const adjacency = buildAdjacency(nodes, edges)
  const visited = new Set()
  const stack = new Set()
  const parent = {}
  const logs = []
  let cyclePath = []

  function dfs(nodeId, parentId = null) {
    visited.add(nodeId)
    stack.add(nodeId)
    logs.push(`Visit ${nodeId}`)

    for (const next of adjacency[nodeId] || []) {
      logs.push(`Explore ${nodeId} -> ${next}`)
      if (next === parentId) {
        continue
      }

      if (!visited.has(next)) {
        parent[next] = nodeId
        if (dfs(next, nodeId)) {
          return true
        }
      } else if (stack.has(next)) {
        logs.push(`Back-edge ${nodeId} -> ${next}: cycle detected`)
        const path = [next]
        let current = nodeId

        while (current && current !== next) {
          path.push(current)
          current = parent[current]
        }

        path.push(next)
        cyclePath = path.reverse()
        return true
      }
    }

    stack.delete(nodeId)
    logs.push(`Leave ${nodeId}`)
    return false
  }

  for (const node of nodes) {
    if (!visited.has(node.id) && dfs(node.id, null)) {
      return { hasCycle: true, cyclePath, logs }
    }
  }

  return { hasCycle: false, cyclePath: [], logs }
}

function toCandidateSession(form) {
  return {
    id: 'REQ',
    subjectName: form.subjectName,
    subjectCode: form.subjectName,
    faculty: form.faculty,
    className: form.className,
    sessionType: form.sessionType,
    section: form.section,
    batch: form.batch,
    room: form.room,
    day: form.day,
    startTime: form.startTime,
    endTime: form.endTime,
  }
}

function truncateLabel(value, max = 26) {
  if (!value) {
    return ''
  }

  return value.length > max ? `${value.slice(0, max - 1)}...` : value
}

function edgeColorForReasons(reasons) {
  if (reasons.includes('Faculty Conflict')) {
    return '#DC2626'
  }

  if (reasons.includes('Room Conflict')) {
    return '#1D4ED8'
  }

  if (reasons.includes('Batch Conflict') || reasons.includes('Section Conflict')) {
    return '#D97706'
  }

  return '#64748B'
}

function edgeReasonLabel(reasons) {
  if (!reasons.length) {
    return 'Conflict'
  }

  if (reasons.length === 1) {
    return reasons[0]
  }

  return `${reasons.length} conflicts`
}

function GraphPlayground() {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    subjectName: 'CS999 Demo',
    faculty: 'Dr. Smith',
    className: 'CSE',
    sessionType: 'lecture',
    section: 'A',
    batch: '',
    room: 'Room 101',
    day: 'Mon',
    startTime: '09:30',
    endTime: '10:30',
  })

  const [phase, setPhase] = useState('idle')
  const [activeScanId, setActiveScanId] = useState('')
  const [visibleBaseEdges, setVisibleBaseEdges] = useState(0)
  const [visibleCandidateEdges, setVisibleCandidateEdges] = useState(0)
  const [traceLogs, setTraceLogs] = useState([])
  const [cycleResult, setCycleResult] = useState(null)
  const [bufferMinutes, setBufferMinutes] = useState(10)

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        setError('')

        const timetableData = await getTimetable()
        const baseSessions = normalizeTimetablePayload(timetableData)
        const booked = JSON.parse(localStorage.getItem(BOOKED_SESSION_STORAGE_KEY) || '[]')

        setSessions([...baseSessions, ...(Array.isArray(booked) ? booked : [])])
      } catch (err) {
        setError(err.message || 'Unable to load graph data')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  function updateField(event) {
    const { name, value } = event.target

    setForm((prev) => {
      const next = { ...prev, [name]: value }
      if (name === 'sessionType') {
        if (value === 'lab') {
          next.section = ''
          next.batch = 'A1'
        } else {
          next.batch = ''
          if (!next.section) {
            next.section = 'A'
          }
        }
      }
      return next
    })
  }

  const candidateSession = useMemo(() => toCandidateSession(form), [form])

  const baseNodes = useMemo(() => sessions.map((session) => ({ id: String(session.id), session })), [sessions])

  const sessionById = useMemo(
    () =>
      sessions.reduce((acc, session) => {
        acc[String(session.id)] = session
        return acc
      }, {}),
    [sessions],
  )

  const baseEdges = useMemo(() => buildBaseEdgesFromSessions(sessions, bufferMinutes), [bufferMinutes, sessions])

  const candidateConflicts = useMemo(
    () => findConflicts(candidateSession, sessions, bufferMinutes),
    [bufferMinutes, candidateSession, sessions],
  )

  const candidateEdges = useMemo(
    () =>
      candidateConflicts.map((entry) => ({
        left: 'REQ',
        right: String(entry.session.id),
        reasons: entry.reasons,
        kind: 'candidate',
      })),
    [candidateConflicts],
  )

  const nodes = useMemo(() => [...baseNodes, { id: 'REQ', session: candidateSession }], [baseNodes, candidateSession])

  const edges = useMemo(
    () => [...baseEdges.slice(0, visibleBaseEdges), ...candidateEdges.slice(0, visibleCandidateEdges)],
    [baseEdges, candidateEdges, visibleBaseEdges, visibleCandidateEdges],
  )

  const cycleEdges = useMemo(() => {
    if (!cycleResult?.cyclePath?.length) {
      return new Set()
    }

    const set = new Set()
    for (let i = 0; i < cycleResult.cyclePath.length - 1; i++) {
      const edgeKey = [cycleResult.cyclePath[i], cycleResult.cyclePath[i + 1]].sort().join('|')
      set.add(edgeKey)
    }

    return set
  }, [cycleResult])

  const noCycleInsight = useMemo(() => {
    if (!cycleResult || cycleResult.hasCycle) {
      return ''
    }

    const conflictIds = candidateConflicts.map((entry) => String(entry.session.id))

    if (conflictIds.length < 2) {
      return 'Only one conflict neighbor is connected to REQ, so no closed loop can exist.'
    }

    const baseEdgeKeys = new Set(baseEdges.map((edge) => [edge.left, edge.right].sort().join('|')))
    const missingLinks = []
    let hasAnyLinkBetweenConflictNodes = false

    for (let i = 0; i < conflictIds.length; i++) {
      for (let j = i + 1; j < conflictIds.length; j++) {
        const a = conflictIds[i]
        const b = conflictIds[j]
        const key = [a, b].sort().join('|')

        const leftSession = sessionById[a]
        const rightSession = sessionById[b]
        const pairDiagnostics = leftSession && rightSession ? analyzeConflict(leftSession, rightSession, bufferMinutes) : null

        if (baseEdgeKeys.has(key)) {
          hasAnyLinkBetweenConflictNodes = true
        } else {
          if (pairDiagnostics) {
            missingLinks.push(
              `${a} -- ${b} (overlap=${pairDiagnostics.overlap}, faculty=${pairDiagnostics.sameFaculty}, room=${pairDiagnostics.sameRoom}, class=${pairDiagnostics.sameClass}, section=${pairDiagnostics.sameSection}, batch=${pairDiagnostics.sameBatch})`,
            )
          } else {
            missingLinks.push(`${a} -- ${b}`)
          }
        }
      }
    }

    if (!hasAnyLinkBetweenConflictNodes) {
      return `No cycle because conflict nodes are only connected through REQ (star shape). Missing direct links: ${missingLinks.join(' | ')}.`
    }

    return `No cycle detected in current traversal. Potential missing links for closure: ${missingLinks.join(' | ')}.`
  }, [baseEdges, bufferMinutes, candidateConflicts, cycleResult, sessionById])

  const nodePositions = useMemo(() => {
    const width = 1000
    const height = 620
    const radius = Math.max(210, Math.min(270, 100 + nodes.length * 14))
    const centerX = width / 2
    const centerY = height / 2

    return nodes.reduce((acc, node, index) => {
      const angle = (2 * Math.PI * index) / Math.max(nodes.length, 1) - Math.PI / 2
      acc[node.id] = {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
      }
      return acc
    }, {})
  }, [nodes])

  async function runSimulation() {
    if (loading || !!error) {
      return
    }

    setPhase('build')
    setTraceLogs(['Loading existing conflict edges...'])
    setCycleResult(null)
    setActiveScanId('')

    setVisibleBaseEdges(0)
    for (let i = 1; i <= baseEdges.length; i++) {
      setVisibleBaseEdges(i)
      await sleep(90)
    }

    setPhase('scan')
    setTraceLogs((prev) => [...prev, 'Scanning existing sessions against request node REQ...'])

    for (const session of sessions) {
      const result = analyzeConflict(candidateSession, session, bufferMinutes)
      setActiveScanId(String(session.id))
      await sleep(260)

      setTraceLogs((prev) => [
        ...prev,
        result.reasons.length
          ? `Conflict with ${session.id} (${session.subjectCode || session.subjectName}) | overlap=${result.overlap} faculty=${result.sameFaculty} room=${result.sameRoom} class=${result.sameClass} section=${result.sameSection} batch=${result.sameBatch} -> ${result.reasons.join(', ')}`
          : `No conflict with ${session.id} (${session.subjectCode || session.subjectName}) | overlap=${result.overlap} faculty=${result.sameFaculty} room=${result.sameRoom} class=${result.sameClass} section=${result.sameSection} batch=${result.sameBatch}`,
      ])
    }

    if (!candidateConflicts.length) {
      setTraceLogs((prev) => [...prev, 'No conflicts found against existing sessions.'])
    }

    setActiveScanId('')
    setPhase('link')
    setTraceLogs((prev) => [...prev, 'Creating request conflict edges...'])

    setVisibleCandidateEdges(0)
    for (let i = 1; i <= candidateEdges.length; i++) {
      setVisibleCandidateEdges(i)
      await sleep(140)
    }

    setPhase('cycle')
    setTraceLogs((prev) => [...prev, 'Running DFS cycle detection...'])

    const result = detectCycle(nodes, [...baseEdges, ...candidateEdges])
    setCycleResult(result)
    setTraceLogs((prev) => [...prev, ...result.logs])

    setPhase('done')
  }

  function resetVisual() {
    setVisibleBaseEdges(baseEdges.length)
    setVisibleCandidateEdges(candidateEdges.length)
    setActiveScanId('')
    setTraceLogs([])
    setCycleResult(null)
    setPhase('idle')
  }

  const stats = useMemo(
    () => ({
      sessions: sessions.length,
      baseEdges: baseEdges.length,
      candidateEdges: candidateEdges.length,
      candidateConflicts: candidateConflicts.length,
    }),
    [baseEdges.length, candidateConflicts.length, candidateEdges.length, sessions.length],
  )

  const stepStates = [
    {
      id: 'build',
      title: 'Build Session Nodes',
      detail: 'Every lecture/lab/tutorial is modeled as one node.',
      active: phase === 'build',
      done: ['scan', 'link', 'cycle', 'done'].includes(phase),
    },
    {
      id: 'scan',
      title: 'Scan Request Against Sessions',
      detail: 'Compare day + time overlap and check faculty/room/section/batch.',
      active: phase === 'scan',
      done: ['link', 'cycle', 'done'].includes(phase),
    },
    {
      id: 'link',
      title: 'Create Conflict Edges',
      detail: 'Add undirected edges from request node to all conflicting sessions.',
      active: phase === 'link',
      done: ['cycle', 'done'].includes(phase),
    },
    {
      id: 'cycle',
      title: 'Run Cycle Detection',
      detail: 'Apply DFS on undirected conflict graph to detect cycle structures.',
      active: phase === 'cycle',
      done: phase === 'done',
    },
  ]

  return (
    <section className="space-y-6">
      <article className="rounded-3xl border border-slate-200/80 bg-white/95 p-7 shadow-panel">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">Graph Lab: Real Conflict Pipeline</h1>
        <p className="mt-3 max-w-4xl text-base text-slate-600">
          This view uses your real timetable nodes and conflict edges. It then injects a request node from the same
          fields used in reschedule/extra lecture flow, scans clashes, creates new edges, and finally runs cycle
          detection with trace logs.
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Sessions</p>
            <p className="mt-2 text-2xl font-black text-slate-900">{stats.sessions}</p>
          </div>
          <div className="rounded-2xl border border-red-100 bg-red-50 p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-red-700">Base Conflict Edges</p>
            <p className="mt-2 text-2xl font-black text-red-900">{stats.baseEdges}</p>
          </div>
          <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-amber-700">Request Conflict Edges</p>
            <p className="mt-2 text-2xl font-black text-amber-900">{stats.candidateEdges}</p>
          </div>
          <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-blue-700">Detected Clashes</p>
            <p className="mt-2 text-2xl font-black text-blue-900">{stats.candidateConflicts}</p>
          </div>
        </div>
      </article>

      <article className="rounded-3xl border border-slate-200/80 bg-white/95 p-7 shadow-panel">
        <h2 className="text-2xl font-extrabold text-slate-900">Graph Model</h2>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-bold text-slate-900">Nodes (Vertices)</p>
            <p className="mt-1 text-sm text-slate-600">
              Each node represents one class session. Example: S1 = DSA | ProfA | L101 | Mon 09:00-10:00
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-bold text-slate-900">Edges (Undirected)</p>
            <p className="mt-1 text-sm text-slate-600">
              An edge exists when two sessions conflict: same faculty, same room, same section, or same batch at
              overlapping time.
            </p>
          </div>
          <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">Faculty Conflict</div>
          <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-700">Room Conflict</div>
          <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4 text-sm text-amber-700">
            Batch / Section Conflict
          </div>
          <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-4 text-sm text-indigo-700">
            Advanced Note: can be reduced to graph coloring for slot assignment.
          </div>
        </div>
      </article>

      <article className="rounded-3xl border border-slate-200/80 bg-white/95 p-6 shadow-panel">
        <h2 className="text-2xl font-extrabold text-slate-900">Request Input Mirror</h2>
        <p className="mt-2 text-sm text-slate-600">
          These are the same fields used in timetable request/reschedule logic.
        </p>

        <div className="mt-4 grid gap-3 md:grid-cols-3 xl:grid-cols-5">
          <input
            name="subjectName"
            value={form.subjectName}
            onChange={updateField}
            placeholder="Subject"
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
          />
          <input
            name="faculty"
            value={form.faculty}
            onChange={updateField}
            placeholder="Faculty"
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
          />
          <input
            name="className"
            value={form.className}
            onChange={updateField}
            placeholder="Class"
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
          />
          <select
            name="sessionType"
            value={form.sessionType}
            onChange={updateField}
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
          >
            <option value="lecture">Lecture</option>
            <option value="lab">Lab</option>
            <option value="tutorial">Tutorial</option>
          </select>

          {form.sessionType === 'lab' ? (
            <select
              name="batch"
              value={form.batch}
              onChange={updateField}
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
            >
              <option value="A1">A1</option>
              <option value="A2">A2</option>
              <option value="A3">A3</option>
            </select>
          ) : (
            <select
              name="section"
              value={form.section}
              onChange={updateField}
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
            >
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
            </select>
          )}

          <input
            name="room"
            value={form.room}
            onChange={updateField}
            placeholder="Room / Lab"
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
          />
          <select
            name="day"
            value={form.day}
            onChange={updateField}
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
          >
            <option value="Mon">Mon</option>
            <option value="Tue">Tue</option>
            <option value="Wed">Wed</option>
            <option value="Thu">Thu</option>
            <option value="Fri">Fri</option>
            <option value="Sat">Sat</option>
          </select>
          <input
            type="time"
            name="startTime"
            value={form.startTime}
            onChange={updateField}
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
          />
          <input
            type="time"
            name="endTime"
            value={form.endTime}
            onChange={updateField}
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
          />
          <label className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700">
            Buffer (min)
            <input
              type="number"
              min="0"
              max="30"
              value={bufferMinutes}
              onChange={(event) => setBufferMinutes(Number(event.target.value) || 0)}
              className="w-16 rounded-md border border-slate-300 px-2 py-1 text-sm"
            />
          </label>
        </div>

        <p className="mt-3 text-xs text-slate-600">
          Detection policy: Same day + time-window intersection with {bufferMinutes} minute turnaround buffer, then
          resource checks (faculty, room, section, batch).
        </p>

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            onClick={runSimulation}
            disabled={loading || !!error || phase === 'scan' || phase === 'link' || phase === 'cycle'}
            className="rounded-2xl bg-gradient-to-r from-campus-500 to-campus-800 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          >
            Run Visual Check
          </button>
          <button
            onClick={resetVisual}
            className="rounded-2xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700"
          >
            Reset Visual State
          </button>
        </div>
      </article>

      <div className="grid gap-6 lg:grid-cols-[1.55fr_1fr] lg:items-start">
        <article className="rounded-3xl border border-slate-200/80 bg-white/95 p-4 shadow-panel">
          <div className="mb-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
            Edge labels show conflict reasons between sessions. A graph can have conflicts and still have no cycle.
          </div>
          {loading && <p className="p-8 text-sm font-medium text-campus-700">Loading graph from backend...</p>}
          {!!error && <p className="p-8 text-sm font-medium text-red-700">{error}</p>}

          {!loading && !error && (
            <svg viewBox="0 0 1000 620" className="h-[620px] w-full" role="img" aria-label="Real graph lab">
              {edges.map((edge, index) => {
                const from = nodePositions[edge.left]
                const to = nodePositions[edge.right]
                if (!from || !to) {
                  return null
                }

                const edgeKey = [edge.left, edge.right].sort().join('|')
                const isCycle = cycleEdges.has(edgeKey)
                const isCandidate = edge.kind === 'candidate'
                const stroke = isCycle ? '#DC2626' : edgeColorForReasons(edge.reasons)

                return (
                  <line
                    key={`${edge.left}-${edge.right}-${edge.kind}-${index}`}
                    x1={from.x}
                    y1={from.y}
                    x2={to.x}
                    y2={to.y}
                    stroke={stroke}
                    strokeWidth={isCycle ? 3.4 : isCandidate ? 2.8 : 2.1}
                    opacity="0.9"
                  />
                )
              })}

              {nodes.map((node) => {
                const pos = nodePositions[node.id]
                const isReq = node.id === 'REQ'
                const inCycle = cycleResult?.cyclePath?.includes(node.id)
                const isActiveScan = activeScanId === node.id
                const sessionLabel = isReq ? 'Requested Slot' : truncateLabel(node.session.subjectName || 'Session')
                const roomLabel = isReq
                  ? `${node.session.room || 'Room TBD'} | ${node.session.day || ''} ${node.session.startTime || ''}-${node.session.endTime || ''}`
                  : node.session.room || 'Room TBD'

                return (
                  <g key={node.id}>
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r={isReq ? 30 : 23}
                      fill={inCycle ? '#DC2626' : isReq ? '#0F766E' : '#1C39BB'}
                      stroke={isActiveScan ? '#F59E0B' : '#E2E8F0'}
                      strokeWidth={isActiveScan ? 4 : 1.5}
                    />
                    <text x={pos.x} y={pos.y - 1} textAnchor="middle" className="fill-white text-[10px] font-bold">
                      {isReq ? 'REQ' : 'SES'}
                    </text>
                    <text x={pos.x} y={pos.y + 41} textAnchor="middle" className="fill-slate-700 text-[10px] font-semibold">
                      {sessionLabel}
                    </text>
                    <text x={pos.x} y={pos.y + 54} textAnchor="middle" className="fill-slate-500 text-[9px] font-medium">
                      {truncateLabel(roomLabel, 40)}
                    </text>
                  </g>
                )
              })}
            </svg>
          )}
        </article>

        <article className="rounded-3xl border border-slate-200/80 bg-white/95 p-6 shadow-panel">
          <h2 className="text-2xl font-extrabold text-slate-900">Live Process + Logs</h2>
          <p className="mt-2 text-sm text-slate-600">
            Current phase: <span className="font-semibold uppercase text-slate-800">{phase}</span>
          </p>

          <div className="mt-4 space-y-3">
            {stepStates.map((step, index) => (
              <div
                key={step.id}
                className={`rounded-2xl border p-3 ${
                  step.active
                    ? 'border-campus-500 bg-campus-50'
                    : step.done
                      ? 'border-green-200 bg-green-50'
                      : 'border-slate-200 bg-slate-50'
                }`}
              >
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Step {index + 1}</p>
                <p className="mt-1 text-sm font-bold text-slate-900">{step.title}</p>
                <p className="mt-1 text-xs text-slate-600">{step.detail}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 max-h-[300px] space-y-2 overflow-auto rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-700">
            {!traceLogs.length && <p>No logs yet. Click Run Visual Check.</p>}
            {traceLogs.map((log, index) => (
              <p key={`${log}-${index}`} className="leading-5">
                {index + 1}. {log}
              </p>
            ))}
          </div>

          {cycleResult && (
            <div
              className={`mt-4 rounded-2xl border p-3 text-sm ${
                cycleResult.hasCycle
                  ? 'border-red-200 bg-red-50 text-red-700'
                  : 'border-green-200 bg-green-50 text-green-700'
              }`}
            >
              {cycleResult.hasCycle
                ? `Cycle detected: ${cycleResult.cyclePath.join(' -> ')}`
                : 'No cycle detected in the current graph.'}
            </div>
          )}

          {!!noCycleInsight && (
            <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-xs font-medium text-amber-800">
              Why no cycle: {noCycleInsight}
            </div>
          )}
        </article>
      </div>
    </section>
  )
}

export default GraphPlayground

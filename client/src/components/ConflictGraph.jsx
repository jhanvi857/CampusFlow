function uniqueNodes(conflicts = {}) {
  const sourceNodes = Object.keys(conflicts)
  const targetNodes = sourceNodes.flatMap((source) => conflicts[source] || [])
  return [...new Set([...sourceNodes, ...targetNodes])]
}

function ConflictGraph({ conflicts }) {
  const nodes = uniqueNodes(conflicts)
  if (!nodes.length) return null

  const width = 780
  const height = Math.max(400, nodes.length * 80)
  const radius = Math.min(width, height) * 0.34
  const centerX = width / 2
  const centerY = height / 2

  const positions = nodes.reduce((acc, node, index) => {
    const angle = (2 * Math.PI * index) / nodes.length - Math.PI / 2
    acc[node] = { x: centerX + radius * Math.cos(angle), y: centerY + radius * Math.sin(angle) }
    return acc
  }, {})

  const edges = Object.entries(conflicts).flatMap(([source, targets]) => (targets || []).map(target => ({ source, target })))
  const degreeMap = nodes.reduce((a, n) => { a[n] = 0; return a }, {})
  edges.forEach(e => { if (degreeMap[e.source] !== undefined) degreeMap[e.source]++ })

  return (
    <div className="overflow-x-auto rounded-2xl border border-honolulu-100 bg-white/60 p-4">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-[420px] min-w-[760px] w-full" role="img" aria-label="Conflict graph">
        <defs>
          <linearGradient id="edgeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FCA5A5" /><stop offset="100%" stopColor="#EF4444" />
          </linearGradient>
          <linearGradient id="nodeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0077B6" /><stop offset="100%" stopColor="#8B5CF6" />
          </linearGradient>
          <filter id="nodeGlow"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        </defs>

        {edges.map((edge, i) => {
          const s = positions[edge.source], t = positions[edge.target]
          if (!s || !t) return null
          return <line key={`${edge.source}-${edge.target}-${i}`} x1={s.x} y1={s.y} x2={t.x} y2={t.y} stroke="url(#edgeGradient)" strokeWidth="2" opacity="0.7" />
        })}

        {nodes.map(node => {
          const p = positions[node]
          const size = Math.min(28, 20 + (degreeMap[node] || 0) * 1.5)
          return (
            <g key={node} filter="url(#nodeGlow)">
              <circle cx={p.x} cy={p.y} r={size + 5} fill="none" stroke="#0077B6" strokeWidth="1.5" opacity="0.2" />
              <circle cx={p.x} cy={p.y} r={size} fill="url(#nodeGradient)" />
              <text x={p.x} y={p.y + 4} textAnchor="middle" className="text-[11px] font-bold" fill="#fff">{node}</text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

export default ConflictGraph

function uniqueNodes(conflicts = {}) {
  const sourceNodes = Object.keys(conflicts)
  const targetNodes = sourceNodes.flatMap((source) => conflicts[source] || [])
  return [...new Set([...sourceNodes, ...targetNodes])]
}

function ConflictGraph({ conflicts }) {
  const nodes = uniqueNodes(conflicts)

  if (!nodes.length) {
    return null
  }

  const width = 780
  const height = Math.max(340, nodes.length * 80)
  const radius = Math.min(width, height) * 0.34
  const centerX = width / 2
  const centerY = height / 2

  const positions = nodes.reduce((acc, node, index) => {
    const angle = (2 * Math.PI * index) / nodes.length - Math.PI / 2
    acc[node] = {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
    }

    return acc
  }, {})

  const edges = Object.entries(conflicts).flatMap(([source, targets]) =>
    (targets || []).map((target) => ({ source, target })),
  )

  const degreeMap = nodes.reduce((acc, node) => {
    acc[node] = 0
    return acc
  }, {})

  edges.forEach((edge) => {
    if (degreeMap[edge.source] !== undefined) {
      degreeMap[edge.source] += 1
    }
  })

  return (
    <div className="overflow-x-auto rounded-3xl border border-slate-200/80 bg-white/95 p-4 shadow-panel">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-[420px] min-w-[760px] w-full"
        role="img"
        aria-label="Conflict graph"
      >
        <defs>
          <linearGradient id="edgeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FCA5A5" />
            <stop offset="100%" stopColor="#DC2626" />
          </linearGradient>
        </defs>

        {edges.map((edge, index) => {
          const source = positions[edge.source]
          const target = positions[edge.target]

          if (!source || !target) {
            return null
          }

          return (
            <line
              key={`${edge.source}-${edge.target}-${index}`}
              x1={source.x}
              y1={source.y}
              x2={target.x}
              y2={target.y}
              stroke="url(#edgeGradient)"
              strokeWidth="2"
              opacity="0.8"
            />
          )
        })}

        {nodes.map((node) => {
          const position = positions[node]
          const size = Math.min(28, 20 + (degreeMap[node] || 0) * 1.5)

          return (
            <g key={node}>
              <circle cx={position.x} cy={position.y} r={size} fill="#1C39BB" />
              <circle
                cx={position.x}
                cy={position.y}
                r={size + 4}
                fill="none"
                stroke="#60A5FA"
                strokeWidth="2"
                opacity="0.75"
              />
              <text
                x={position.x}
                y={position.y + 4}
                textAnchor="middle"
                className="fill-white text-[11px] font-bold"
              >
                {node}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

export default ConflictGraph

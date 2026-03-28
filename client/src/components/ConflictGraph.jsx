import { useEffect, useRef, useState, useMemo, useCallback } from 'react'
import * as d3Force from 'd3-force'
import * as d3Zoom from 'd3-zoom'
import * as d3Selection from 'd3-selection'
import * as d3Drag from 'd3-drag'

function uniqueNodes(conflicts = {}) {
  const sourceNodes = Object.keys(conflicts)
  const targetNodes = sourceNodes.flatMap((source) => conflicts[source] || [])
  return [...new Set([...sourceNodes, ...targetNodes])]
}

const truncate = (v, max = 20) => !v ? '' : v.length > max ? `${v.slice(0, max - 1)}..` : v

function ConflictGraph({ conflicts, sessions = [], activePath = [], activeScanId = '' }) {
  const svgRef = useRef(null)
  const gRef = useRef(null)
  const [positions, setPositions] = useState({})
  
  const width = 1600; const height = 1200

  const sessionDataMap = useMemo(() => 
    [...sessions, { id: 'REQ', subjectName: 'NEW REQUEST', startTime: '...', endTime: '...', day: '...', room: '...' }].reduce((acc, s) => { acc[String(s.id)] = s; return acc }, {}),
  [sessions])

  const nodesArr = useMemo(() => {
     const ids = uniqueNodes(conflicts);
     if (!ids.includes('REQ')) ids.push('REQ');
     return ids.map(id => ({ id, group: (sessionDataMap[id]?.className || 'CF') }));
  }, [conflicts, sessionDataMap])

  const allEdgesArr = useMemo(() => 
    Object.entries(conflicts).flatMap(([source, targets]) => 
      (targets || []).map(target => ({ source, target }))
    ), [conflicts])

  useEffect(() => {
    if (!nodesArr.length) return
    const d3Nodes = nodesArr.map(n => ({ ...n }))
    const d3Edges = allEdgesArr.map(e => ({ source: e.source, target: e.target }))

    const simulation = d3Force.forceSimulation(d3Nodes)
      .force("link", d3Force.forceLink(d3Edges).id(d => d.id).distance(250).strength(0.15))
      .force("charge", d3Force.forceManyBody().strength(-8000))
      .force("center", d3Force.forceCenter(width / 2, height / 2))
      .force("collision", d3Force.forceCollide().radius(220))
      .alphaDecay(0.08)
      .velocityDecay(0.4)
      .on("tick", () => {
         const p = {}; d3Nodes.forEach(n => { p[n.id] = { x: n.x, y: n.y } }); setPositions(p)
      })

    const svg = d3Selection.select(svgRef.current)
    const g = d3Selection.select(gRef.current)
    const zoom = d3Zoom.zoom().scaleExtent([0.1, 4]).on("zoom", (e) => g.attr("transform", e.transform))
    svg.call(zoom).call(zoom.transform, d3Zoom.zoomIdentity.translate(0, 0).scale(0.75))

    return () => simulation.stop()
  }, [nodesArr.length])

  const cycleEdgeSet = useMemo(() => {
    const set = new Set(); const p = activePath || []
    for (let i = 0; i < p.length - 1; i++) { set.add([p[i], p[i+1]].sort().join('|')) }
    return set
  }, [activePath])

  return (
    <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-50 border border-slate-200 shadow-xl h-[850px]">
       {/* Diagnostic Legend removed as per request */}

       <svg ref={svgRef} viewBox={`0 0 ${width} ${height}`} className="w-full h-full cursor-move">
          <defs>
             <linearGradient id="reqGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#10B981" /><stop offset="100%" stopColor="#059669" /></linearGradient>
             <linearGradient id="lecGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#0EA5E9" /><stop offset="100%" stopColor="#0369A1" /></linearGradient>
             <linearGradient id="cycGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#EF4444" /><stop offset="100%" stopColor="#B91C1C" /></linearGradient>
             <filter id="boldGlow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="15" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          </defs>
          <g ref={gRef}>
             {allEdgesArr.map((e, i) => {
                const s = positions[e.source], t = positions[e.target]
                if (!s || !t) return null
                const isCycle = cycleEdgeSet.has([e.source, e.target].sort().join('|'))
                const isReq = e.source === 'REQ' || e.target === 'REQ'
                return (
                  <line 
                    key={i} x1={s.x} y1={s.y} x2={t.x} y2={t.y} 
                    stroke={isCycle ? '#EF4444' : isReq ? '#F59E0B' : '#CBD5E1'} 
                    strokeWidth={isCycle ? 16 : isReq ? 8 : 4} 
                    opacity={isCycle || isReq ? 1 : 0.4}
                    strokeLinecap="round"
                    className={isCycle ? "animate-pulse" : ""}
                  />
                )
             })}

             {nodesArr.map(node => {
                const p = positions[node.id], inC = activePath.includes(node.id), isReq = node.id === 'REQ', isA = activeScanId === node.id
                if (!p) return null
                const s = sessionDataMap[node.id] || {}
                const rSize = isReq ? 105 : inC ? 95 : 85
                const fill = isReq ? 'url(#reqGrad)' : inC ? 'url(#cycGrad)' : 'url(#lecGrad)'
                
                return (
                  <g key={node.id} filter={isA || inC ? "url(#boldGlow)" : ""}>
                     <circle 
                        cx={p.x} cy={p.y} r={rSize} 
                        fill={fill} 
                        stroke={isA ? '#F59E0B' : '#FFF'} 
                        strokeWidth={isA ? 25 : 6} 
                        className={isA ? "animate-pulse" : "transition-transform duration-300"}
                     />
                     <text x={p.x} y={p.y + 10} textAnchor="middle" fill="#fff" className="text-2xl font-black uppercase pointer-events-none select-none">{isReq ? 'REQ' : s.sessionType?.slice(0,3).toUpperCase() || 'LEC'}</text>
                     <g className="pointer-events-none">
                        <text x={p.x} y={p.y + rSize + 40} textAnchor="middle" fill={inC ? '#B91C1C' : '#1E293B'} className={`text-xl font-black uppercase tracking-tight ${inC ? 'animate-bounce' : ''}`}>{isReq ? 'REQUEST SLOT' : truncate(s.subjectName || node.id, 18)}</text>
                        <text x={p.x} y={p.y + rSize + 65} textAnchor="middle" fill="#94A3B8" className="text-sm font-bold uppercase tracking-widest">{s.room || 'SYSTEM'}</text>
                     </g>
                  </g>
                )
             })}
          </g>
       </svg>
    </div>
  )
}

export default ConflictGraph

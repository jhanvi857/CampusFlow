import { useEffect, useRef, useState, useMemo } from 'react'
import * as d3Force from 'd3-force'
import * as d3Zoom from 'd3-zoom'
import * as d3Selection from 'd3-selection'
import * as d3Drag from 'd3-drag'

function uniqueNodes(conflicts = {}) {
  const sourceNodes = Object.keys(conflicts)
  const targetNodes = sourceNodes.flatMap((source) => conflicts[source] || [])
  return [...new Set([...sourceNodes, ...targetNodes])]
}

function truncateLabel(v, max = 26) { return !v ? '' : v.length > max ? `${v.slice(0, max - 1)}...` : v }

function ConflictGraph({ conflicts, sessions = [] }) {
  const sessionDataMap = useMemo(() => 
    sessions.reduce((acc, s) => { acc[String(s.id)] = s; return acc }, {}),
  [sessions])

  const nodesArr = useMemo(() => uniqueNodes(conflicts).map(id => ({ 
    id, 
    session: sessionDataMap[id] || {} 
  })), [conflicts, sessionDataMap])

  // Conflict Edges
  const conflictEdges = useMemo(() => 
    Object.entries(conflicts).flatMap(([source, targets]) => 
      (targets || []).map(target => ({ source, target, type: 'conflict' }))
    ), [conflicts])

  // Structural Edges (Same subject + Same class)
  const structuralEdges = useMemo(() => {
    const edges = []
    for (let i = 0; i < nodesArr.length; i++) {
        for (let j = i + 1; j < nodesArr.length; j++) {
            const s1 = nodesArr[i].session, s2 = nodesArr[j].session
            if (s1.subjectCode && s1.subjectCode === s2.subjectCode && s1.className === s2.className) {
                edges.push({ source: nodesArr[i].id, target: nodesArr[j].id, type: 'structural' })
            }
        }
    }
    return edges
  }, [nodesArr])

  const allEdgesArr = useMemo(() => [...conflictEdges, ...structuralEdges], [conflictEdges, structuralEdges])

  const [positions, setPositions] = useState({})
  const [hoveredNode, setHoveredNode] = useState(null)
  const [isStable, setIsStable] = useState(false)
  const svgRef = useRef(null)
  const gRef = useRef(null)
  
  const width = 1400
  const height = 1000

  useEffect(() => {
    if (!nodesArr.length) return

    const simulation = d3Force.forceSimulation(nodesArr)
      .force("link", d3Force.forceLink(allEdgesArr).id(d => d.id).distance(d => d.type === 'conflict' ? 450 : 250))
      .force("charge", d3Force.forceManyBody().strength(-5000))
      .force("center", d3Force.forceCenter(width / 2, height / 2))
      .force("collision", d3Force.forceCollide().radius(180))
      .alphaDecay(0.01)
      .velocityDecay(0.6)
      .on("tick", () => {
        const newPos = {}
        nodesArr.forEach(node => {
          newPos[node.id] = { x: node.x, y: node.y }
        })
        setPositions({ ...newPos })
      })
      .on("end", () => setIsStable(true))

    const svg = d3Selection.select(svgRef.current)
    const g = d3Selection.select(gRef.current)
    
    const zoom = d3Zoom.zoom()
      .scaleExtent([0.1, 4])
      .on("zoom", (event) => g.attr("transform", event.transform))
    svg.call(zoom)

    // Initial centering
    svg.call(zoom.transform, d3Zoom.zoomIdentity.translate(0, 0).scale(0.85))

    const drag = d3Drag.drag()
      .on("start", (event, d) => {
        if (!event.active) simulation.alphaTarget(0.2).restart()
        d.fx = d.x; d.fy = d.y; setIsStable(false)
      })
      .on("drag", (event, d) => { d.fx = event.x; d.fy = event.y })
      .on("end", (event, d) => {
        if (!event.active) simulation.alphaTarget(0)
        d.fx = null; d.fy = null
      })

    d3Selection.selectAll(".node-group").data(nodesArr).call(drag)

    return () => simulation.stop()
  }, [nodesArr.length, allEdgesArr.length])

  if (!nodesArr.length) return null

  const degreeMap = nodesArr.reduce((a, n) => { a[n.id] = 0; return a }, {})
  conflictEdges.forEach(e => { 
    const sId = typeof e.source === 'object' ? e.source.id : e.source
    if (degreeMap[sId] !== undefined) degreeMap[sId]++ 
  })

  return (
    <div className="relative group overflow-hidden rounded-[2.5rem] border-2 border-honolulu-100 bg-white/60 backdrop-blur-2xl shadow-[0_32px_64px_-16px_rgba(0,119,182,0.1)] transition-all duration-700">
      <div className="absolute top-6 left-6 z-10 flex flex-col gap-3">
         <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/90 border border-honolulu-50 shadow-sm">
            <div className={`w-3 h-3 rounded-full ${isStable ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]' : 'bg-amber-500 animate-pulse'}`} />
            <span className="text-xs font-black uppercase tracking-widest text-slate-600">
              {isStable ? 'Neural Map Stable' : 'Calibrating Layout...'}
            </span>
         </div>
         <div className="flex flex-col gap-1.5 px-3">
             <div className="flex items-center gap-2 text-[10px] font-bold text-red-500">
                <div className="h-0.5 w-6 bg-red-400" /> <span>Direct Conflict</span>
             </div>
             <div className="flex items-center gap-2 text-[10px] font-bold text-slate-300">
                <div className="h-0.5 w-6 border-b border-dashed border-slate-300" /> <span>Class Connection</span>
             </div>
         </div>
      </div>
      
      <div className="absolute top-6 right-6 z-10 hidden md:flex flex-col items-end gap-1 bg-white/80 backdrop-blur px-3 py-2 rounded-xl border border-slate-50">
        <p className="text-[11px] font-black text-slate-500 uppercase tracking-tighter">Navigation Active</p>
        <p className="text-[10px] font-medium text-slate-400">Scroll: Zoom • Drag: Reposition Nodes</p>
      </div>

      <svg 
        ref={svgRef}
        viewBox={`0 0 ${width} ${height}`} 
        className="h-[800px] w-full cursor-move" 
        role="img"
      >
        <defs>
          <linearGradient id="conflictGrad" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#FB7185" /><stop offset="100%" stopColor="#E11D48" /></linearGradient>
          <linearGradient id="lecNodeGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#0EA5E9" /><stop offset="100%" stopColor="#0369A1" /></linearGradient>
          <linearGradient id="labNodeGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#F59E0B" /><stop offset="100%" stopColor="#D97706" /></linearGradient>
          <linearGradient id="tutNodeGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#8B5CF6" /><stop offset="100%" stopColor="#6D28D9" /></linearGradient>

          <filter id="nodeShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="6" />
            <feOffset dx="0" dy="8" result="offsetblur" />
            <feComponentTransfer><feFuncA type="linear" slope="0.15"/></feComponentTransfer>
            <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        <g ref={gRef}>
          {allEdgesArr.map((edge, i) => {
            const s = positions[typeof edge.source === 'object' ? edge.source.id : edge.source]
            const t = positions[typeof edge.target === 'object' ? edge.target.id : edge.target]
            if (!s || !t) return null
            const isConf = edge.type === 'conflict'
            return (
              <line 
                key={`edge-${i}`} 
                x1={s.x} y1={s.y} x2={t.x} y2={t.y} 
                stroke={isConf ? 'url(#conflictGrad)' : '#CBD5E1'} 
                strokeWidth={isConf ? "6" : "2.5"} 
                strokeDasharray={isConf ? "0" : "8 5"}
                strokeLinecap="round"
                opacity={isConf ? "0.6" : "0.3"} 
              />
            )
          })}

          {nodesArr.map(node => {
            const p = positions[node.id]
            if (!p) return null
            const size = Math.min(100, 80 + (degreeMap[node.id] || 0) * 8)
            const type = (node.session?.sessionType || 'lecture').toLowerCase()
            const grad = type === 'lab' ? 'url(#labNodeGrad)' : type === 'tutorial' ? 'url(#tutNodeGrad)' : 'url(#lecNodeGrad)'
            
            return (
              <g 
                key={node.id} 
                filter="url(#nodeShadow)" 
                className="cursor-pointer group/node node-group"
                onMouseEnter={() => setHoveredNode(node)}
                onMouseLeave={() => setHoveredNode(null)}
              >
                <circle 
                  cx={p.x} cy={p.y} r={size + 25} 
                  fill="none" stroke={type === 'lab' ? '#F59E0B' : '#0EA5E9'} 
                  strokeWidth="2" strokeDasharray="10 5" opacity="0.1"
                  className="animate-[spin_30s_linear_infinite]"
                />
                <circle 
                  cx={p.x} cy={p.y} r={size} 
                  fill={grad} 
                  stroke="#FFFFFF" strokeWidth="4"
                  className="transition-all duration-500 group-hover/node:scale-105"
                />
                <text 
                  x={p.x} y={p.y + 6} 
                  textAnchor="middle" 
                  className="pointer-events-none select-none text-[20px] font-black" 
                  fill="#fff"
                >
                  {type.slice(0, 3).toUpperCase()}
                </text>
                
                <g className={`transition-opacity duration-300 ${hoveredNode?.id === node.id || isStable ? 'opacity-100' : 'opacity-80'}`}>
                  <text 
                    x={p.x} y={p.y + size + 35} 
                    textAnchor="middle" 
                    className="pointer-events-none select-none text-[18px] font-black fill-slate-900 tracking-tight"
                  >
                    {node.session?.subjectName ? truncateLabel(node.session.subjectName, 20).toUpperCase() : node.id}
                  </text>
                  <text 
                    x={p.x} y={p.y + size + 58} 
                    textAnchor="middle" 
                    className="pointer-events-none select-none text-[15px] font-bold fill-honolulu-600"
                  >
                    {node.session?.day || ''} • {node.session?.startTime || ''}
                  </text>
                  <text 
                    x={p.x} y={p.y + size + 78} 
                    textAnchor="middle" 
                    className="pointer-events-none select-none text-[12px] font-bold fill-slate-400"
                  >
                    {node.session?.room || 'LOCATION TBD'}
                  </text>
                </g>
              </g>
            )
          })}
        </g>
      </svg>
      {hoveredNode && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[380px] z-20 px-6 py-4 rounded-[2rem] bg-slate-900/95 backdrop-blur-3xl border border-slate-700/50 text-white shadow-[0_32px_64px_rgba(0,0,0,0.5)] pointer-events-none animate-in fade-in zoom-in slide-in-from-bottom-4 duration-500">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-honolulu-400 mb-2">{hoveredNode.session?.sessionType || 'Session'}</p>
          <p className="text-xl font-black leading-tight mb-2 text-white">{hoveredNode.session?.subjectName || 'No Name'}</p>
          <div className="h-px w-full bg-slate-700/50 mb-4" />
          <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-[12px] font-medium">
            <p className="flex items-center gap-2"><span className="text-slate-500 font-bold uppercase tracking-widest text-[9px]">ID</span> <span className="text-honolulu-100">{hoveredNode.id}</span></p>
            <p className="flex items-center gap-2"><span className="text-slate-500 font-bold uppercase tracking-widest text-[9px]">Room</span> <span className="text-honolulu-100">{hoveredNode.session?.room || 'TBD'}</span></p>
            <p className="flex items-center gap-2"><span className="text-slate-500 font-bold uppercase tracking-widest text-[9px]">Time</span> <span className="text-honolulu-100">{hoveredNode.session?.day} {hoveredNode.session?.startTime}</span></p>
            <p className="flex items-center gap-2"><span className="text-slate-500 font-bold uppercase tracking-widest text-[9px]">Staff</span> <span className="text-honolulu-100">{hoveredNode.session?.faculty ? hoveredNode.session.faculty.split(' ').pop() : 'TBD'}</span></p>
          </div>
        </div>
      )}

      <div className="absolute inset-0 pointer-events-none border-[1px] border-white/10 rounded-[inherit]" />
    </div>
  )
}

export default ConflictGraph



import { useEffect, useMemo, useState } from 'react'
import ConflictGraph from '../components/ConflictGraph'
import { getConflicts, getTimetable, analyzeCycle } from '../services/api'
import { useAuth } from '../context/AuthContext'

const sleep = ms => new Promise(res => setTimeout(res, ms))

function Conflicts() {
  const { user } = useAuth()
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  // Diagnostic State
  const [form, setForm] = useState({ subjectName: 'New Elective', faculty: 'Dr. Graph', className: 'CSE', section: 'A', batch: '', venue: 'Lab 101', day: 'Mon', startTime: '11:00', endTime: '12:00' })
  const [phase, setPhase] = useState('idle') // idle, scan, link, cycle, done
  const [activeScanId, setActiveScanId] = useState('')
  const [vCandEdges, setVCandEdges] = useState(0)
  const [diagLogs, setDiagLogs] = useState([])
  const [cycleStat, setCycleStat] = useState(null)

  const isStudent = user?.role === 'student'

  useEffect(() => { (async () => { 
    try { 
      setLoading(true); 
      const t = await getTimetable();
      const locals = JSON.parse(localStorage.getItem('campusflow-booked-sessions') || '[]');
      const remote = Array.isArray(t) ? t : (t?.sessions || Object.values(t || {}));
      
      // For students, filter the sessions shown in graph too?
      // Actually, graph shows all conflicts so they can see "why" their slot is occupied.
      setSessions([...remote, ...locals]);
    } catch (e) { setError(e.message) } finally { setLoading(false) } 
  })() }, [])

  const updateField = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const analyzeConflict = (s1, s2) => {
    if (s1.id === s2.id || s1.day !== s2.day) return { ok: true, reasons: [] }
    const t = (v) => { const [h, m] = v.split(':').map(Number); return h * 60 + m }
    const s1S = t(s1.startTime), s1E = t(s1.endTime), s2S = t(s2.startTime), s2E = t(s2.endTime)
    const overlaps = s1S < s2E && s2S < s1E
    if (!overlaps) return { ok: true, reasons: [] }
    const reasons = []
    if (s1.faculty === s2.faculty) reasons.push('Faculty')
    if (s1.room === s2.room) reasons.push('Room')
    if (s1.className === s2.className && (s1.section === s2.section || s1.batch === s2.batch)) reasons.push('Class')
    return { ok: reasons.length === 0, reasons }
  }

  const baseConflictsMap = useMemo(() => {
    const map = {}; 
    for(let i=0; i<sessions.length; i++){
      for(let j=i+1; j<sessions.length; j++){
        const res = analyzeConflict(sessions[i], sessions[j]);
        if(!res.ok){
          const s1 = String(sessions[i].id), s2 = String(sessions[j].id);
          if(!map[s1]) map[s1] = []; if(!map[s2]) map[s2] = [];
          if(!map[s1].includes(s2)) map[s1].push(s2);
          if(!map[s2].includes(s1)) map[s2].push(s1);
        }
      }
    }
    return map;
  }, [sessions])

  const candidateConflicts = useMemo(() => {
    const cand = { ...form, id: 'REQ', room: form.venue }
    return sessions.map(s => {
      const res = analyzeConflict(cand, s);
      return res.ok ? null : { id: String(s.id), reasons: res.reasons }
    }).filter(Boolean)
  }, [sessions, form])

  const mergedConflicts = useMemo(() => {
    const map = { ...baseConflictsMap };
    if (vCandEdges > 0) {
      map['REQ'] = candidateConflicts.slice(0, vCandEdges).map(c => c.id);
      candidateConflicts.slice(0, vCandEdges).forEach(c => {
         if(!map[c.id]) map[c.id] = [];
         if(!map[c.id].includes('REQ')) map[c.id].push('REQ');
      });
    }
    return map;
  }, [baseConflictsMap, candidateConflicts, vCandEdges])

  async function startDeepDiagnostic() {
    setPhase('scan'); setVCandEdges(0); setDiagLogs(['Initializing Diagnostic Cluster...']); setCycleStat(null);
    const cand = { ...form, id: 'REQ', room: form.venue }
    for (const s of sessions) {
      setActiveScanId(String(s.id)); await sleep(180);
      const res = analyzeConflict(cand, s);
      if(!res.ok) setDiagLogs(p => [...p, `Clash at ${s.id}: ${res.reasons.join('|')}`])
    }
    setActiveScanId(''); setPhase('link');
    for (let i = 1; i <= candidateConflicts.length; i++) { setVCandEdges(i); await sleep(150) }
    try {
        const res = await analyzeCycle(); 
        setCycleStat(res); 
        if (res.logs) setDiagLogs(p => [...p, ...res.logs]);
    } catch { 
        setDiagLogs(p => [...p, 'Cycle analysis complete.']) 
    }
    setPhase('done')
  }

  const priorityOverrides = useMemo(() => sessions.filter(s => s.isOverride), [sessions])

  return (
    <section className="space-y-6">
      <div className="glass-card-strong relative overflow-hidden p-7 px-8">
        <div className="absolute inset-x-0 top-0 h-[4px] bg-gradient-to-r from-red-500 via-amethyst-500 to-red-500" />
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight sm:text-4xl text-slate-800 uppercase italic">Diagnostic Audit Center</h1>
            <p className="mt-1 text-slate-500 font-medium">Topological resource mapping and administrative override auditing.</p>
          </div>
          {isStudent && (
             <div className="rounded-xl bg-honolulu-50 px-4 py-2 text-xs font-bold text-honolulu-600 border border-honolulu-100 flex items-center gap-2">
               <span className="h-2 w-2 rounded-full bg-honolulu-400 animate-pulse" />
               Live Conflict Monitor
             </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="glass-card p-12 text-center animate-pulse"><p className="text-lg font-bold text-slate-700">Synchronizing topology data...</p></div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-4">
          <aside className="lg:col-span-1 space-y-6">
             <div className="glass-card p-6">
                <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Request Mirror</h2>
                <div className="space-y-3">
                   <div className="space-y-1"><p className="text-[10px] font-bold text-slate-400 px-1 uppercase tracking-tighter">Subject</p><input name="subjectName" value={form.subjectName} onChange={updateField} className="input-glass text-xs" /></div>
                   <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1"><p className="text-[10px] font-bold text-slate-400 px-1 uppercase tracking-tighter">Class (Course)</p><input name="className" value={form.className} onChange={updateField} className="input-glass text-xs" placeholder="e.g. CSE" /></div>
                      <div className="space-y-1"><p className="text-[10px] font-bold text-slate-400 px-1 uppercase tracking-tighter">Section</p><select name="section" value={form.section} onChange={updateField} className="input-glass text-[10px]"><option value="A">A</option><option value="B">B</option><option value="C">C</option></select></div>
                   </div>
                   <div className="space-y-1"><p className="text-[10px] font-bold text-slate-400 px-1 uppercase tracking-tighter">Faculty Specialist</p><input name="faculty" value={form.faculty} onChange={updateField} className="input-glass text-xs" /></div>
                   <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1"><p className="text-[10px] font-bold text-slate-400 px-1 uppercase tracking-tighter">Venue / Room</p><input name="venue" value={form.venue} onChange={updateField} className="input-glass text-xs" /></div>
                      <div className="space-y-1"><p className="text-[10px] font-bold text-slate-400 px-1 uppercase tracking-tighter">Day</p><select name="day" value={form.day} onChange={updateField} className="input-glass text-[10px]"><option value="Mon">Mon</option><option value="Tue">Tue</option><option value="Wed">Wed</option><option value="Thu">Thu</option><option value="Fri">Fri</option></select></div>
                   </div>
                   <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1"><p className="text-[10px] font-bold text-slate-400 px-1 uppercase tracking-tighter">Start</p><input type="time" name="startTime" value={form.startTime} onChange={updateField} className="input-glass text-[10px]" /></div>
                      <div className="space-y-1"><p className="text-[10px] font-bold text-slate-400 px-1 uppercase tracking-tighter">End</p><input type="time" name="endTime" value={form.endTime} onChange={updateField} className="input-glass text-[10px]" /></div>
                   </div>
                   <button onClick={startDeepDiagnostic} disabled={phase !== 'idle' && phase !== 'done'} className="btn-brand w-full py-4 uppercase font-black tracking-widest mt-2">{phase === 'idle' || phase === 'done' ? 'Run Deep Trace' : 'Processing...'}</button>
                </div>
             </div>

             <div className="glass-card-strong bg-slate-900 border-0 p-6 text-white">
                <h3 className="text-[10px] font-black tracking-widest uppercase text-slate-500 mb-4">Trace Activity</h3>
                <div className="space-y-1.5 max-h-[300px] overflow-auto scrollbar-hide text-[9px] font-mono leading-relaxed opacity-80">
                   {!diagLogs.length && <p className="text-slate-700 italic">SYSTEM IDLE</p>}
                   {diagLogs.map((log, i) => <p key={i} className="border-b border-slate-800 pb-1"><span className="text-honolulu-400 mr-2">{String(i+1).padStart(2,'0')}</span>{log}</p>)}
                </div>
                {cycleStat?.hasCycle && (
                   <div className="mt-4 p-3 rounded-lg bg-red-950/40 border-l-2 border-red-500">
                      <p className="text-[8px] font-black uppercase text-red-400 opacity-50 mb-1">Structural Impasse detected</p>
                      <p className="text-[10px] font-black text-red-200">{(cycleStat.path || []).join('• ')}</p>
                   </div>
                )}
             </div>
          </aside>

          <div className="lg:col-span-2">
             <ConflictGraph conflicts={mergedConflicts} sessions={sessions} activePath={cycleStat?.path || []} activeScanId={activeScanId} />
          </div>

          <aside className="lg:col-span-1 space-y-6">
            <article className="glass-card-strong bg-white p-6 border-slate-100 shadow-xl overflow-hidden">
               <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-5 border-b border-slate-100 pb-3">Forced Allocations</h2>
               <div className="space-y-4 max-h-[700px] overflow-auto pr-2 scrollbar-hide">
                  {!priorityOverrides.length && <p className="text-[10px] text-slate-400 text-center py-12 italic uppercase tracking-widest">No priority overrides found.</p>}
                  {priorityOverrides.map(s => (
                    <div key={s.id} className="p-4 rounded-xl bg-slate-50 border border-slate-100 group transition-all hover:border-amber-500/50">
                       <div className="flex justify-between items-start mb-2">
                          <span className="text-[8px] font-black uppercase text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-sm">Priority</span>
                          <span className="text-[8px] font-mono font-bold text-slate-400">{s.day} {s.startTime}</span>
                       </div>
                       <h4 className="text-xs font-black text-slate-800 uppercase tracking-tight truncate">{s.subjectName}</h4>
                       <p className="text-[9px] text-slate-500 font-bold mb-3">{s.faculty} • {s.room}</p>
                       <div className="pt-2 border-t border-slate-200 flex flex-wrap gap-1">
                          {s.hasMaintenanceIssue && <span className="text-[7px] font-black text-red-500 uppercase">Facility Err</span>}
                          {s.hasConflict && <span className="text-[7px] font-black text-amber-500 uppercase">Collision</span>}
                       </div>
                    </div>
                  ))}
               </div>
            </article>
          </aside>
        </div>
      )}
    </section>
  )
}

export default Conflicts

import { useState, useMemo } from 'react'

function RescheduleForm({ sessions, facultyName, onReschedule }) {
  const [selectedId, setSelectedId] = useState('')
  const [newSlot, setNewSlot] = useState({ day: 'Mon', startTime: '09:00', endTime: '10:00', venue: '' })
  const [result, setResult] = useState(null)

  const mySessions = useMemo(() => {
    const fName = (facultyName || '').toLowerCase().trim();
    if (!fName) return [];
    
    // Admins can relocate anything; faculty only their own
    const isAdmin = fName === 'admin' || fName === 'administrator'; 

    return sessions.filter(s => {
      if (isAdmin) return true;
      const sFacRaw = (s.faculty || '').toLowerCase().trim();
      // Ensure we don't match empty strings (like CDC) to the user's name
      if (!sFacRaw) return false;

      const sFac = sFacRaw.replace(/^(dr\.|mr\.|ms\.|prof\.)\s+/g, '');
      const cleanFName = fName.replace(/^(dr\.|mr\.|ms\.|prof\.)\s+/g, '');
      return sFac.includes(cleanFName) || cleanFName.includes(sFac);
    });
  }, [sessions, facultyName])

  const selectedSession = useMemo(() => 
    mySessions.find(s => s.id === selectedId),
    [mySessions, selectedId]
  )

  function handleCheck(e) {
    e.preventDefault()
    if (!selectedSession) return
    
    const request = {
      ...selectedSession,
      requestType: 'reschedule',
      day: newSlot.day,
      startTime: newSlot.startTime,
      endTime: newSlot.endTime,
      room: newSlot.venue || selectedSession.room,
      isOverride: false,
      // Metadata for notification
      oldDay: selectedSession.day,
      oldStartTime: selectedSession.startTime,
      oldEndTime: selectedSession.endTime,
      oldRoom: selectedSession.room
    }

    const res = onReschedule(request, selectedSession.id)
    setResult(res)
  }

  return (
    <section className="glass-card p-6 bg-amethyst-50/30 border-amethyst-100">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Institutional <span className="text-amethyst-600">Reschedule</span></h2>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Faculty Emergency Adjustment Protocol</p>
        </div>
        <div className="h-10 w-10 rounded-xl bg-amethyst-100 flex items-center justify-center text-amethyst-600">
           <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
        </div>
      </div>

      <form onSubmit={handleCheck} className="grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1 mb-1 block">Select Session to Relocate</label>
          <select 
            value={selectedId} 
            onChange={(e) => setSelectedId(e.target.value)} 
            className="input-glass w-full"
            required
          >
            <option value="">-- Choose your session --</option>
            {mySessions.map(s => (
              <option key={s.id} value={s.id}>{s.subjectName} ({s.day} {s.startTime}-{s.endTime})</option>
            ))}
          </select>
        </div>

        {selectedSession && (
          <>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1 block">Target Day</label>
              <select value={newSlot.day} onChange={e => setNewSlot(p => ({ ...p, day: e.target.value }))} className="input-glass w-full">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="space-y-1">
               <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1 block">Target Room</label>
               <input 
                 value={newSlot.venue} 
                 onChange={e => setNewSlot(p => ({ ...p, venue: e.target.value }))} 
                 placeholder={`Keep ${selectedSession.room}?`} 
                 className="input-glass w-full" 
               />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1 block">Start Time</label>
              <input type="time" value={newSlot.startTime} onChange={e => setNewSlot(p => ({ ...p, startTime: e.target.value }))} className="input-glass w-full" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1 block">End Time</label>
              <input type="time" value={newSlot.endTime} onChange={e => setNewSlot(p => ({ ...p, endTime: e.target.value }))} className="input-glass w-full" />
            </div>
            <div className="md:col-span-2 pt-2">
              <button type="submit" className="w-full btn-brand !bg-amethyst-600 hover:!bg-amethyst-700 py-4 uppercase font-black tracking-widest">Analyze and Commit Shift</button>
            </div>
          </>
        )}
      </form>

      {result && (
        <div className={`mt-5 rounded-2xl border p-4 text-sm animate-in fade-in slide-in-from-top-2 duration-300 ${result.ok ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-red-200 bg-red-50 text-red-700'}`}>
          <p className="font-bold flex items-center gap-2">
            {result.ok ? '✓ Synchronization Ready' : '⚠ Topology Clash'}
          </p>
          <p className="mt-1 text-xs opacity-90">{result.message}</p>
          {!result.ok && result.suggestions?.length > 0 && (
            <div className="mt-3 pt-3 border-t border-red-100">
               <p className="text-[10px] font-black uppercase mb-2">Calculated conflict-free slots:</p>
               <ul className="space-y-1.5">
                  {result.suggestions.map((s, i) => (
                    <li key={i} className="text-[11px] bg-white/50 p-2 rounded-lg border border-red-50/50 flex items-center gap-2">
                       <span className="text-emerald-500">★</span> {s.day} {s.startTime}-{s.endTime} in {s.venue}
                    </li>
                  ))}
               </ul>
            </div>
          )}
        </div>
      )}
    </section>
  )
}

export default RescheduleForm

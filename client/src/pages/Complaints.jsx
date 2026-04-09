import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import * as api from '../services/api'

const COMPLAINT_STORAGE_KEY = 'campusflow-complaints'
const CATEGORY_HANDLERS = {
  projector: { owner: 'IT Support Cell', escalation: 'Academic Infrastructure Office', sla: '4 working hours' },
  ac: { owner: 'Facilities HVAC Team', escalation: 'Campus Maintenance Office', sla: '8 working hours' },
  electricity: { owner: 'Electrical Maintenance Team', escalation: 'Campus Maintenance Office', sla: '2 working hours' },
  internet: { owner: 'Network Operations Team', escalation: 'IT Administration', sla: '2 working hours' },
  lab_equipment: { owner: 'Lab Technician Unit', escalation: 'Head of Department', sla: '1 business day' },
  classroom_furniture: { owner: 'Facilities Civil Team', escalation: 'Campus Maintenance Office', sla: '1 business day' },
  other: { owner: 'Helpdesk Triage Desk', escalation: 'Operations Control Room', sla: '1 business day' },
}

const STATUS_STYLES = {
  Pending: 'bg-amber-50 text-amber-600 border border-amber-200',
  Resolved: 'bg-emerald-50 text-emerald-600 border border-emerald-200',
  open: 'bg-red-50 text-red-600 border border-red-200',
  'in-review': 'bg-amber-50 text-amber-600 border border-amber-200',
  assigned: 'bg-honolulu-50 text-honolulu-600 border border-honolulu-200',
  resolved: 'bg-emerald-50 text-emerald-600 border border-emerald-200',
}

function Complaints() {
  const { user } = useAuth()
  const isStudent = user?.role === 'student'
  
  const defaultForm = () => ({ role: isStudent ? 'student' : 'faculty', title: '', category: 'projector', location: '', severity: 'medium', description: '' })
  
  const [form, setForm] = useState(defaultForm())
  const [complaints, setComplaints] = useState([])
  const [backendComplaints, setBackendComplaints] = useState([])
  const [filter, setFilter] = useState('all')

  // Room Shift State
  const [sessions, setSessions] = useState([])
  const [selectedSession, setSelectedSession] = useState(null)
  const [availableRooms, setAvailableRooms] = useState([])
  const [isCheckingRooms, setIsCheckingRooms] = useState(false)

  useEffect(() => {
    loadComplaints()
    loadSessions()
  }, [])

  async function loadComplaints() {
    try {
      const data = await api.getComplaints()
      setBackendComplaints(data)
    } catch (e) { console.error("Failed to load backend complaints", e) }
    
    try {
      const c = localStorage.getItem(COMPLAINT_STORAGE_KEY)
      if (c) {
        const p = JSON.parse(c)
        if (Array.isArray(p)) setComplaints(p)
      }
    } catch { setComplaints([]) }
  }

  async function loadSessions() {
    try {
      const data = await api.getTimetable()
      setSessions(data)
    } catch (e) { console.error("Failed to load sessions", e) }
  }

  useEffect(() => { localStorage.setItem(COMPLAINT_STORAGE_KEY, JSON.stringify(complaints)) }, [complaints])

  function updateForm(e) { const { name, value } = e.target; setForm(p => ({ ...p, [name]: value })) }
  
  async function submitComplaint(e) {
    e.preventDefault()
    
    // Check if it's a room feature complaint
    const isRoomFeature = form.category === 'projector' || form.category === 'ac'
    if (isRoomFeature) {
      try {
        await api.addComplaint(form.location, form.category === 'ac' ? 'AC' : 'Projector')
        loadComplaints()
        alert("Complaint registered on server!")
      } catch (err) {
        alert(err.message || "Could not register complaint. Maybe it already exists.")
      }
    }

    const h = CATEGORY_HANDLERS[form.category] || CATEGORY_HANDLERS.other
    setComplaints(p => [{ id: `CMP-${Date.now()}`, ...form, status: 'open', ownerTeam: h.owner, escalationTeam: h.escalation, sla: h.sla, createdAt: new Date().toISOString() }, ...p])
    setForm(defaultForm())
  }

  async function checkAlternativeRooms() {
    if (!selectedSession) return
    setIsCheckingRooms(true)
    try {
      const rooms = await api.getAvailableRooms(selectedSession.day, selectedSession.startTime, selectedSession.endTime)
      setAvailableRooms(rooms)
    } catch (e) {
      alert("Error checking rooms")
    } finally {
      setIsCheckingRooms(false)
    }
  }

  async function handleResolve(item) {
    if (item.id.startsWith('COMP-')) {
      try {
        await api.resolveComplaint(item.id)
        loadComplaints()
      } catch (err) { alert("Failed to resolve on server") }
    } else {
      setComplaints(p => p.map(i => i.id === item.id ? { ...i, status: 'resolved' } : i))
    }
  }

  function updateStatus(id, s) { 
    if (isStudent) return;
    setComplaints(p => p.map(i => i.id === id ? { ...i, status: s } : i)) 
  }

  const allItems = useMemo(() => {
    const combined = [
      ...backendComplaints.map(c => ({
        id: c.id,
        title: `${c.feature} Issue in ${c.room}`,
        description: `Automatic system report: ${c.feature} is not working in ${c.room}.`,
        status: c.status,
        category: c.feature.toLowerCase(),
        location: c.room,
        role: 'system',
        severity: 'high',
        createdAt: new Date(c.createdAt).toISOString()
      })),
      ...complaints
    ]
    return combined.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt))
  }, [complaints, backendComplaints])

  const filtered = useMemo(() => filter === 'all' ? allItems : allItems.filter(i => i.status.toLowerCase() === filter.toLowerCase()), [allItems, filter])
  const stats = useMemo(() => { 
    const b = { total: allItems.length, open: 0, pending: 0, resolved: 0 }; 
    allItems.forEach(i => { 
      const s = i.status.toLowerCase()
      if (s === 'open' || s === 'pending') b.open++
      if (s === 'resolved') b.resolved++
    }); return b 
  }, [allItems])

  return (
    <section className="space-y-6">
      <article className="glass-card-strong relative overflow-hidden p-6">
        <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-amethyst-500 via-honolulu-500 to-amethyst-500" />
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
          <span className="bg-gradient-to-r from-amethyst-500 to-honolulu-500 bg-clip-text text-transparent">Complaints Center</span>
        </h1>
        <p className="mt-2 max-w-3xl text-slate-500">Students and professors can report anything not working across campus. If a room has issues, use the Room Shift Helper below to find alternatives.</p>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div className="stat-pill"><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Total Reports</p><p className="mt-2 text-2xl font-black text-slate-800">{stats.total}</p></div>
          <div className="stat-pill-danger"><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-red-500">Active Issues</p><p className="mt-2 text-2xl font-black text-slate-800">{stats.open}</p></div>
          <div className="stat-pill-success"><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-500">Resolved</p><p className="mt-2 text-2xl font-black text-slate-800">{stats.resolved}</p></div>
        </div>
      </article>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_1fr]">
        <article className="glass-card relative overflow-hidden p-6">
          <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-honolulu-500 to-amethyst-500" />
          <h2 className="text-2xl font-extrabold text-slate-800">Raise A Complaint</h2>
          <p className="mt-1 text-sm text-slate-400">Register room issues or general campus complaints here.</p>
          <form onSubmit={submitComplaint} className="mt-5 grid gap-4 md:grid-cols-2">
            {!isStudent ? (
              <label className="space-y-1.5 text-sm font-medium text-slate-600">Reporter Role<select name="role" value={form.role} onChange={updateForm} className="input-glass"><option value="professor">Faculty/Professor</option><option value="staff">Staff</option><option value="student">Student</option></select></label>
            ) : (
              <input type="hidden" name="role" value="student" />
            )}
            <label className={`space-y-1.5 text-sm font-medium text-slate-600 ${isStudent ? 'md:col-span-2' : ''}`}>Issue Category<select name="category" value={form.category} onChange={updateForm} className="input-glass"><option value="projector">Projector</option><option value="ac">AC / Cooling</option><option value="electricity">Electricity</option><option value="internet">Internet / Wi-Fi</option><option value="lab_equipment">Lab Equipment</option><option value="classroom_furniture">Classroom Furniture</option><option value="other">Other</option></select></label>
            <label className="space-y-1.5 text-sm font-medium text-slate-600 md:col-span-2">Complaint Title<input name="title" value={form.title} onChange={updateForm} required placeholder="e.g. Projector not working" className="input-glass" /></label>
            <label className="space-y-1.5 text-sm font-medium text-slate-600">Location / Room<input name="location" value={form.location} onChange={updateForm} required placeholder="e.g. Room 305" className="input-glass" /></label>
            <label className="space-y-1.5 text-sm font-medium text-slate-600">Severity<select name="severity" value={form.severity} onChange={updateForm} className="input-glass"><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="critical">Critical</option></select></label>
            <label className="space-y-1.5 text-sm font-medium text-slate-600 md:col-span-2">Description<textarea name="description" value={form.description} onChange={updateForm} rows={3} required placeholder="Describe the issue..." className="input-glass resize-none" /></label>
            <div className="md:col-span-2"><button className="btn-brand">Submit Complaint</button></div>
          </form>
        </article>

        <article className="glass-card relative overflow-hidden p-6 bg-slate-50/50">
          <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-emerald-500 to-honolulu-500" />
          <h2 className="text-2xl font-extrabold text-slate-800">Room Shift Helper</h2>
          <p className="mt-1 text-sm text-slate-400">If your assigned room is unusable, find a free classroom for your current slot.</p>
          
          <div className="mt-6 space-y-4">
            <label className="block space-y-1.5 text-sm font-medium text-slate-600">
              Select Your Current Session
              <select 
                className="input-glass"
                onChange={(e) => setSelectedSession(sessions.find(s => s.id === e.target.value))}
              >
                <option value="">-- Select Session --</option>
                {sessions.filter(s => s.faculty.toLowerCase().includes(user?.email?.split('@')[0].toLowerCase() || '')).map(s => (
                  <option key={s.id} value={s.id}>{s.subjectName} ({s.day} {s.startTime}-{s.endTime})</option>
                ))}
              </select>
            </label>

            <button 
              onClick={checkAlternativeRooms}
              disabled={!selectedSession || isCheckingRooms}
              className="w-full btn-brand py-3 !bg-emerald-600 hover:!bg-emerald-700 disabled:opacity-50"
            >
              {isCheckingRooms ? 'Analyzing Room Occupancy...' : 'Find Free Classrooms'}
            </button>

            {availableRooms.length > 0 && (
              <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-600">Available Alternative Rooms:</p>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {availableRooms.map(room => (
                    <div key={room} className="rounded-xl border border-emerald-100 bg-white p-3 text-center text-sm font-bold text-slate-700 shadow-sm">
                      {room}
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-[10px] text-slate-400 italic text-center text-balance">These rooms are currently verified as "Free" in the central timetable for the selected slot.</p>
              </div>
            )}
          </div>
        </article>
      </div>

      <article className="glass-card relative overflow-hidden p-6">
        <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-honolulu-500 via-amethyst-500 to-honolulu-500" />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-2xl font-extrabold text-slate-800">Complaint Queue</h2>
          <select value={filter} onChange={e => setFilter(e.target.value)} className="input-glass w-auto"><option value="all">All Statuses</option><option value="open">Open</option><option value="pending">Pending (Server)</option><option value="resolved">Resolved</option></select>
        </div>

        {!filtered.length && <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">No complaints matches this filter.</div>}

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {filtered.map(item => (
            <article key={item.id} className="glass-card relative overflow-hidden p-4">
              <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-honolulu-300 to-transparent" />
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-lg font-bold text-slate-800">{item.title}</h3>
                <span className={`rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${STATUS_STYLES[item.status] || STATUS_STYLES.open}`}>{item.status}</span>
              </div>
              <p className="mt-2 text-sm text-slate-500">{item.description}</p>
              <div className="mt-3 grid grid-cols-2 gap-y-1 text-[11px] text-slate-400">
                <p>Ticket: <span className="text-honolulu-600">{item.id}</span></p>
                <p>Location: <span className="text-slate-600 font-semibold">{item.location}</span></p>
                <p>Reporter: <span className="text-slate-500">{item.role}</span></p>
                <p>Category: <span className="text-slate-500 uppercase">{item.category}</span></p>
              </div>
              
              {!isStudent && item.status !== 'resolved' && item.status !== 'Resolved' && (
                <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
                  <button 
                    onClick={() => handleResolve(item)}
                    className="text-[10px] font-black uppercase tracking-widest text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100 transition-colors"
                  >
                    Mark as Resolved
                  </button>
                </div>
              )}
            </article>
          ))}
        </div>
      </article>
    </section>
  )
}

export default Complaints

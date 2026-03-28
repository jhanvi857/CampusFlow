import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext'

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
  const [filter, setFilter] = useState('all')

  useEffect(() => { try { const c = localStorage.getItem(COMPLAINT_STORAGE_KEY); if (!c) return; const p = JSON.parse(c); if (Array.isArray(p)) setComplaints(p) } catch { setComplaints([]) } }, [])
  useEffect(() => { localStorage.setItem(COMPLAINT_STORAGE_KEY, JSON.stringify(complaints)) }, [complaints])

  function updateForm(e) { const { name, value } = e.target; setForm(p => ({ ...p, [name]: value })) }
  function submitComplaint(e) {
    e.preventDefault()
    const h = CATEGORY_HANDLERS[form.category] || CATEGORY_HANDLERS.other
    setComplaints(p => [{ id: `CMP-${Date.now()}`, ...form, status: 'open', ownerTeam: h.owner, escalationTeam: h.escalation, sla: h.sla, createdAt: new Date().toISOString() }, ...p])
    setForm(defaultForm())
  }
  function updateStatus(id, s) { 
    if (isStudent) return;
    setComplaints(p => p.map(i => i.id === id ? { ...i, status: s } : i)) 
  }

  const filtered = useMemo(() => filter === 'all' ? complaints : complaints.filter(i => i.status === filter), [complaints, filter])
  const stats = useMemo(() => { const b = { total: complaints.length, open: 0, 'in-review': 0, assigned: 0, resolved: 0 }; complaints.forEach(i => { if (b[i.status] !== undefined) b[i.status]++ }); return b }, [complaints])

  return (
    <section className="space-y-6">
      <article className="glass-card-strong relative overflow-hidden p-6">
        <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-amethyst-500 via-honolulu-500 to-amethyst-500" />
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
          <span className="bg-gradient-to-r from-amethyst-500 to-honolulu-500 bg-clip-text text-transparent">Complaints Center</span>
        </h1>
        <p className="mt-2 max-w-3xl text-slate-500">Students and professors can report anything not working across campus. CampusFlow routes each complaint to the right team with suggested escalation and response SLA.</p>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <div className="stat-pill"><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Total</p><p className="mt-2 text-2xl font-black text-slate-800">{stats.total}</p></div>
          <div className="stat-pill-danger"><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-red-500">Open</p><p className="mt-2 text-2xl font-black text-slate-800">{stats.open}</p></div>
          <div className="stat-pill-warning"><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-amber-500">In Review</p><p className="mt-2 text-2xl font-black text-slate-800">{stats['in-review']}</p></div>
          <div className="stat-pill"><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-honolulu-500">Assigned</p><p className="mt-2 text-2xl font-black text-slate-800">{stats.assigned}</p></div>
          <div className="stat-pill-success"><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-500">Resolved</p><p className="mt-2 text-2xl font-black text-slate-800">{stats.resolved}</p></div>
        </div>
      </article>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_1fr]">
        <article className="glass-card relative overflow-hidden p-6">
          <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-honolulu-500 to-amethyst-500" />
          <h2 className="text-2xl font-extrabold text-slate-800">Raise A Complaint</h2>
          <p className="mt-1 text-sm text-slate-400">Attach enough details so the right team can act quickly.</p>
          <form onSubmit={submitComplaint} className="mt-5 grid gap-4 md:grid-cols-2">
            {!isStudent ? (
              <label className="space-y-1.5 text-sm font-medium text-slate-600">Reporter Role<select name="role" value={form.role} onChange={updateForm} className="input-glass"><option value="professor">Faculty/Professor</option><option value="staff">Staff</option><option value="student">Student</option></select></label>
            ) : (
              <input type="hidden" name="role" value="student" />
            )}
            <label className={`space-y-1.5 text-sm font-medium text-slate-600 ${isStudent ? 'md:col-span-2' : ''}`}>Issue Category<select name="category" value={form.category} onChange={updateForm} className="input-glass"><option value="projector">Projector</option><option value="ac">AC / Cooling</option><option value="electricity">Electricity</option><option value="internet">Internet / Wi-Fi</option><option value="lab_equipment">Lab Equipment</option><option value="classroom_furniture">Classroom Furniture</option><option value="other">Other</option></select></label>
            <label className="space-y-1.5 text-sm font-medium text-slate-600 md:col-span-2">Complaint Title<input name="title" value={form.title} onChange={updateForm} required placeholder="e.g. Projector not turning on in Room 305" className="input-glass" /></label>
            <label className="space-y-1.5 text-sm font-medium text-slate-600">Location<input name="location" value={form.location} onChange={updateForm} required placeholder="e.g. Block B, Room 305" className="input-glass" /></label>
            <label className="space-y-1.5 text-sm font-medium text-slate-600">Severity<select name="severity" value={form.severity} onChange={updateForm} className="input-glass"><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="critical">Critical</option></select></label>
            <label className="space-y-1.5 text-sm font-medium text-slate-600 md:col-span-2">Description<textarea name="description" value={form.description} onChange={updateForm} rows={4} required placeholder="Write what is not working, when it started, and how it impacts class/lab." className="input-glass resize-none" /></label>
            <div className="md:col-span-2"><button className="btn-brand">Submit Complaint</button></div>
          </form>
        </article>

        <article className="glass-card relative overflow-hidden p-6">
          <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-amethyst-500 to-honolulu-500" />
          <h2 className="text-2xl font-extrabold text-slate-800">Routing Guidance</h2>
          <p className="mt-1 text-sm text-slate-400">Not sure whom to send complaints to? Use this matrix as your default routing policy.</p>
          <div className="mt-4 space-y-2.5 text-sm">
            {Object.entries(CATEGORY_HANDLERS).map(([key, value]) => (
              <div key={key} className="rounded-xl border border-honolulu-100 bg-honolulu-50/40 p-3">
                <p className="font-bold text-honolulu-600 text-xs uppercase tracking-wider">{key.replace('_', ' ')}</p>
                <p className="text-slate-400 mt-1">Owner: <span className="text-slate-600">{value.owner}</span></p>
                <p className="text-slate-400">Escalate: <span className="text-slate-600">{value.escalation}</span></p>
                <p className="text-slate-400">Target SLA: <span className="text-amethyst-600 font-medium">{value.sla}</span></p>
              </div>
            ))}
          </div>
        </article>
      </div>

      <article className="glass-card relative overflow-hidden p-6">
        <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-honolulu-500 via-amethyst-500 to-honolulu-500" />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-2xl font-extrabold text-slate-800">Complaint Queue</h2>
          <select value={filter} onChange={e => setFilter(e.target.value)} className="input-glass w-auto"><option value="all">All Statuses</option><option value="open">Open</option><option value="in-review">In Review</option><option value="assigned">Assigned</option><option value="resolved">Resolved</option></select>
        </div>

        {!filtered.length && <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">No complaints yet. Submit one to test the workflow.</div>}

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {filtered.map(item => (
            <article key={item.id} className="glass-card relative overflow-hidden p-4">
              <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-honolulu-300 to-transparent" />
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-lg font-bold text-slate-800">{item.title}</h3>
                <span className={`rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${STATUS_STYLES[item.status]}`}>{item.status}</span>
              </div>
              <p className="mt-2 text-sm text-slate-500">{item.description}</p>
              <div className="mt-3 space-y-0.5 text-xs text-slate-400">
                <p>Ticket: <span className="text-honolulu-600">{item.id}</span></p>
                <p>{item.role} | {item.category} | <span className={item.severity === 'critical' ? 'text-red-500' : item.severity === 'high' ? 'text-amber-500' : 'text-slate-500'}>{item.severity}</span></p>
                <p>Location: <span className="text-slate-500">{item.location}</span></p>
                <p>Owner Team: <span className="text-slate-500">{item.ownerTeam}</span></p>
                <p>Escalation: <span className="text-slate-500">{item.escalationTeam}</span></p>
                <p>SLA: <span className="text-amethyst-600 font-medium">{item.sla}</span></p>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <button onClick={() => updateStatus(item.id, 'in-review')} className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-600 hover:bg-amber-100 transition-colors">Mark In Review</button>
                <button onClick={() => updateStatus(item.id, 'assigned')} className="rounded-lg border border-honolulu-200 bg-honolulu-50 px-3 py-1.5 text-xs font-semibold text-honolulu-600 hover:bg-honolulu-100 transition-colors">Assign Team</button>
                <button onClick={() => updateStatus(item.id, 'resolved')} className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-600 hover:bg-emerald-100 transition-colors">Resolve</button>
              </div>
            </article>
          ))}
        </div>
      </article>
    </section>
  )
}

export default Complaints

import { useEffect, useMemo, useState } from 'react'

const COMPLAINT_STORAGE_KEY = 'campusflow-complaints'

const CATEGORY_HANDLERS = {
  projector: {
    owner: 'IT Support Cell',
    escalation: 'Academic Infrastructure Office',
    sla: '4 working hours',
  },
  ac: {
    owner: 'Facilities HVAC Team',
    escalation: 'Campus Maintenance Office',
    sla: '8 working hours',
  },
  electricity: {
    owner: 'Electrical Maintenance Team',
    escalation: 'Campus Maintenance Office',
    sla: '2 working hours',
  },
  internet: {
    owner: 'Network Operations Team',
    escalation: 'IT Administration',
    sla: '2 working hours',
  },
  lab_equipment: {
    owner: 'Lab Technician Unit',
    escalation: 'Head of Department',
    sla: '1 business day',
  },
  classroom_furniture: {
    owner: 'Facilities Civil Team',
    escalation: 'Campus Maintenance Office',
    sla: '1 business day',
  },
  other: {
    owner: 'Helpdesk Triage Desk',
    escalation: 'Operations Control Room',
    sla: '1 business day',
  },
}

const STATUS_STYLES = {
  open: 'bg-red-50 text-red-700 border border-red-200',
  'in-review': 'bg-yellow-50 text-yellow-700 border border-yellow-200',
  assigned: 'bg-blue-50 text-blue-700 border border-blue-200',
  resolved: 'bg-green-50 text-green-700 border border-green-200',
}

function defaultForm() {
  return {
    role: 'student',
    title: '',
    category: 'projector',
    location: '',
    severity: 'medium',
    description: '',
  }
}

function Complaints() {
  const [form, setForm] = useState(defaultForm())
  const [complaints, setComplaints] = useState([])
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    try {
      const cached = localStorage.getItem(COMPLAINT_STORAGE_KEY)
      if (!cached) {
        return
      }

      const parsed = JSON.parse(cached)
      if (Array.isArray(parsed)) {
        setComplaints(parsed)
      }
    } catch {
      setComplaints([])
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(COMPLAINT_STORAGE_KEY, JSON.stringify(complaints))
  }, [complaints])

  function updateForm(event) {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  function submitComplaint(event) {
    event.preventDefault()

    const handler = CATEGORY_HANDLERS[form.category] || CATEGORY_HANDLERS.other

    const entry = {
      id: `CMP-${Date.now()}`,
      ...form,
      status: 'open',
      ownerTeam: handler.owner,
      escalationTeam: handler.escalation,
      sla: handler.sla,
      createdAt: new Date().toISOString(),
    }

    setComplaints((prev) => [entry, ...prev])
    setForm(defaultForm())
  }

  function updateStatus(id, nextStatus) {
    setComplaints((prev) => prev.map((item) => (item.id === id ? { ...item, status: nextStatus } : item)))
  }

  const filtered = useMemo(() => {
    if (filter === 'all') {
      return complaints
    }

    return complaints.filter((item) => item.status === filter)
  }, [complaints, filter])

  const stats = useMemo(() => {
    const base = { total: complaints.length, open: 0, 'in-review': 0, assigned: 0, resolved: 0 }
    complaints.forEach((item) => {
      if (base[item.status] !== undefined) {
        base[item.status] += 1
      }
    })
    return base
  }, [complaints])

  return (
    <section className="space-y-6">
      <article className="rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-panel">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">Complaints Center</h1>
        <p className="mt-2 max-w-3xl text-slate-600">
          Students and professors can report anything not working across campus. CampusFlow routes each complaint to
          the right team with suggested escalation and response SLA.
        </p>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Total</p>
            <p className="mt-2 text-2xl font-black text-slate-900">{stats.total}</p>
          </div>
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-red-700">Open</p>
            <p className="mt-2 text-2xl font-black text-red-900">{stats.open}</p>
          </div>
          <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-yellow-700">In Review</p>
            <p className="mt-2 text-2xl font-black text-yellow-900">{stats['in-review']}</p>
          </div>
          <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-blue-700">Assigned</p>
            <p className="mt-2 text-2xl font-black text-blue-900">{stats.assigned}</p>
          </div>
          <div className="rounded-2xl border border-green-200 bg-green-50 p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-green-700">Resolved</p>
            <p className="mt-2 text-2xl font-black text-green-900">{stats.resolved}</p>
          </div>
        </div>
      </article>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_1fr]">
        <article className="rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-panel">
          <h2 className="text-2xl font-extrabold text-slate-900">Raise A Complaint</h2>
          <p className="mt-1 text-sm text-slate-600">Attach enough details so the right team can act quickly.</p>

          <form onSubmit={submitComplaint} className="mt-5 grid gap-4 md:grid-cols-2">
            <label className="space-y-1 text-sm font-medium text-slate-700">
              Reporter Role
              <select
                name="role"
                value={form.role}
                onChange={updateForm}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
              >
                <option value="student">Student</option>
                <option value="professor">Professor</option>
              </select>
            </label>

            <label className="space-y-1 text-sm font-medium text-slate-700">
              Issue Category
              <select
                name="category"
                value={form.category}
                onChange={updateForm}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
              >
                <option value="projector">Projector</option>
                <option value="ac">AC / Cooling</option>
                <option value="electricity">Electricity</option>
                <option value="internet">Internet / Wi-Fi</option>
                <option value="lab_equipment">Lab Equipment</option>
                <option value="classroom_furniture">Classroom Furniture</option>
                <option value="other">Other</option>
              </select>
            </label>

            <label className="space-y-1 text-sm font-medium text-slate-700 md:col-span-2">
              Complaint Title
              <input
                name="title"
                value={form.title}
                onChange={updateForm}
                required
                placeholder="e.g. Projector not turning on in Room 305"
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
              />
            </label>

            <label className="space-y-1 text-sm font-medium text-slate-700">
              Location
              <input
                name="location"
                value={form.location}
                onChange={updateForm}
                required
                placeholder="e.g. Block B, Room 305"
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
              />
            </label>

            <label className="space-y-1 text-sm font-medium text-slate-700">
              Severity
              <select
                name="severity"
                value={form.severity}
                onChange={updateForm}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </label>

            <label className="space-y-1 text-sm font-medium text-slate-700 md:col-span-2">
              Description
              <textarea
                name="description"
                value={form.description}
                onChange={updateForm}
                rows={4}
                required
                placeholder="Write what is not working, when it started, and how it impacts class/lab."
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
              />
            </label>

            <div className="md:col-span-2">
              <button className="rounded-2xl bg-gradient-to-r from-campus-500 to-campus-800 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:scale-105">
                Submit Complaint
              </button>
            </div>
          </form>
        </article>

        <article className="rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-panel">
          <h2 className="text-2xl font-extrabold text-slate-900">Routing Guidance</h2>
          <p className="mt-1 text-sm text-slate-600">
            Not sure whom to send complaints to? Use this matrix as your default routing policy.
          </p>
          <div className="mt-4 space-y-3 text-sm">
            {Object.entries(CATEGORY_HANDLERS).map(([key, value]) => (
              <div key={key} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <p className="font-bold text-slate-900">{key.replace('_', ' ').toUpperCase()}</p>
                <p className="text-slate-600">Owner: {value.owner}</p>
                <p className="text-slate-600">Escalate: {value.escalation}</p>
                <p className="text-slate-600">Target SLA: {value.sla}</p>
              </div>
            ))}
          </div>
        </article>
      </div>

      <article className="rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-panel">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-2xl font-extrabold text-slate-900">Complaint Queue</h2>
          <select
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
          >
            <option value="all">All Statuses</option>
            <option value="open">Open</option>
            <option value="in-review">In Review</option>
            <option value="assigned">Assigned</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>

        {!filtered.length && (
          <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-600">
            No complaints yet. Submit one to test the workflow.
          </div>
        )}

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {filtered.map((item) => (
            <article key={item.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-lg font-bold text-slate-900">{item.title}</h3>
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[item.status]}`}>
                  {item.status}
                </span>
              </div>

              <p className="mt-2 text-sm text-slate-600">{item.description}</p>

              <div className="mt-3 space-y-1 text-xs text-slate-600">
                <p>Ticket: {item.id}</p>
                <p>
                  {item.role} | {item.category} | {item.severity}
                </p>
                <p>Location: {item.location}</p>
                <p>Owner Team: {item.ownerTeam}</p>
                <p>Escalation Team: {item.escalationTeam}</p>
                <p>SLA: {item.sla}</p>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  onClick={() => updateStatus(item.id, 'in-review')}
                  className="rounded-xl border border-yellow-300 bg-yellow-50 px-3 py-1.5 text-xs font-semibold text-yellow-700"
                >
                  Mark In Review
                </button>
                <button
                  onClick={() => updateStatus(item.id, 'assigned')}
                  className="rounded-xl border border-blue-300 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700"
                >
                  Assign Team
                </button>
                <button
                  onClick={() => updateStatus(item.id, 'resolved')}
                  className="rounded-xl border border-green-300 bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700"
                >
                  Resolve
                </button>
              </div>
            </article>
          ))}
        </div>
      </article>
    </section>
  )
}

export default Complaints

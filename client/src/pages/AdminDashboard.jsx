import { useEffect, useState } from 'react'
import * as api from '../services/api'
import { useAuth } from '../context/AuthContext'

const AdminDashboard = () => {
  const { user } = useAuth()
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      setLoading(true)
      const data = await api.getComplaints()
      setComplaints(data || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  async function handleResolve(id) {
    try {
      await api.resolveComplaint(id)
      loadData()
    } catch (e) {
      alert("Failed to resolve issue")
    }
  }

  if (user?.role !== 'admin') {
    return (
      <div className="p-12 text-center">
        <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
        <p className="mt-2 text-slate-500">Only authorized administrators can access this terminal.</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 py-6">
      <header className="glass-card-strong p-8 relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-[4px] bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500" />
        <h1 className="text-4xl font-black text-slate-800 tracking-tight">Admin <span className="text-emerald-600">Console</span></h1>
        <p className="mt-2 text-slate-500 font-medium italic">High-level institutional oversight and resource governance.</p>
      </header>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="glass-card p-6 flex flex-col justify-center items-center text-center">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Total Complaints</p>
          <p className="text-5xl font-black text-slate-800">{complaints.length}</p>
        </div>
        <div className="glass-card p-6 flex flex-col justify-center items-center text-center">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Pending Issues</p>
          <p className="text-5xl font-black text-emerald-600">{complaints.filter(c => c.status === 'Pending').length}</p>
        </div>
        <div className="glass-card p-6 flex flex-col justify-center items-center text-center">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Nodes Active</p>
          <p className="text-5xl font-black text-honolulu-500">Live</p>
        </div>
      </div>

      <section className="glass-card p-8">
        <h2 className="text-xl font-black text-slate-800 uppercase tracking-widest mb-6 border-b border-slate-100 pb-4">Critical Maintenance Queue</h2>
        {loading ? (
          <p className="text-slate-400 italic">Synchronizing reports...</p>
        ) : complaints.length === 0 ? (
          <p className="text-slate-400 italic py-10 text-center">No reports found in system memory.</p>
        ) : (
          <div className="space-y-4">
            {complaints.map(c => (
              <div key={c.id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 group transition-all hover:border-emerald-500/50">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-black text-slate-800 uppercase">{c.room}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${c.status === 'Pending' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                      {c.status}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-slate-500 mt-1">{c.feature} Malfunction</p>
                  <p className="text-[10px] text-slate-400 font-mono mt-1">Ref: {c.id}</p>
                </div>
                {c.status === 'Pending' && (
                  <button 
                    onClick={() => handleResolve(c.id)}
                    className="btn-brand py-2 px-6 !text-[10px] !bg-emerald-600 hover:!bg-emerald-700 shadow-xl shadow-emerald-500/20"
                  >
                    Set Resolved
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="glass-card p-8 border-dashed">
         <div className="text-center py-12">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 mb-4">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            </div>
            <h3 className="text-lg font-black text-slate-800 uppercase">Faculty Hub</h3>
            <p className="text-sm text-slate-500 mt-2 italic px-8">Administrative capability to dynamically register and manage faculty identities is currently in topological staging.</p>
            <button disabled className="mt-6 px-8 py-3 bg-slate-200 text-slate-400 rounded-xl text-xs font-black uppercase tracking-widest cursor-not-allowed">Deploy Specialist Hub</button>
         </div>
      </section>
    </div>
  )
}

export default AdminDashboard

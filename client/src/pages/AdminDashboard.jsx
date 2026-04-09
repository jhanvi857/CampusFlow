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

      <section className="glass-card p-8">
         <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
            <h2 className="text-xl font-black text-slate-800 uppercase tracking-widest">Faculty Management</h2>
            <span className="text-[10px] font-black uppercase text-honolulu-600 bg-honolulu-50 px-3 py-1 rounded-lg border border-honolulu-100">Identity Provisioning</span>
         </div>
         
         <div className="grid gap-10 lg:grid-cols-[1fr_1.5fr]">
            <form 
              onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const email = formData.get('email');
                const password = formData.get('password');
                try {
                  await api.registerFaculty({ email, password });
                  alert(`Identity created for ${email}`);
                  e.target.reset();
                } catch (err) {
                  alert(err.message || "Credential collision detected.");
                }
              }}
              className="space-y-4"
            >
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Institutional Email</label>
                  <input name="email" type="email" required placeholder="e.g. name@university.edu" className="input-glass w-full" />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Access Credentials (Password)</label>
                  <input name="password" type="password" required className="input-glass w-full" />
               </div>
               <button type="submit" className="btn-brand w-full py-4 uppercase font-black tracking-widest shadow-xl shadow-honolulu-500/20">Commit New Faculty Identity</button>
            </form>

            <div className="bg-slate-50/50 rounded-3xl p-6 border border-slate-100 flex flex-col justify-center">
               <div className="flex items-center gap-4 mb-4">
                  <div className="h-12 w-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-honolulu-600">
                     <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A10.003 10.003 0 0012 3a10.003 10.003 0 00-6.146 17.961l.053.091m0 0a10.725 10.725 0 01-3.201-4.7" /></svg>
                  </div>
                  <div>
                     <h3 className="text-sm font-black text-slate-800 uppercase">Topological Auth Bridge</h3>
                     <p className="text-[10px] text-slate-500 font-bold">Synchronizing credentials with institutional directory.</p>
                  </div>
               </div>
               <p className="text-xs text-slate-500 leading-relaxed italic">Registered faculty members gain instantaneous administrative access to the Timetable Diagnostic Center, enabling them to request extra lectures and trigger institutional broad-spectrum notifications.</p>
            </div>
         </div>
      </section>
    </div>
  )
}

export default AdminDashboard

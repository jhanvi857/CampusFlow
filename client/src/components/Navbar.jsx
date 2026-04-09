import { NavLink, useNavigate } from 'react-router-dom'
import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '../context/AuthContext'
import NotificationBell from './NotificationBell'
import { getTimetable, deleteSession } from '../services/api'

const navItems = [
  { to: '/', label: 'Home', icon: '⌂' },
  { to: '/timetable', label: 'Timetable', icon: '◫' },
  { to: '/conflicts', label: 'Conflicts', icon: '⚡' },
  { to: '/complaints', label: 'Complaints', icon: '✦' },
  { to: '/notifications', label: 'Notifications', icon: '🔔' },
  { to: '/about', label: 'About', icon: 'ℹ' },
  { to: '/admin', label: 'Admin Console', icon: '⚙' },
]

function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const filteredNavItems = useMemo(() => {
    if (user?.role === 'admin') {
      return navItems.filter(item => ['/', '/admin', '/about'].includes(item.to));
    }
    // Faculty should see everything except Admin Console
    if (user?.role === 'faculty') {
      return navItems.filter(item => item.to !== '/admin');
    }
    // Students only see certain things
    return navItems.filter(item => !['/admin'].includes(item.to));
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const [allSessions, setAllSessions] = useState([])
  const [showManager, setShowManager] = useState(false)

  const fetchManaged = async () => {
    try {
      const data = await getTimetable();
      setAllSessions(Array.isArray(data) ? data : data.sessions || []);
    } catch (e) { console.error('Failed to load sessions for manager', e) }
  }

  useEffect(() => {
    if (user?.role === 'faculty') {
      fetchManaged();
      const interval = setInterval(fetchManaged, 30000); // refresh every 30s
      return () => clearInterval(interval);
    }
  }, [user]);

  const myAdjustments = useMemo(() => {
    if (user?.role !== 'faculty') return [];
    return allSessions.filter(s => 
      (s.requestType === 'extra' || s.requestType === 'reschedule') && 
      (s.faculty || '').toLowerCase().includes((user?.name || '').toLowerCase())
    );
  }, [allSessions, user]);

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this extra session?')) return;
    try {
      await deleteSession(id);
      fetchManaged();
    } catch (e) { alert('Failed to delete: ' + e.message) }
  }

  return (
    <header className="sticky top-0 z-50 border-b border-honolulu-100/50 bg-white/70 backdrop-blur-2xl">
      <div className="mx-auto flex w-full max-w-[1380px] items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        {/* Logo */}
        <NavLink to="/" className="group flex items-center gap-3">
          <span className="relative grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-honolulu-500 to-amethyst-500 text-sm font-black text-white shadow-md shadow-honolulu-500/20 transition-transform group-hover:scale-110 overflow-hidden">
            <span className="absolute inset-0 rounded-xl bg-gradient-to-br from-amethyst-500 to-honolulu-500 opacity-0 transition-opacity group-hover:opacity-100" />
            <span className="relative z-10">CF</span>
          </span>
          <span>
            <span className="block text-lg font-extrabold tracking-tight text-slate-800">
              Campus<span className="bg-gradient-to-r from-honolulu-500 to-amethyst-500 bg-clip-text text-transparent">Flow</span>
            </span>
            <span className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-honolulu-500/50">
              Admin Interface
            </span>
          </span>
        </NavLink>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-4">
          <nav className="flex items-center gap-1 rounded-2xl border border-honolulu-100/50 bg-white/60 p-1.5 backdrop-blur-sm shadow-soft">
            {filteredNavItems.filter(i => i.to !== '/notifications').map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-r from-honolulu-500 to-amethyst-500 text-white shadow-md shadow-honolulu-500/20'
                      : 'text-slate-500 hover:bg-honolulu-50 hover:text-honolulu-700'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Adjustment Manager for Faculty */}
          {user?.role === 'faculty' && (
            <div className="relative">
              <button 
                onClick={() => setShowManager(!showManager)}
                className={`relative flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-bold transition-all ${
                  showManager ? 'border-amethyst-200 bg-amethyst-50 text-amethyst-700' : 'border-slate-100 bg-white/80 text-slate-600 hover:border-amethyst-100 hover:bg-amethyst-50/30'
                }`}
              >
                <span>⚔</span>
                My Adjustments
                {myAdjustments.length > 0 && (
                  <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-amethyst-500 text-[10px] font-black text-white outline outline-2 outline-white">
                    {myAdjustments.length}
                  </span>
                )}
              </button>

              {showManager && (
                <div className="absolute right-0 top-full mt-2 w-72 origin-top-right rounded-2xl border border-slate-100 bg-white p-2 shadow-2xl animate-in fade-in zoom-in duration-200">
                  <div className="mb-2 px-3 pt-2">
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Manage Extra Lectures</h3>
                  </div>
                  <div className="max-h-[300px] space-y-1 overflow-y-auto pr-1">
                    {myAdjustments.length > 0 ? (
                      myAdjustments.map(s => (
                        <div key={s.id} className="group relative rounded-xl border border-slate-50 bg-slate-50/50 p-3 transition-colors hover:border-amethyst-100 hover:bg-white">
                          <button 
                            onClick={() => handleDelete(s.id)}
                            className="absolute right-2 top-2 rounded-lg bg-red-50 p-1.5 text-red-500 opacity-0 transition-opacity hover:bg-red-500 hover:text-white group-hover:opacity-100 shadow-sm"
                            title="Cancel adjustment"
                          >
                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-amethyst-500">{s.day} • {s.startTime}</p>
                          <p className="text-xs font-bold text-slate-800">{s.subjectName}</p>
                          <p className="mt-0.5 text-[10px] text-slate-500">Room: {s.room} • {s.className} Sec {s.section}</p>
                        </div>
                      ))
                    ) : (
                      <div className="px-3 py-6 text-center">
                        <p className="text-xs font-medium text-slate-400">No active adjustments found.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Notification Bell */}
          {user && <NotificationBell />}

          {!user ? (
            <div className="flex items-center gap-2">
              <NavLink to="/login" className="px-4 py-2 text-sm font-bold text-slate-600 hover:text-honolulu-600 transition-colors">
                Login
              </NavLink>
              <NavLink to="/login" className="btn-brand py-2 px-5 text-sm shadow-lg shadow-honolulu-500/20">
                Get Started
              </NavLink>
            </div>
          ) : (
            <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white/80 p-1.5 pl-3 shadow-soft">
              <div className="text-right">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{user.role}</p>
                <p className="text-sm font-bold text-slate-800">{user.role === 'admin' ? 'Administrator' : user.name}</p>
              </div>
              <button 
                onClick={handleLogout}
                className="grid h-8 w-8 place-items-center rounded-lg bg-slate-50 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500"
                title="Logout"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="grid h-10 w-10 place-items-center rounded-xl border border-honolulu-100 bg-white/80 text-xl text-honolulu-600 lg:hidden"
          aria-label="Toggle menu"
        >
          {mobileOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <nav className="lg:hidden border-t border-honolulu-100/50 bg-white/90 backdrop-blur-2xl px-4 pb-4 pt-2 animate-in slide-in-from-top-4 duration-300">
          <div className="flex flex-col gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-honolulu-50 to-amethyst-50 text-honolulu-700 border border-honolulu-200'
                      : 'text-slate-500 hover:bg-honolulu-50/50 hover:text-honolulu-700'
                  }`
                }
              >
                <span className="mr-2">{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
            {user && (
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-red-500 hover:bg-red-50"
              >
                <span className="mr-2">🚪</span>
                Logout ({user.name})
              </button>
            )}
          </div>
        </nav>
      )}
    </header>
  )
}

export default Navbar

import { NavLink, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

const navItems = [
  { to: '/', label: 'Home', icon: '⌂' },
  { to: '/timetable', label: 'Timetable', icon: '◫' },
  { to: '/conflicts', label: 'Conflicts', icon: '⚡' },
  { to: '/complaints', label: 'Complaints', icon: '✦' },
  { to: '/about', label: 'About', icon: 'ℹ' },
]

function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

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
              Scheduling Intelligence
            </span>
          </span>
        </NavLink>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-4">
          <nav className="flex items-center gap-1 rounded-2xl border border-honolulu-100/50 bg-white/60 p-1.5 backdrop-blur-sm shadow-soft">
            {navItems.map((item) => (
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
                <p className="text-sm font-bold text-slate-800">{user.name}</p>
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

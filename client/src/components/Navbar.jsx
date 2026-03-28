import { NavLink } from 'react-router-dom'
import { useState } from 'react'

const navItems = [
  { to: '/', label: 'Home', icon: '⌂' },
  { to: '/timetable', label: 'Timetable', icon: '◫' },
  { to: '/conflicts', label: 'Conflicts', icon: '⚡' },
  { to: '/complaints', label: 'Complaints', icon: '✦' },
  { to: '/graph-lab', label: 'Graph Lab', icon: '◈' },
  { to: '/about', label: 'About', icon: 'ℹ' },
]

function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)

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

        {/* Mobile toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="grid h-10 w-10 place-items-center rounded-xl border border-honolulu-100 bg-white/80 text-xl text-honolulu-600 lg:hidden"
          aria-label="Toggle menu"
        >
          {mobileOpen ? '✕' : '☰'}
        </button>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-1 rounded-2xl border border-honolulu-100/50 bg-white/60 p-1.5 backdrop-blur-sm shadow-soft">
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
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <nav className="lg:hidden border-t border-honolulu-100/50 bg-white/90 backdrop-blur-2xl px-4 pb-4 pt-2 animate-in">
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
          </div>
        </nav>
      )}
    </header>
  )
}

export default Navbar

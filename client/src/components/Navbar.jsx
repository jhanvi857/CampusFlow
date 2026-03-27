import { NavLink } from 'react-router-dom'

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/timetable', label: 'Timetable' },
  { to: '/conflicts', label: 'Conflicts' },
  { to: '/complaints', label: 'Complaints' },
  { to: '/graph-lab', label: 'Graph Lab' },
  { to: '/about', label: 'About' },
]

function Navbar() {
  return (
    <header className="sticky top-0 z-30 border-b border-white/70 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-[1380px] flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <NavLink
          to="/"
          className="group flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white px-3 py-2 text-left shadow-sm"
        >
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-campus-500 to-campus-800 text-xs font-black text-white">
            CF
          </span>
          <span>
            <span className="block text-xl font-extrabold tracking-tight text-slate-900">CampusFlow</span>
            <span className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              Scheduling Intelligence
            </span>
          </span>
        </NavLink>

        <nav className="flex max-w-full flex-wrap items-center gap-2 rounded-2xl border border-slate-200/80 bg-white/90 p-1.5 shadow-panel">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `rounded-xl px-4 py-2.5 text-sm font-semibold ${
                  isActive
                    ? 'bg-gradient-to-r from-campus-500 to-campus-800 text-white shadow-md'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  )
}

export default Navbar

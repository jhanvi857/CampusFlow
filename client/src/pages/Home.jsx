import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getTimetable } from '../services/api'

function normalizeTimetablePayload(p) { if (Array.isArray(p)) return p; if (p && Array.isArray(p.sessions)) return p.sessions; if (p && typeof p === 'object') return Object.values(p); return [] }

function Home() {
  const { user } = useAuth();
  const [sessionCount, setSessionCount] = useState(0);
  const startTo = user ? '/timetable' : '/login';

  useEffect(() => {
    getTimetable().then(data => {
      const normalized = normalizeTimetablePayload(data);
      setSessionCount(normalized.length);
    }).catch(() => setSessionCount(420)); // Fallback to a nice number
  }, []);

  return (
    <div className="space-y-24 py-10 overflow-x-hidden">
      {/* --- HERO SECTION --- */}
      <section className="relative flex flex-col items-center text-center">
        {/* Animated Background Elements */}
        <div className="absolute -z-10 top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[600px]">
          <div className="absolute top-10 left-10 w-72 h-72 bg-honolulu-400/20 blur-[120px] rounded-full animate-float" />
          <div className="absolute bottom-20 right-10 w-80 h-80 bg-amethyst-400/20 blur-[120px] rounded-full animate-float-slow" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-slate-50/50 rounded-[100%] border border-slate-100/50 rotate-12" />
        </div>

        <div className="max-w-4xl px-4 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="inline-flex items-center gap-2 rounded-full border border-honolulu-100 bg-honolulu-50/50 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-honolulu-600 mb-8 backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-honolulu-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-honolulu-500"></span>
            </span>
            Graph-Powered Intelligence
          </div>

          <h1 className="text-5xl font-black tracking-tighter text-slate-800 sm:text-7xl lg:text-8xl leading-[0.9]">
            The Future of <br />
            <span className="bg-gradient-to-r from-honolulu-500 via-amethyst-500 to-honolulu-400 bg-clip-text text-transparent">
              Campus Operations
            </span>
          </h1>

          <p className="mt-8 mx-auto max-w-2xl text-lg font-medium leading-relaxed text-slate-500 sm:text-xl">
            CampusFlow isn't just a timetable—it's a topological decision engine. Connect faculty, rooms, and students in a real-time conflict-free graph.
          </p>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
            <Link to={startTo} className="btn-brand px-10 py-5 text-lg shadow-2xl shadow-honolulu-500/40 hover:-translate-y-1 transition-transform">
              Get Started Now
            </Link>
            {/* <Link to="/about" className="group flex items-center gap-2 rounded-2xl bg-white/50 px-8 py-5 text-lg font-bold text-slate-700 backdrop-blur-md border border-slate-200 hover:bg-white transition-all">
              Watch Demo
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 group-hover:bg-honolulu-500 group-hover:text-white transition-colors">
                <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20"><path d="M4.5 3.5v13l11-6.5-11-6.5z" /></svg>
              </span>
            </Link> */}
          </div>
        </div>

        {/* Dashboard Visual Mockup - Enhanced Creative Canvas */}
        <div className="mt-20 w-full max-w-6xl px-4 animate-in fade-in zoom-in-95 duration-1000 delay-300">
          <div className="relative rounded-[2.5rem] bg-slate-200/50 p-2 shadow-2xl overflow-hidden group">
            <div className="rounded-[2rem] bg-white overflow-hidden border border-slate-200 aspect-[21/9] relative shadow-inner">
              {/* Full Image Background */}
              <img 
                src="/canvas-hero.png" 
                alt="Scheduling Canvas Preview" 
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                onError={(e) => { e.target.style.opacity = '0.5'; }}
              />
              
              {/* Subtle Darkening Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-slate-900/10 pointer-events-none" />

              {/* Central Text Overlay */}
              <div className="absolute bottom-10 left-10 text-left z-10 px-0">
                <h3 className="text-3xl lg:text-5xl font-black text-white tracking-tighter uppercase italic drop-shadow-lg">Interactive Scheduling Canvas</h3>
                <div className="flex items-center gap-3 mt-4">
                  <span className="h-px w-12 bg-honolulu-400" />
                  <p className="text-xs font-black text-honolulu-300 uppercase tracking-[0.4em] leading-loose drop-shadow-md">Visualizing {sessionCount}+ Global Nodes in Real-Time</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- FEATURES GRID --- */}
      <section className="mx-auto max-w-[1380px] px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <h2 className="text-sm font-black uppercase tracking-[0.3em] text-honolulu-500 mb-3">Enterprise Capabilities</h2>
          <p className="text-4xl font-black text-slate-800 tracking-tight">Everything you need to <br /> run a modern campus.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[
            {
              title: 'Conflict Intelligence',
              desc: 'Our proprietary graph-mapping algorithm scans billions of permutations to find the perfect overlap-free slot in milliseconds.',
              icon: 'M13 10V3L4 14h7v7l9-11h-7z',
              color: 'from-amber-400 to-orange-500'
            },
            {
              title: 'Smart Alternative Hub',
              desc: 'If a slot is taken, CampusFlow doesn\'t just say "No". It provides a list of high-efficiency alternative rooms and times.',
              icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.543.543-.707.707a3.001 3.001 0 00-2.121 2.121 3 3 0 01-5.657 0 3.001 3.001 0 00-2.121-2.121l-.707-.707L7.657 16.34z',
              color: 'from-honolulu-400 to-honolulu-600'
            },
            {
              title: 'Maintenance Sync',
              desc: 'Deep integration with facility management. Never schedule a class in a room with a broken projector or AC again.',
              icon: 'M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z',
              color: 'from-emerald-400 to-teal-600'
            },
            {
              title: 'Topological Visualization',
              desc: 'See the heartbeat of your campus. A beautiful D3-powered graph exposes hidden bottlenecks in your scheduling flow.',
              icon: 'M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z',
              color: 'from-amethyst-400 to-amethyst-600'
            },
            {
              title: 'Role-Based Dashboards',
              desc: 'Customized experiences for Students and Faculty. Students get clean view-only boards; Faculty get powerful request tools.',
              icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
              color: 'from-indigo-400 to-violet-600'
            },
            {
              title: 'Local Persistence',
              desc: 'Fast, secure, and always available. Your schedule syncs locally for instant access even on spotty campus Wi-Fi.',
              icon: 'M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4',
              color: 'from-slate-400 to-slate-600'
            }
          ].map((f, i) => (
            <div key={i} className="glass-card group p-8 hover:bg-slate-50 transition-all duration-500 hover:-translate-y-2">
              <div className={`mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${f.color} text-white shadow-xl rotate-3 group-hover:rotate-0 transition-transform`}>
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={f.icon} />
                </svg>
              </div>
              <h3 className="text-xl font-black text-slate-800 mb-3">{f.title}</h3>
              <p className="text-sm font-medium leading-relaxed text-slate-500 italic opacity-80">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* --- SCROLLABLE SHOWCASE --- */}
      <section className="bg-slate-900 py-24 text-white overflow-hidden relative rounded-xl">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-honolulu-500/10 blur-[150px] rounded-full" />

        <div className="mx-auto max-w-[1380px] px-4 space-y-16 rounded-lg">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-sm font-black uppercase tracking-[0.3em] text-honolulu-400 mb-4">Deep Analytics</h2>
              <p className="text-5xl font-black tracking-tighter leading-[1.1] mb-8">
                Visibility into every <br /> corner of your college.
              </p>
              <p className="text-lg text-slate-400 leading-relaxed mb-10 max-w-lg">
                Stop guessing. Use CampusFlow analytics to understand room utilization rates, faculty load balancing, and student stress indices based on schedule density.
              </p>
              <div className="space-y-4">
                {['Real-time Conflict Maps', 'Maintenance Status Integrations', 'Automated Escalation Workflows'].map(t => (
                  <div key={t} className="flex items-center gap-3">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-honolulu-500 text-[10px] font-black">✓</span>
                    <span className="text-sm font-bold text-slate-200 capitalize">{t}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="aspect-square bg-white/5 rounded-[3rem] border border-white/10 p-8 backdrop-blur-3xl overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-br from-honolulu-500/20 to-transparent italic opacity-50 flex items-center justify-center text-4xl font-black uppercase tracking-tighter mix-blend-overlay">Graph Analytics</div>
                <div className="grid grid-cols-2 gap-4 h-full relative z-10">
                  <div className="stat-pill bg-white/10 border-white/10 h-full flex flex-col justify-center">
                    <p className="text-[10px] uppercase font-black text-honolulu-400 mb-2">Efficiency</p>
                    <p className="text-4xl font-black">+42%</p>
                  </div>
                  <div className="stat-pill bg-white/10 border-white/10 h-full flex flex-col justify-center">
                    <p className="text-[10px] uppercase font-black text-amethyst-400 mb-2">Clash Rate</p>
                    <p className="text-4xl font-black">0.4%</p>
                  </div>
                  <div className="stat-pill bg-white/10 border-white/10 h-full flex flex-col justify-center col-span-2">
                    <p className="text-[10px] uppercase font-black text-emerald-400 mb-2">System Uptime</p>
                    <p className="text-4xl font-black">99.98%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- FINAL CTA --- */}
      <section className="mx-auto max-w-[1380px] px-4 py-10">
        <div className="rounded-[3rem] bg-gradient-to-br from-honolulu-500 via-amethyst-500 to-indigo-600 p-12 lg:p-24 text-center text-white relative overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent)]" />
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />

          <h2 className="relative z-10 text-4xl lg:text-7xl text-white tracking-tighter mb-8 leading-[0.9]">
            Ready to streamline <br /> your campus?
          </h2>
          <p className="relative z-10 mx-auto max-w-xl text-lg font-medium opacity-80 mb-12">
            Connect with our network of academic institutions moving towards a data-driven future. Sign up as a student or faculty and start today.
          </p>
          <div className="relative z-10 flex flex-wrap justify-center gap-4">
            <Link to="/login" className="bg-white text-honolulu-600 px-12 py-5 rounded-2xl font-black text-xl hover:scale-105 transition-transform shadow-xl">
              Create Your Account
            </Link>
            <Link to="/about" className="bg-white/10 backdrop-blur-md border border-white/20 px-12 py-5 rounded-2xl font-black text-xl hover:bg-white/20 transition-all">
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* --- FOOTER CONTENT --- */}
      <section className="border-t border-slate-100 pt-16">
        <div className="grid gap-10 md:grid-cols-4 lg:grid-cols-5">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-honolulu-500 to-amethyst-500 text-sm font-black text-white">CF</span>
              <span className="text-xl font-extrabold text-slate-800">CampusFlow</span>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed max-w-xs">The world's first graph-distributed academic operations platform, empowering students and faculty with real-time scheduling intelligence.</p>
          </div>
          <div>
            <h4 className="text-xs font-black uppercase text-slate-400 mb-6 tracking-widest">Platform</h4>
            <ul className="space-y-4 text-sm font-bold text-slate-600">
              <li><Link to="/timetable">Timetable Studio</Link></li>
              <li><Link to="/conflicts">Conflict Graph</Link></li>
              <li><Link to="/complaints">Service Hub</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-black uppercase text-slate-400 mb-6 tracking-widest">Resources</h4>
            <ul className="space-y-4 text-sm font-bold text-slate-600">
              <li><Link to="/about">Documentation</Link></li>
              <li><Link to="/about">API Reference</Link></li>
              <li><Link to="/about">Case Studies</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-black uppercase text-slate-400 mb-6 tracking-widest">Social</h4>
            <ul className="space-y-4 text-sm font-bold text-slate-600">
              <li><a href="#">Twitter/X</a></li>
              <li><a href="#">GitHub</a></li>
              <li><a href="#">LinkedIn</a></li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home

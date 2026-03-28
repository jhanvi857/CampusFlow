import { Navigate, Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Timetable from './pages/Timetable'
import Conflicts from './pages/Conflicts'
import Complaints from './pages/Complaints'
import GraphPlayground from './pages/GraphPlayground'
import About from './pages/About'

function App() {
  return (
    <div className="relative min-h-screen overflow-x-clip">
      {/* Ambient floating orbs */}
      <div className="pointer-events-none fixed -left-32 top-20 h-[500px] w-[500px] rounded-full bg-honolulu-400/[0.06] blur-[120px] animate-float" />
      <div className="pointer-events-none fixed -right-40 top-64 h-[400px] w-[400px] rounded-full bg-amethyst-400/[0.05] blur-[100px] animate-float-slow" />
      <div className="pointer-events-none fixed left-1/3 bottom-0 h-[350px] w-[350px] rounded-full bg-honolulu-300/[0.04] blur-[80px] animate-float-slow" />

      <Navbar />
      <main className="relative z-10 mx-auto w-full max-w-[1380px] px-4 pb-16 pt-8 sm:px-6 lg:px-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/timetable" element={<Timetable />} />
          <Route path="/conflicts" element={<Conflicts />} />
          <Route path="/complaints" element={<Complaints />} />
          <Route path="/graph-lab" element={<GraphPlayground />} />
          <Route path="/about" element={<About />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-honolulu-100/60 bg-white/60 backdrop-blur-xl mt-8">
        <div className="mx-auto max-w-[1380px] px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-3">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-honolulu-500 to-amethyst-500 text-xs font-black text-white">CF</span>
              <span className="text-sm font-semibold text-honolulu-700">CampusFlow</span>
            </div>
            <p className="text-xs text-slate-400">Graph-powered academic scheduling intelligence • Built for campus operations</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App

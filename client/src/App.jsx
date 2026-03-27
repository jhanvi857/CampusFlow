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
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-campus-100/50 to-transparent" />
      <div className="pointer-events-none absolute -left-20 top-32 h-72 w-72 rounded-full bg-campus-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 top-16 h-80 w-80 rounded-full bg-campus-800/10 blur-3xl" />
      <Navbar />
      <main className="relative mx-auto w-full max-w-[1380px] px-4 pb-16 pt-10 sm:px-6 lg:px-8">
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
    </div>
  )
}

export default App

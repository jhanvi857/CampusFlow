import { useEffect, useMemo, useState } from 'react'
import SessionCard from '../components/SessionCard'
import ScheduleRequestForm from '../components/ScheduleRequestForm'
import { getTimetable } from '../services/api'

const BOOKED_SESSION_STORAGE_KEY = 'campusflow-booked-sessions'
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function toMinutes(t){if(!t||!t.includes(':'))return null;const[h,m]=t.split(':');const hh=Number(h),mm=Number(m);return Number.isNaN(hh)||Number.isNaN(mm)?null:hh*60+mm}
function toTimeLabel(m){return`${String(Math.floor(m/60)).padStart(2,'0')}:${String(m%60).padStart(2,'0')}`}
function parseLegacy(r){if(!r||typeof r!=='string')return null;const n=r.trim();const m=n.match(/^([A-Za-z]{3})-(\d{1,2})(AM|PM)$/i);if(!m)return null;let h=Number(m[2]);const s=m[3].toUpperCase();if(s==='PM'&&h!==12)h+=12;if(s==='AM'&&h===12)h=0;return{day:m[1],start:h*60,end:h*60+60}}
function getSessionWindow(s){const d=s.day,st=toMinutes(s.startTime),en=toMinutes(s.endTime);if(d&&st!==null&&en!==null)return{day:d,start:st,end:en};return parseLegacy(s.time)}
function sessionsOverlap(a,b){return a.start<b.end&&b.start<a.end}
function isSameText(a,b){return!a||!b?false:String(a).trim().toLowerCase()===String(b).trim().toLowerCase()}
function toBookableSession(f){return{id:`CF-${Date.now()}`,subjectName:f.subjectName,subjectCode:f.subjectName,courseCode:f.subjectName,faculty:f.faculty,room:f.venue,className:f.className,section:f.section,batch:f.batch,sessionType:f.sessionType,requestType:f.requestType,day:f.day,startTime:f.startTime,endTime:f.endTime,time:`${f.day} ${f.startTime}-${f.endTime}`}}

function findConflicts(c,all){const w=getSessionWindow(c);if(!w)return[];return all.filter(s=>{const e=getSessionWindow(s);if(!e||e.day!==w.day||!sessionsOverlap(w,e))return false;return isSameText(c.room,s.room)||isSameText(c.faculty,s.faculty)||(isSameText(c.className,s.className)&&isSameText(c.section,s.section))||(isSameText(c.className,s.className)&&isSameText(c.batch,s.batch))})}

function findAlternativeSlots(b,all){const bs=toMinutes(b.startTime),be=toMinutes(b.endTime);const dur=bs!==null&&be!==null&&be>bs?be-bs:60;const days=[b.day,...DAYS.filter(d=>d!==b.day)];const sug=[];for(const d of days){for(let s=480;s<=1080-dur;s+=60){const t={...b,day:d,startTime:toTimeLabel(s),endTime:toTimeLabel(s+dur)};if(!findConflicts(t,all).length)sug.push({day:d,startTime:t.startTime,endTime:t.endTime,venue:t.room});if(sug.length>=4)return sug}}return sug}

function normalizeTimetablePayload(p){if(Array.isArray(p))return p;if(p&&Array.isArray(p.sessions))return p.sessions;if(p&&typeof p==='object')return Object.values(p);return[]}

function Timetable() {
  const [sessions, setSessions] = useState([])
  const [bookedSessions, setBookedSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [dayFilter, setDayFilter] = useState('all')

  useEffect(() => { try { const c = localStorage.getItem(BOOKED_SESSION_STORAGE_KEY); if (!c) return; const p = JSON.parse(c); if (Array.isArray(p)) setBookedSessions(p) } catch { setBookedSessions([]) } }, [])
  useEffect(() => { (async () => { try { setLoading(true); setError(''); setSessions(normalizeTimetablePayload(await getTimetable())) } catch (e) { setError(e.message || 'Unable to load timetable data') } finally { setLoading(false) } })() }, [])
  useEffect(() => { localStorage.setItem(BOOKED_SESSION_STORAGE_KEY, JSON.stringify(bookedSessions)) }, [bookedSessions])

  const allSessions = useMemo(() => [...sessions, ...bookedSessions], [bookedSessions, sessions])
  const stats = useMemo(() => { const b = { total: allSessions.length, lecture: 0, lab: 0, tutorial: 0 }; allSessions.forEach(s => { const t = (s.sessionType || '').toLowerCase(); if (t === 'lecture') b.lecture++; else if (t === 'lab') b.lab++; else if (t === 'tutorial') b.tutorial++ }); return b }, [allSessions])
  const uniqueDays = useMemo(() => [...new Set(allSessions.map(s => s.day).filter(Boolean).map(String))], [allSessions])

  const filteredSessions = useMemo(() => allSessions.filter(s => {
    const tt = (s.sessionType || '').toLowerCase(), dt = (s.day || '').toLowerCase()
    const h = [s.subjectName, s.subjectCode, s.courseCode, s.faculty, s.className, s.section, s.batch, s.room].filter(Boolean).join(' ').toLowerCase()
    return (!query || h.includes(query.toLowerCase())) && (typeFilter === 'all' || tt === typeFilter) && (dayFilter === 'all' || dt === dayFilter.toLowerCase())
  }), [allSessions, dayFilter, query, typeFilter])

  function handleSlotRequest(f) {
    const c = toBookableSession(f), conflicts = findConflicts(c, allSessions)
    if (!conflicts.length) { setBookedSessions(p => [...p, c]); return { ok: true, message: 'Slot is available. Session has been booked successfully.', bookedSlot: { day: c.day, startTime: c.startTime, endTime: c.endTime, venue: c.room } } }
    return { ok: false, message: 'Requested slot is not available due to a room, faculty, or section overlap.', suggestions: findAlternativeSlots(c, allSessions) }
  }

  const content = useMemo(() => {
    if (loading) return (
      <div className="glass-card p-8 text-center">
        <div className="inline-block h-8 w-8 rounded-full border-2 border-honolulu-200 border-t-honolulu-500 animate-spin mb-3" />
        <p className="text-base font-medium text-honolulu-600">Loading timetable sessions...</p>
      </div>
    )
    if (error) return <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-sm font-medium text-red-600">{error}</div>
    if (!allSessions.length) return <div className="glass-card border-dashed p-8 text-center"><p className="text-slate-500">No timetable sessions found.</p></div>
    if (!filteredSessions.length) return <div className="glass-card border-dashed p-8 text-center"><p className="text-slate-600">No sessions match your current filters.</p><p className="mt-1 text-sm text-slate-400">Try clearing search text or selecting another type/day.</p></div>
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filteredSessions.map((s, i) => <SessionCard key={s.id || s.sessionId || `${s.course || s.courseCode || 'session'}-${i}`} session={s} />)}
      </div>
    )
  }, [allSessions, error, filteredSessions, loading])

  return (
    <section className="space-y-6">
      <div className="glass-card-strong relative overflow-hidden p-6">
        <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-honolulu-500 via-amethyst-500 to-honolulu-500" />
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
          <span className="bg-gradient-to-r from-honolulu-500 to-amethyst-500 bg-clip-text text-transparent">Timetable</span>
        </h1>
        <p className="mt-2 text-slate-500">Browse complete academic sessions with class, type, section or batch, and exact time windows.</p>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="stat-pill"><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-honolulu-500">Total Sessions</p><p className="mt-2 text-2xl font-black text-slate-800">{stats.total}</p></div>
          <div className="stat-pill-purple"><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-amethyst-500">Lectures</p><p className="mt-2 text-2xl font-black text-slate-800">{stats.lecture}</p></div>
          <div className="stat-pill"><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-honolulu-500">Labs</p><p className="mt-2 text-2xl font-black text-slate-800">{stats.lab}</p></div>
          <div className="stat-pill-purple"><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-amethyst-500">Tutorials</p><p className="mt-2 text-2xl font-black text-slate-800">{stats.tutorial}</p></div>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search by subject, faculty, class, room..." className="input-glass" />
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="input-glass"><option value="all">All Session Types</option><option value="lecture">Lecture</option><option value="lab">Lab</option><option value="tutorial">Tutorial</option></select>
          <select value={dayFilter} onChange={e => setDayFilter(e.target.value)} className="input-glass"><option value="all">All Days</option>{uniqueDays.map(d => <option key={d} value={d}>{d}</option>)}</select>
        </div>
      </div>
      <div><ScheduleRequestForm onRequest={handleSlotRequest} /></div>
      {content}
    </section>
  )
}

export default Timetable

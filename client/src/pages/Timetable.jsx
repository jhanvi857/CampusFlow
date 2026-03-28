import { useEffect, useMemo, useState } from 'react'
import SessionCard from '../components/SessionCard'
import ScheduleRequestForm from '../components/ScheduleRequestForm'
import { getSessionWindow, findConflictsForSession, toMinutes, toTimeLabel, isSameText } from '../services/conflictEngine'
import { getTimetable } from '../services/api'
import { useAuth } from '../context/AuthContext'

const BOOKED_SESSION_STORAGE_KEY = 'campusflow-booked-sessions'
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function toBookableSession(f){return{id:`CF-${Date.now()}`,subjectName:f.subjectName,subjectCode:f.subjectName,courseCode:f.subjectName,faculty:f.faculty,room:f.venue,className:f.className,section:f.section,batch:f.batch,sessionType:f.sessionType,requestType:f.requestType,day:f.day,startTime:f.startTime,endTime:f.endTime,isOverride:!!f.isOverride,time:`${f.day} ${f.startTime}-${f.endTime}`}}

function getRoomIssues(roomName, complaints) {
  if (!complaints || !Array.isArray(complaints)) return [];
  return complaints.filter(c => 
    (c.status === 'open' || c.status === 'in-review') && 
    (isSameText(c.location, roomName) || c.location.toLowerCase().includes(roomName.toLowerCase()))
  );
}

function findConflicts(c, all) {
  return findConflictsForSession(c, all);
}

function findAlternativeSlots(b, all, allRooms = [], complaints = []) {
  const bs = toMinutes(b.startTime), be = toMinutes(b.endTime);
  const dur = bs !== null && be !== null && be > bs ? be - bs : 60;
  const days = [b.day, ...DAYS.filter(d => d !== b.day)];
  const sug = [];
  
  const COLLEGE_START = 540; // 9:00 AM
  const COLLEGE_END = 1020;  // 5:00 PM
  const LUNCH_START = 780;   // 1:00 PM
  const LUNCH_END = 840;     // 2:00 PM

  for (const d of days) {
    const roomsToSearch = allRooms.length ? [b.room, ...allRooms.filter(r => r !== b.room)] : [b.room];
    for (const r of roomsToSearch) {
      if (getRoomIssues(r, complaints).length > 0) continue;
      for (let s = COLLEGE_START; s <= COLLEGE_END - dur; s += 60) {
        if (s < LUNCH_END && (s + dur) > LUNCH_START) continue;
        const t = { ...b, day: d, startTime: toTimeLabel(s), endTime: toTimeLabel(s + dur), room: r };
        if (!findConflicts(t, all).length) {
          sug.push({ day: d, startTime: t.startTime, endTime: t.endTime, venue: r });
        }
        if (sug.length >= 5) return sug;
      }
    }
  }
  return sug;
}

function normalizeTimetablePayload(p){if(Array.isArray(p))return p;if(p&&Array.isArray(p.sessions))return p.sessions;if(p&&typeof p==='object')return Object.values(p);return[]}

function Timetable() {
  const { user } = useAuth()
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

  const isStudent = user?.role === 'student'
  
  const clean = (str) => (str || '').toLowerCase().replace(/[\s.-]/g, '');

  // Filtering logic for students based on their degree, year, section, batch
  const filterByStudentDetails = (s) => {
    if (!isStudent) return true;
    
    const clean = (str) => (str || '').toLowerCase().replace(/[\s.-]/g, '');
    const sClass = clean(s.className || '');
    const sSection = clean(s.section || '');
    const sBatch = clean(s.batch || '');

    const uCourse = clean(user.course || '');
    const uSection = clean(user.section || '');
    const uBatch = clean(user.batch || '');
    const uYear = clean(user.year || '');
    const uDegree = clean(user.degree || '');

    // 1. Course Match (Primary)
    // "CSE" should match "CSE"
    const isCourseMatch = !uCourse || sClass.includes(uCourse);
    
    // 2. Section Match
    // "A" should match "a" or empty or "all"
    const isSectionMatch = !uSection || sSection === uSection || sSection === 'all' || !sSection;

    // 3. Batch Match (For Labs)
    // If student is "A1", and session is "A1" or empty
    const isBatchMatch = !uBatch || sBatch === uBatch || sBatch === 'all' || !sBatch;

    // 4. Year Match (Optional/Loose)
    // Only filter if session explicitly contains a different year
    const hasYearInfo = /\d/.test(sClass);
    const isYearMatch = !uYear || !hasYearInfo || sClass.includes(uYear);

    // 5. Degree Match (Optional/Loose)
    const hasDegreeInfo = sClass.includes('tech') || sClass.includes('diploma');
    const isDegreeMatch = !uDegree || !hasDegreeInfo || sClass.includes(uDegree);

    return isCourseMatch && isSectionMatch && isBatchMatch && isYearMatch && isDegreeMatch;
  }

  const allSessions = useMemo(() => [...sessions, ...bookedSessions], [bookedSessions, sessions])
  
  // UI Filtering logic (shared across roles)
  const uiFilter = (s) => {
    const tt = (s.sessionType || '').toLowerCase(), dt = (s.day || '').toLowerCase()
    const h = [s.subjectName, s.subjectCode, s.courseCode, s.faculty, s.className, s.section, s.batch, s.room].filter(Boolean).join(' ').toLowerCase()
    return (!query || h.includes(query.toLowerCase())) && (typeFilter === 'all' || tt === typeFilter) && (dayFilter === 'all' || dt === dayFilter.toLowerCase())
  }

  const extraLectures = useMemo(() => bookedSessions.filter(s => filterByStudentDetails(s) && uiFilter(s)), [bookedSessions, user, query, typeFilter, dayFilter])
  const regularLectures = useMemo(() => sessions.filter(s => filterByStudentDetails(s) && uiFilter(s)), [sessions, user, query, typeFilter, dayFilter])
  const filteredSessions = useMemo(() => allSessions.filter(uiFilter), [allSessions, query, typeFilter, dayFilter])

  const stats = useMemo(() => { 
    const targetSessions = isStudent ? [...extraLectures, ...regularLectures] : allSessions.filter(uiFilter);
    const b = { total: targetSessions.length, lecture: 0, lab: 0, tutorial: 0 }; 
    targetSessions.forEach(s => { 
      const t = (s.sessionType || '').toLowerCase(); 
      if (t === 'lecture') b.lecture++; 
      else if (t === 'lab') b.lab++; 
      else if (t === 'tutorial') b.tutorial++ 
    }); 
    return b 
  }, [allSessions, extraLectures, regularLectures, isStudent, query, typeFilter, dayFilter])

  const uniqueDays = useMemo(() => [...new Set(allSessions.map(s => s.day).filter(Boolean).map(String))], [allSessions])
  const uniqueRooms = useMemo(() => [...new Set(allSessions.map(s => s.room).filter(Boolean))], [allSessions])

  function handleSlotRequest(f) {
    const c = toBookableSession(f);
    const w = getSessionWindow(c);
    const complaintsStr = localStorage.getItem('campusflow-complaints');
    const complaints = complaintsStr ? JSON.parse(complaintsStr) : [];
    const roomIssues = getRoomIssues(c.room, complaints);

    if (w && (w.start < 540 || w.end > 1020)) {
      return { ok: false, message: 'Invalid time. College hours are from 09:00 AM to 05:00 PM.', suggestions: findAlternativeSlots(c, allSessions, uniqueRooms, complaints) };
    }

    const conflicts = findConflicts(c, allSessions);
    const hasIssues = roomIssues.length > 0;
    const hasClashes = conflicts.length > 0;

    if (c.isOverride) {
      const warning = hasIssues || hasClashes ? ' (Priority Override Activated)' : '';
      setBookedSessions(p => [...p, { ...c, hasConflict: hasClashes, hasMaintenanceIssue: hasIssues }]); 
      return { ok: true, message: `Administrative priority slot synchronized successfully${warning}.`, bookedSlot: { day: c.day, startTime: c.startTime, endTime: c.endTime, venue: c.room } };
    }

    if (hasIssues) {
      const issuesLine = roomIssues.map(i => `${i.category.toUpperCase()}: ${i.title}`).join(' | ');
      return { ok: false, message: `Requested room (${c.room}) has active maintenance issues: ${issuesLine}. Use Priority Override to bypass.`, suggestions: findAlternativeSlots(c, allSessions, uniqueRooms, complaints) };
    }

    if (hasClashes) {
      return { ok: false, message: 'Requested slot is not available due to a scheduling clash. Check Priority Override for urgent faculty requirements.', suggestions: findAlternativeSlots(c, allSessions, uniqueRooms, complaints) };
    }
    
    setBookedSessions(p => [...p, c]); 
    return { ok: true, message: 'Slot is available. Session has been booked successfully.', bookedSlot: { day: c.day, startTime: c.startTime, endTime: c.endTime, venue: c.room } };
  }

  if (loading) return (
    <div className="glass-card p-8 text-center">
      <div className="inline-block h-8 w-8 rounded-full border-2 border-honolulu-200 border-t-honolulu-500 animate-spin mb-3" />
      <p className="text-base font-medium text-honolulu-600">Loading timetable sessions...</p>
    </div>
  )

  if (error) return <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-sm font-medium text-red-600">{error}</div>

  return (
    <section className="space-y-6">
      <div className="glass-card-strong relative overflow-hidden p-6">
        <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-honolulu-500 via-amethyst-500 to-honolulu-500" />
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-slate-800">
              {isStudent ? (
                <span>Personalized <span className="bg-gradient-to-r from-honolulu-500 to-amethyst-500 bg-clip-text text-transparent">Timetable</span></span>
              ) : (
                <span>Academic <span className="bg-gradient-to-r from-honolulu-500 to-amethyst-500 bg-clip-text text-transparent">Timetable</span></span>
              )}
            </h1>
            <p className="mt-2 text-slate-500">
              {isStudent 
                ? `Viewing schedule for ${user.degree} ${user.course} - Year ${user.year}, Section ${user.section}`
                : 'Manage and browse complete academic sessions across all departments.'}
            </p>
          </div>
          
          <div className="flex gap-2">
            <div className="stat-pill py-2 px-4 flex flex-col items-center">
              <span className="text-[9px] font-bold uppercase tracking-widest text-honolulu-500">Sessions</span>
              <span className="text-xl font-black text-slate-800">{stats.total}</span>
            </div>
            <div className="stat-pill-purple py-2 px-4 flex flex-col items-center">
              <span className="text-[9px] font-bold uppercase tracking-widest text-amethyst-500">Lec/Lab</span>
              <span className="text-xl font-black text-slate-800">{stats.lecture + stats.lab}</span>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-3">
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search by subject, faculty, class, room..." className="input-glass" />
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="input-glass"><option value="all">All Session Types</option><option value="lecture">Lecture</option><option value="lab">Lab</option><option value="tutorial">Tutorial</option></select>
          <select value={dayFilter} onChange={e => setDayFilter(e.target.value)} className="input-glass"><option value="all">All Days</option>{uniqueDays.map(d => <option key={d} value={d}>{d}</option>)}</select>
        </div>
      </div>

      {!isStudent && (
        <div className="animate-in fade-in slide-in-from-top-4 duration-500">
          <ScheduleRequestForm onRequest={handleSlotRequest} />
        </div>
      )}

      {isStudent ? (
        <div className="space-y-8 animate-in fade-in duration-700">
          {/* Extra Lectures Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 px-1">
              <div className="h-2 w-2 rounded-full bg-amethyst-500 animate-pulse" />
              <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Extra Lectures & Adjustments</h2>
            </div>
            {extraLectures.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {extraLectures.map((s, i) => <SessionCard key={s.id || `extra-${i}`} session={s} />)}
              </div>
            ) : (
              <div className="glass-card border-dashed p-10 text-center">
                <p className="text-sm font-medium text-slate-400">No extra/alternate lectures scheduled for your batch.</p>
              </div>
            )}
          </div>

          {/* Regular Timetable Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 px-1 border-t border-slate-100 pt-8 mt-8">
              <div className="h-2 w-2 rounded-full bg-honolulu-500" />
              <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Regular Academic Board</h2>
            </div>
            {regularLectures.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {regularLectures.map((s, i) => <SessionCard key={s.id || s.sessionId || `reg-${i}`} session={s} />)}
              </div>
            ) : (
              <div className="glass-card border-dashed p-10 text-center">
                <p className="text-sm font-medium text-slate-400">No regular sessions found matching your profile.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4 animate-in fade-in duration-700">
          <div className="flex items-center gap-2 px-1">
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Master Schedule Stream</h2>
          </div>
          {filteredSessions.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filteredSessions.map((s, i) => <SessionCard key={s.id || s.sessionId || `session-${i}`} session={s} />)}
            </div>
          ) : (
            <div className="glass-card border-dashed p-10 text-center">
              <p className="text-slate-500">No sessions match your current filters.</p>
            </div>
          )}
        </div>
      )}
    </section>
  )
}

export default Timetable

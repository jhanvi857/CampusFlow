import { useEffect, useMemo, useState } from 'react'
import SessionCard from '../components/SessionCard'
import ScheduleRequestForm from '../components/ScheduleRequestForm'
import RescheduleForm from '../components/RescheduleForm'
import { getSessionWindow, findConflictsForSession, toMinutes, toTimeLabel, isSameText, normalizeDay } from '../services/conflictEngine'
import { getTimetable, deleteSession, getComplaints } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useNotifications } from '../context/NotificationContext'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function toBookableSession(f){return{id:`CF-${Date.now()}`,subjectName:f.subjectName,subjectCode:f.subjectName,courseCode:f.subjectName,faculty:f.faculty,room:f.venue,className:f.className,section:f.section,batch:f.batch,sessionType:f.sessionType,requestType:f.requestType,day:f.day,startTime:f.startTime,endTime:f.endTime,isOverride:!!f.isOverride,time:`${f.day} ${f.startTime}-${f.endTime}`}}

function getRoomIssues(roomName, complaints) {
  if (!complaints || !Array.isArray(complaints)) return [];
  return complaints.filter(c => {
    const isPending = c.status === 'open' || c.status === 'in-review' || c.status === 'Pending';
    if (!isPending) return false;

    const loc = (c.room || c.location || '').toLowerCase().trim();
    const target = roomName.toLowerCase().trim();
    return loc === target || loc.includes(target) || target.includes(loc);
  });
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
  const { sendNotification } = useNotifications()
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [dayFilter, setDayFilter] = useState('all')
  const [roomComplaints, setRoomComplaints] = useState([])
  const isFaculty = user?.role === 'faculty'
  const isStudent = user?.role === 'student'
  const isAdmin = user?.role === 'admin'
  const [showOnlyMine, setShowOnlyMine] = useState(isFaculty)

  // Removed forced query setting to prevent "locked" empty view if name differs slightly from DB
  useEffect(() => { fetchTimetable() }, [])

  async function fetchTimetable(silent = false) {
    try { 
      if (!silent) setLoading(true); 
      setError(''); 
      const [tData, cData] = await Promise.all([getTimetable(), getComplaints()]);
      setSessions(normalizeTimetablePayload(tData));
      setRoomComplaints(cData || []);
    } catch (e) { 
      setError(e.message || 'Unable to load timetable data') 
    } finally { 
      if (!silent) setLoading(false) 
    }
  }

  // Removed redundant fetchTimetable call


  const clean = (str) => (str || '').toLowerCase().replace(/[\s.-]/g, '');
  const cleanText = (str) => (str || '').toLowerCase().replace(/[\s.-]/g, '');

  // Filtering logic for students based on their degree, year, section, batch
  const filterByStudentDetails = (s) => {
    if (!isStudent) return true;
    
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

  const allSessions = useMemo(() => sessions, [sessions])
  
  // UI Filtering logic (shared across roles)
  const uiFilter = (s) => {
    const tt = (s.sessionType || '').toLowerCase(), dt = (s.day || '').toLowerCase()
    const h = [s.subjectName, s.subjectCode, s.courseCode, s.faculty, s.className, s.section, s.batch, s.room].filter(Boolean).join(' ').toLowerCase()
    const matchesSearch = !query || h.includes(query.toLowerCase())
    
    // Faculty "My Classes" toggle logic
    let matchesFaculty = true
    if (showOnlyMine && isFaculty && user?.name) {
      const cleanMyName = cleanText(user.name)
      const cleanSessionFac = cleanText(s.faculty)
      // FIX: Ensure cleanSessionFac is not empty before checking 'includes'
      matchesFaculty = cleanSessionFac && (cleanSessionFac.includes(cleanMyName) || cleanMyName.includes(cleanSessionFac))
    }

    const dtNormalized = normalizeDay(s.day).toLowerCase();
    const filterNormalized = dayFilter.toLowerCase();

    return matchesSearch && matchesFaculty && (typeFilter === 'all' || tt === typeFilter) && (dayFilter === 'all' || dtNormalized === filterNormalized)
  }

  const extraLectures = useMemo(() => sessions.filter(s => (s.requestType === 'extra' || s.requestType === 'reschedule') && filterByStudentDetails(s) && uiFilter(s)), [sessions, user, query, typeFilter, dayFilter])
  const regularLectures = useMemo(() => sessions.filter(s => (s.requestType === 'regular' || !s.requestType) && filterByStudentDetails(s) && uiFilter(s)), [sessions, user, query, typeFilter, dayFilter])
  const filteredSessions = useMemo(() => allSessions.filter(uiFilter), [allSessions, query, typeFilter, dayFilter])

  const missingInfo = isStudent && (!user.year || !user.section || !user.course);

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

  const uniqueDays = useMemo(() => [...new Set(allSessions.map(s => normalizeDay(s.day)).filter(Boolean))], [allSessions])
  const uniqueRooms = useMemo(() => [...new Set(allSessions.map(s => s.room).filter(Boolean))], [allSessions])

  function handleSlotRequest(f, originalId = null) {
    const c = toBookableSession(f);
    const w = getSessionWindow(c);
    
    // Combine local storage and backend complaints for maximum safety
    const localComplaints = JSON.parse(localStorage.getItem('campusflow-complaints') || '[]');
    const allComplaints = [...roomComplaints, ...localComplaints];
    const roomIssues = getRoomIssues(c.room, allComplaints);

    if (w && (w.start < 540 || w.end > 1020)) {
      return { ok: false, message: 'Invalid time. College hours are from 09:00 AM to 05:00 PM.', suggestions: findAlternativeSlots(c, allSessions, uniqueRooms, allComplaints) };
    }

    const conflicts = findConflicts(c, allSessions);
    const hasIssues = roomIssues.length > 0;
    const hasClashes = conflicts.length > 0;

    if (c.isOverride) {
      const warning = hasIssues || hasClashes ? ' (Priority Override Activated)' : '';
      
      sendNotification({
        type: c.requestType === 'reschedule' ? 'reschedule' : 'extra',
        faculty: c.faculty,
        subjectName: c.subjectName,
        className: c.className,
        section: c.section,
        batch: c.batch,
        oldDay: c.oldDay || '',
        oldStartTime: c.oldStartTime || '',
        oldEndTime: c.oldEndTime || '',
        oldRoom: c.oldRoom || '',
        newDay: c.day,
        newStartTime: c.startTime,
        newEndTime: c.endTime,
        newRoom: c.room
      });

      // Handle automated cancellation if this was a reschedule
      if (originalId) {
        deleteSession(originalId).then(() => fetchTimetable(true));
      } else {
        fetchTimetable(true);
      }

      return { ok: true, message: `Administrative priority slot synchronized successfully${warning}. Students have been notified.`, bookedSlot: { day: c.day, startTime: c.startTime, endTime: c.endTime, venue: c.room } };
    }

    if (hasIssues) {
      const issuesLine = roomIssues.map(i => `${(i.category || i.feature || 'Issue').toUpperCase()}: ${i.title || `${i.feature} in ${i.room}`}`).join(' | ');
      return { ok: false, message: `Requested room (${c.room}) has active maintenance issues: ${issuesLine}. Use Priority Override to bypass.`, suggestions: findAlternativeSlots(c, allSessions, uniqueRooms, allComplaints) };
    }

    if (hasClashes) {
      return { ok: false, message: 'Requested slot is not available due to a scheduling clash. Check Priority Override for urgent faculty requirements.', suggestions: findAlternativeSlots(c, allSessions, uniqueRooms, allComplaints) };
    }
    
    // Send notification to students AND trigger server-side storage
    sendNotification({
      type: c.requestType === 'reschedule' ? 'reschedule' : 'extra',
      faculty: c.faculty,
      subjectName: c.subjectName,
      className: c.className,
      section: c.section,
      batch: c.batch,
      oldDay: c.oldDay || '',
      oldStartTime: c.oldStartTime || '',
      oldEndTime: c.oldEndTime || '',
      oldRoom: c.oldRoom || '',
      newDay: c.day,
      newStartTime: c.startTime,
      newEndTime: c.endTime,
      newRoom: c.room
    });

    // Handle automated cancellation if this was a reschedule
    if (originalId) {
      deleteSession(originalId).then(() => fetchTimetable(true));
    } else {
      fetchTimetable(true);
    }

    return { ok: true, message: 'Slot is available. Session has been booked successfully. Students have been notified.', bookedSlot: { day: c.day, startTime: c.startTime, endTime: c.endTime, venue: c.room } };
  }

  async function handleDeleteSession(id) {
    const session = sessions.find(s => s.id === id);
    if (!session) return;

    // Security Check: Only assigned faculty or Admin can delete
    const isOwner = isSameText(session.faculty, user.name);
    if (!isAdmin && !isOwner) {
      alert("Permission Denied: You can only cancel your own lectures.");
      return;
    }

    const isExtra = id.startsWith('EXT-');
    const msg = isExtra 
      ? 'Are you sure you want to remove this manual adjustment?' 
      : `Institutional Action: Are you sure you want to CANCEL '${session.subjectName}'? Students will be notified.`;
    
    if (!window.confirm(msg)) return;
    try {
      await deleteSession(id);
      fetchTimetable();
    } catch (e) {
      alert('Failed to update schedule: ' + e.message);
    }
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
      {missingInfo && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in slide-in-from-top-2 duration-500">
           <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
                 <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              </div>
              <div>
                 <p className="text-sm font-black text-amber-800 uppercase tracking-tight">Identity Info Incomplete</p>
                 <p className="text-[11px] text-amber-600 font-bold">Your profile is missing Year or Section data. Showing global timetable overview.</p>
              </div>
           </div>
           <button onClick={() => window.location.href='/login'} className="px-4 py-2 bg-amber-200 text-amber-800 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-amber-300 transition-colors">Update Profile</button>
        </div>
      )}
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

        <div className="mt-6 grid gap-3 md:grid-cols-4">
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search everything..." className="input-glass" />
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="input-glass"><option value="all">All Types</option><option value="lecture">Lecture</option><option value="lab">Lab</option><option value="tutorial">Tutorial</option></select>
          <select value={dayFilter} onChange={e => setDayFilter(e.target.value)} className="input-glass"><option value="all">All Days</option>{uniqueDays.map(d => <option key={d} value={d}>{d}</option>)}</select>
          {isFaculty && (
            <button 
              onClick={() => setShowOnlyMine(!showOnlyMine)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${showOnlyMine ? 'bg-honolulu-600 text-white shadow-lg shadow-honolulu-500/30' : 'bg-white text-slate-400 border border-slate-100 hover:border-honolulu-200 hover:text-honolulu-600'}`}
            >
              {showOnlyMine ? 'Show All Classes' : 'Show My Classes Only'}
            </button>
          )}
        </div>
      </div>

      {!isStudent && (
        <div className="animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex flex-col xl:flex-row gap-6">
             <div className="flex-1">
                <ScheduleRequestForm onRequest={handleSlotRequest} />
             </div>
             {isFaculty && (
               <div className="flex-1">
                  <RescheduleForm 
                    sessions={sessions} 
                    facultyName={user.name} 
                    onReschedule={handleSlotRequest} 
                  />
               </div>
             )}
          </div>
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
                {extraLectures.map((s, i) => (
                  <SessionCard 
                    key={s.id || `extra-${i}`} 
                    session={s} 
                    onDelete={!isStudent ? handleDeleteSession : null}
                  />
                ))}
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
              {filteredSessions.map((s, i) => (
                <SessionCard 
                  key={s.id || s.sessionId || `session-${i}`} 
                  session={s} 
                  onDelete={(isAdmin || isSameText(s.faculty, user.name)) ? handleDeleteSession : null}
                />
              ))}
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

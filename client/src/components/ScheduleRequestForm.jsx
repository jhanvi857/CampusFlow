import { useMemo, useState } from 'react'

const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function ScheduleRequestForm({ onRequest }) {
  const [formData, setFormData] = useState({ subjectName: '', faculty: '', requestType: 'extra', sessionType: 'lecture', className: 'CSE', section: '', batch: '', venue: '', day: 'Mon', startTime: '09:00', endTime: '10:00', isOverride: false })
  const [result, setResult] = useState(null)
  const isTimeRangeValid = useMemo(() => formData.endTime > formData.startTime, [formData])

  function updateField(e) { 
    const { name, value, type, checked } = e.target; 
    setFormData(p => { 
      const n = { ...p, [name]: type === 'checkbox' ? checked : value }; 
      if (name === 'sessionType') { 
        if (value === 'lab') n.section = ''; else n.batch = '' 
      } 
      return n 
    }) 
  }
  function resetForm() { setFormData({ subjectName: '', faculty: '', requestType: 'extra', sessionType: 'lecture', className: 'CSE', section: '', batch: '', venue: '', day: 'Mon', startTime: '09:00', endTime: '10:00', isOverride: false }); setResult(null) }
  function submitRequest(e) { e.preventDefault(); if (!isTimeRangeValid) { setResult({ ok: false, message: 'End time must be later than start time.', suggestions: [] }); return }; const r = onRequest(formData); setResult(r); if (r.ok) setFormData(p => ({ ...p, subjectName: '' })) }

  return (
    <section className="glass-card p-6">
      <div className="mb-5">
        <h2 className="text-2xl font-extrabold tracking-tight text-slate-800">
          <span className="bg-gradient-to-r from-honolulu-500 to-amethyst-500 bg-clip-text text-transparent">Request</span> Extra/Reschedule Slot
        </h2>
        <p className="mt-1 text-sm text-slate-400">Enter session details to check availability. College hours: 09:00 AM to 05:00 PM.</p>
      </div>

      <form onSubmit={submitRequest} className="grid gap-4 md:grid-cols-2">
        <label className="space-y-1.5 text-sm font-medium text-slate-600">Subject Name<input name="subjectName" value={formData.subjectName} onChange={updateField} required className="input-glass" placeholder="e.g. Data Structures" /></label>
        <label className="space-y-1.5 text-sm font-medium text-slate-600">Faculty<input name="faculty" value={formData.faculty} onChange={updateField} required className="input-glass" placeholder="e.g. Dr. Mehta" /></label>
        <label className="space-y-1.5 text-sm font-medium text-slate-600">Class<input name="className" value={formData.className} onChange={updateField} required className="input-glass" placeholder="e.g. CSE" /></label>
        <label className="space-y-1.5 text-sm font-medium text-slate-600">Request Type<select name="requestType" value={formData.requestType} onChange={updateField} className="input-glass"><option value="extra">Extra Lecture</option><option value="reschedule">Reschedule</option></select></label>
        <label className="space-y-1.5 text-sm font-medium text-slate-600">Session Type<select name="sessionType" value={formData.sessionType} onChange={updateField} className="input-glass"><option value="lecture">Lecture</option><option value="lab">Lab</option><option value="tutorial">Tutorial</option></select></label>
        {formData.sessionType === 'lab' ? (
          <label className="space-y-1.5 text-sm font-medium text-slate-600">Batch<select name="batch" value={formData.batch} onChange={updateField} required className="input-glass"><option value="">Select Batch</option><option value="A1">A1</option><option value="A2">A2</option><option value="A3">A3</option><option value="B1">B1</option><option value="B2">B2</option></select></label>
        ) : (
          <label className="space-y-1.5 text-sm font-medium text-slate-600">Section<select name="section" value={formData.section} onChange={updateField} required className="input-glass"><option value="">Select Section</option><option value="A">A</option><option value="B">B</option><option value="C">C</option></select></label>
        )}
        <label className="space-y-1.5 text-sm font-medium text-slate-600">Room / Lab<input name="venue" value={formData.venue} onChange={updateField} required className="input-glass" placeholder="e.g. Lab-3" /></label>
        <label className="space-y-1.5 text-sm font-medium text-slate-600">Day<select name="day" value={formData.day} onChange={updateField} className="input-glass">{WEEK_DAYS.map(d => <option key={d} value={d}>{d}</option>)}</select></label>
        <div className="grid grid-cols-2 gap-3">
          <label className="space-y-1.5 text-sm font-medium text-slate-600">Start Time<input type="time" name="startTime" value={formData.startTime} onChange={updateField} min="09:00" max="17:00" required className="input-glass" /></label>
          <label className="space-y-1.5 text-sm font-medium text-slate-600">End Time<input type="time" name="endTime" value={formData.endTime} onChange={updateField} min="09:00" max="17:00" required className="input-glass" /></label>
        </div>

        <div className="md:col-span-2 pt-2">
          <label className="flex items-center gap-3 cursor-pointer group">
            <div className="relative">
              <input type="checkbox" name="isOverride" checked={formData.isOverride} onChange={updateField} className="sr-only peer" />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
            </div>
            <span className="text-sm font-bold text-slate-700 group-hover:text-red-600 transition-colors">Priority Administrative Override</span>
            <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-black uppercase tracking-widest border border-slate-200">Force Allocation</span>
          </label>
          <p className="mt-2 text-[11px] text-slate-400 italic">Caution: Bypassing health and availability checks will record this as a forced conflict for manual review.</p>
        </div>

        <div className="md:col-span-2 flex flex-wrap gap-3 pt-2">
          <button type="submit" className="btn-brand">Confirm & Synchronize Slot</button>
          <button type="button" onClick={resetForm} className="btn-secondary">Clear Request</button>
        </div>
      </form>

      {result && (
        <div className={`mt-5 rounded-2xl border p-4 text-sm ${result.ok ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-red-200 bg-red-50 text-red-700'}`}>
          <p className="font-semibold">{result.message}</p>
          {result.ok && result.bookedSlot && <p className="mt-1 text-xs opacity-80">Booked: {result.bookedSlot.day} {result.bookedSlot.startTime}-{result.bookedSlot.endTime} in {result.bookedSlot.venue}</p>}
          {!result.ok && !!result.suggestions?.length && (
            <ul className="mt-3 space-y-1 text-xs opacity-80">
              {result.suggestions.map(s => <li key={`${s.day}-${s.startTime}-${s.endTime}-${s.venue}`} className="flex items-center gap-1"><span className="text-honolulu-500">→</span>Suggestion: {s.day} {s.startTime}-{s.endTime} in {s.venue}</li>)}
            </ul>
          )}
        </div>
      )}
    </section>
  )
}

export default ScheduleRequestForm

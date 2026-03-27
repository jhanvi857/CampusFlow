import { useMemo, useState } from 'react'

const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function formatTimeLabel(timeValue) {
  if (!timeValue) {
    return '--:--'
  }

  return timeValue
}

function ScheduleRequestForm({ onRequest }) {
  const [formData, setFormData] = useState({
    subjectName: '',
    faculty: '',
    requestType: 'extra',
    sessionType: 'lecture',
    className: 'CSE',
    section: '',
    batch: '',
    venue: '',
    day: 'Mon',
    startTime: '09:00',
    endTime: '10:00',
  })
  const [result, setResult] = useState(null)

  const isTimeRangeValid = useMemo(() => formData.endTime > formData.startTime, [formData])

  function updateField(event) {
    const { name, value } = event.target
    setFormData((prev) => {
      const next = { ...prev, [name]: value }

      if (name === 'sessionType') {
        if (value === 'lab') {
          next.section = ''
        } else {
          next.batch = ''
        }
      }

      return next
    })
  }

  function resetForm() {
    setFormData({
      subjectName: '',
      faculty: '',
      requestType: 'extra',
      sessionType: 'lecture',
      className: 'CSE',
      section: '',
      batch: '',
      venue: '',
      day: 'Mon',
      startTime: '09:00',
      endTime: '10:00',
    })
    setResult(null)
  }

  function submitRequest(event) {
    event.preventDefault()

    if (!isTimeRangeValid) {
      setResult({
        ok: false,
        message: 'End time must be later than start time.',
        suggestions: [],
      })
      return
    }

    const requestResult = onRequest(formData)
    setResult(requestResult)

    if (requestResult.ok) {
      setFormData((prev) => ({
        ...prev,
        subjectName: '',
      }))
    }
  }

  return (
    <section className="rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-panel">
      <div className="mb-5">
        <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">Request Extra/Reschedule Slot</h2>
        <p className="mt-1 text-sm text-slate-600">
          Enter complete session details to check availability, book if free, or get alternatives.
        </p>
      </div>

      <form onSubmit={submitRequest} className="grid gap-4 md:grid-cols-2">
        <label className="space-y-1 text-sm font-medium text-slate-700">
          Subject Name
          <input
            name="subjectName"
            value={formData.subjectName}
            onChange={updateField}
            required
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm focus:border-campus-500 focus:outline-none"
            placeholder="e.g. Data Structures"
          />
        </label>

        <label className="space-y-1 text-sm font-medium text-slate-700">
          Faculty
          <input
            name="faculty"
            value={formData.faculty}
            onChange={updateField}
            required
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm focus:border-campus-500 focus:outline-none"
            placeholder="e.g. Dr. Mehta"
          />
        </label>

        <label className="space-y-1 text-sm font-medium text-slate-700">
          Class
          <input
            name="className"
            value={formData.className}
            onChange={updateField}
            required
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm focus:border-campus-500 focus:outline-none"
            placeholder="e.g. CSE"
          />
        </label>

        <label className="space-y-1 text-sm font-medium text-slate-700">
          Request Type
          <select
            name="requestType"
            value={formData.requestType}
            onChange={updateField}
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm focus:border-campus-500 focus:outline-none"
          >
            <option value="extra">Extra Lecture</option>
            <option value="reschedule">Reschedule</option>
          </select>
        </label>

        <label className="space-y-1 text-sm font-medium text-slate-700">
          Session Type
          <select
            name="sessionType"
            value={formData.sessionType}
            onChange={updateField}
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm focus:border-campus-500 focus:outline-none"
          >
            <option value="lecture">Lecture</option>
            <option value="lab">Lab</option>
            <option value="tutorial">Tutorial</option>
          </select>
        </label>

        {formData.sessionType === 'lab' ? (
          <label className="space-y-1 text-sm font-medium text-slate-700">
            Batch
            <select
              name="batch"
              value={formData.batch}
              onChange={updateField}
              required
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm focus:border-campus-500 focus:outline-none"
            >
              <option value="">Select Batch</option>
              <option value="A1">A1</option>
              <option value="A2">A2</option>
              <option value="A3">A3</option>
              <option value="B1">B1</option>
              <option value="B2">B2</option>
            </select>
          </label>
        ) : (
          <label className="space-y-1 text-sm font-medium text-slate-700">
            Section
            <select
              name="section"
              value={formData.section}
              onChange={updateField}
              required
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm focus:border-campus-500 focus:outline-none"
            >
              <option value="">Select Section</option>
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
            </select>
          </label>
        )}

        <label className="space-y-1 text-sm font-medium text-slate-700">
          Room / Lab
          <input
            name="venue"
            value={formData.venue}
            onChange={updateField}
            required
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm focus:border-campus-500 focus:outline-none"
            placeholder="e.g. Lab-3"
          />
        </label>

        <label className="space-y-1 text-sm font-medium text-slate-700">
          Day
          <select
            name="day"
            value={formData.day}
            onChange={updateField}
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm focus:border-campus-500 focus:outline-none"
          >
            {WEEK_DAYS.map((day) => (
              <option key={day} value={day}>
                {day}
              </option>
            ))}
          </select>
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="space-y-1 text-sm font-medium text-slate-700">
            Start Time
            <input
              type="time"
              name="startTime"
              value={formData.startTime}
              onChange={updateField}
              required
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm focus:border-campus-500 focus:outline-none"
            />
          </label>
          <label className="space-y-1 text-sm font-medium text-slate-700">
            End Time
            <input
              type="time"
              name="endTime"
              value={formData.endTime}
              onChange={updateField}
              required
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm focus:border-campus-500 focus:outline-none"
            />
          </label>
        </div>

        <div className="md:col-span-2 flex flex-wrap gap-3 pt-2">
          <button
            type="submit"
            className="rounded-2xl bg-gradient-to-r from-campus-500 to-campus-800 px-5 py-2.5 text-sm font-semibold text-white shadow-lg hover:scale-105"
          >
            Check & Book Slot
          </button>
          <button
            type="button"
            onClick={resetForm}
            className="rounded-2xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:border-campus-500 hover:text-campus-700"
          >
            Reset
          </button>
        </div>
      </form>

      {result && (
        <div
          className={`mt-5 rounded-2xl border p-4 text-sm ${
            result.ok
              ? 'border-green-200 bg-green-50 text-green-800'
              : 'border-red-200 bg-red-50 text-red-800'
          }`}
        >
          <p className="font-semibold">{result.message}</p>
          {result.ok && result.bookedSlot && (
            <p className="mt-1 text-xs">
              Booked: {result.bookedSlot.day} {formatTimeLabel(result.bookedSlot.startTime)}-
              {formatTimeLabel(result.bookedSlot.endTime)} in {result.bookedSlot.venue}
            </p>
          )}
          {!result.ok && !!result.suggestions?.length && (
            <ul className="mt-3 space-y-1 text-xs">
              {result.suggestions.map((suggestion) => (
                <li key={`${suggestion.day}-${suggestion.startTime}-${suggestion.endTime}`}>
                  Suggestion: {suggestion.day} {suggestion.startTime}-{suggestion.endTime} in{' '}
                  {suggestion.venue}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  )
}

export default ScheduleRequestForm

const BASE_URL = '/api'

async function fetchJSON(endpoint, options = {}) {
  let response

  try {
    response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    })
  } catch {
    throw new Error('Unable to reach backend. Ensure server is running on http://localhost:8080')
  }

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`)
  }

  return response.json()
}

export async function login(credentials) {
  return fetchJSON('/login', {
    method: 'POST',
    body: JSON.stringify(credentials)
  })
}

export async function getTimetable() {
  return fetchJSON('/timetable')
}

export async function getConflicts() {
  return fetchJSON('/conflicts')
}

export async function analyzeCycle() {
  // Currently analyzes the entire registered state on backend
  return fetchJSON('/analyze-cycle')
}

// ── Notification APIs ──

export async function getNotifications() {
  return fetchJSON('/notifications')
}

export async function createNotification(data) {
  return fetchJSON('/notifications', {
    method: 'POST',
    body: JSON.stringify(data)
  })
}

export async function markNotificationRead(id) {
  return fetchJSON('/notifications/read', {
    method: 'POST',
    body: JSON.stringify({ id })
  })
}

export async function markAllNotificationsRead() {
  return fetchJSON('/notifications/read-all', {
    method: 'POST',
    body: JSON.stringify({})
  })
}

export async function deleteSession(id) {
  return fetchJSON('/sessions/delete', {
    method: 'POST',
    body: JSON.stringify({ id })
  })
}

// ── Complaint & Room APIs ──

export async function getComplaints() {
  return fetchJSON('/complaints')
}

export async function addComplaint(room, feature) {
  return fetchJSON('/complaints/add', {
    method: 'POST',
    body: JSON.stringify({ room, feature })
  })
}

export async function resolveComplaint(id) {
  return fetchJSON('/complaints/resolve', {
    method: 'POST',
    body: JSON.stringify({ id })
  })
}

export async function getAvailableRooms(day, startTime, endTime) {
  return fetchJSON('/rooms/available', {
    method: 'POST',
    body: JSON.stringify({ day, startTime, endTime })
  })
}

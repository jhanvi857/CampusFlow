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

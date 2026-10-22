import { apiRequest } from './apiClient'

const EVENTS_CACHE_KEY =
  'eventmateBackendEvents'

function cacheEvents(events) {
  localStorage.setItem(
    EVENTS_CACHE_KEY,
    JSON.stringify(events),
  )
}

export function getCachedEvents() {
  try {
    const events = JSON.parse(
      localStorage.getItem(
        EVENTS_CACHE_KEY,
      ) || '[]',
    )

    return Array.isArray(events)
      ? events
      : []
  } catch {
    return []
  }
}

export async function getEvents(filters = {}) {
  const searchParams = new URLSearchParams()

  if (filters.city) {
    searchParams.set('city', filters.city)
  }

  if (filters.search) {
    searchParams.set('search', filters.search)
  }

  const query = searchParams.toString()

  const data = await apiRequest(
    `/events${query ? `?${query}` : ''}`,
  )

  cacheEvents(data.events)

  return data.events
}

export async function getEventById(eventId) {
  const data = await apiRequest(
    `/events/${eventId}`,
  )

  return data.event
}

export async function saveEventAttendance(
  eventId,
  status,
) {
  const data = await apiRequest(
    `/events/${eventId}/attendance`,
    {
      method: 'POST',
      body: JSON.stringify({
        status,
      }),
    },
  )

  return data.attendance
}
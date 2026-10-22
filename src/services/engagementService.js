import {
  getCachedEvents,
} from './eventsService'
import {
  getCachedMatchedConnections,
} from './connectionsService'

const INTERESTED_EVENTS_KEY =
  'eventmateInterestedEvents'

const CONNECTION_STATUS_KEY =
  'eventmateConnectionStatuses'

const defaultConnectionStatuses = {
  'person-2': 'matched',
  'person-5': 'matched',
}

function readStorage(key, fallback) {
  try {
    const storedValue = JSON.parse(
      localStorage.getItem(key) || 'null',
    )

    return storedValue ?? fallback
  } catch {
    return fallback
  }
}

function notifyEngagementChange() {
  window.dispatchEvent(
    new Event('eventmate-engagement-updated'),
  )
}

/* ---------- Event Interest ---------- */

export function getInterestedEventIds() {
  return readStorage(
    INTERESTED_EVENTS_KEY,
    [],
  )
}

export function isInterestedInEvent(eventId) {
  return getInterestedEventIds().includes(
    eventId,
  )
}

export function toggleEventInterest(eventId) {
  const currentIds =
    getInterestedEventIds()

  const updatedIds =
    currentIds.includes(eventId)
      ? currentIds.filter(
          (id) => id !== eventId,
        )
      : [...currentIds, eventId]

  // BACKEND LATER:
  // Replace this with a create/delete
  // event-interest API request.
  localStorage.setItem(
    INTERESTED_EVENTS_KEY,
    JSON.stringify(updatedIds),
  )

  notifyEngagementChange()

  return updatedIds
}

export function removeEventInterest(
  eventId,
) {
  const updatedIds =
    getInterestedEventIds().filter(
      (id) => id !== eventId,
    )

  localStorage.setItem(
    INTERESTED_EVENTS_KEY,
    JSON.stringify(updatedIds),
  )

  notifyEngagementChange()

  return updatedIds
}

export function getSelectedEvents() {
  const interestedIds =
    getInterestedEventIds()

  return getCachedEvents().filter(
    (event) =>
      interestedIds.includes(event.id),
  )
}

/* ---------- Connections ---------- */

export function getConnectionStatuses() {
  const savedStatuses = readStorage(
    CONNECTION_STATUS_KEY,
    {},
  )

  return {
    ...defaultConnectionStatuses,
    ...savedStatuses,
  }
}

export function getConnectionStatus(
  personId,
) {
  return (
    getConnectionStatuses()[personId] ??
    'none'
  )
}

export function sendConnectionRequest(
  personId,
) {
  const statuses =
    getConnectionStatuses()

  // Do not replace an existing pending or
  // matched connection status.
  if (statuses[personId]) {
    return statuses[personId]
  }

  const updatedStatuses = {
    ...statuses,
    [personId]: 'pending',
  }


  localStorage.setItem(
    CONNECTION_STATUS_KEY,
    JSON.stringify(updatedStatuses),
  )

  notifyEngagementChange()

  return 'pending'
}

// This function must be outside
// sendConnectionRequest().
export function cancelConnectionRequest(
  personId,
) {
  const savedStatuses = readStorage(
    CONNECTION_STATUS_KEY,
    {},
  )

  const updatedStatuses = {
    ...savedStatuses,
  }

  delete updatedStatuses[personId]

  localStorage.setItem(
    CONNECTION_STATUS_KEY,
    JSON.stringify(updatedStatuses),
  )

  notifyEngagementChange()

  return 'none'
}

export function getMatchedConnections() {
  return getCachedMatchedConnections()
}
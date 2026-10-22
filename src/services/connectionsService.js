import { apiRequest } from './apiClient'
import {
  getCurrentUserId,
} from './profileService'
import {
  getInitials,
} from '../utils/profileUtils'

const PEOPLE_CACHE_KEY =
  'eventmateBackendPeople'

const MATCH_CACHE_KEY =
  'eventmateBackendMatches'

const PAGE_SIZE = 4

function readCache(key) {
  try {
    const value = JSON.parse(
      localStorage.getItem(key) || '[]',
    )

    return Array.isArray(value) ? value : []
  } catch {
    return []
  }
}

function adaptPerson(user, details = {}) {
  return {
    id: user.id,
    displayName: user.displayName,
    initials: getInitials(user.displayName),
    avatarUrl:
      user.photoURL || user.avatarUrl || '',
    bio: user.bio || '',
    location: user.location || '',
    interests: Array.isArray(user.interests)
      ? user.interests
      : [],
    distanceMiles:
      details.distanceMiles ?? 0,
    mutualCount:
      details.sharedInterests?.length ?? 0,
    attendingEventIds:
      details.sharedEventIds ?? [],
  }
}

function cachePeople(people) {
  const current = readCache(
    PEOPLE_CACHE_KEY,
  )

  const peopleById = new Map(
    current.map((person) => [
      person.id,
      person,
    ]),
  )

  people.forEach((person) => {
    peopleById.set(person.id, person)
  })

  localStorage.setItem(
    PEOPLE_CACHE_KEY,
    JSON.stringify(
      Array.from(peopleById.values()),
    ),
  )
}

function statusForMatch(match) {
  if (!match) {
    return 'none'
  }

  if (match.status === 'accepted') {
    return 'matched'
  }

  return match.requestedBy ===
    getCurrentUserId()
    ? 'pending'
    : 'incoming'
}

export async function getConnectionRecommendations({
  eventId,
  page,
}) {
  const data = await apiRequest(
    '/matches/recommendations',
  )

  const recommendations =
    data.recommendations.map(
      (recommendation) => ({
        person: adaptPerson(
          recommendation.user,
          recommendation,
        ),
        sharedInterests:
          recommendation.sharedInterests,
        sharedEventIds:
          recommendation.sharedEventIds,
        match: recommendation.match,
      }),
    )

  cachePeople(
    recommendations.map(
      (recommendation) =>
        recommendation.person,
    ),
  )

  const statuses = {}
  const matchIds = {}

  recommendations.forEach(
    (recommendation) => {
      statuses[recommendation.person.id] =
        statusForMatch(
          recommendation.match,
        )

      if (recommendation.match) {
        matchIds[
          recommendation.person.id
        ] = recommendation.match.id
      }
    },
  )

  const attendees = recommendations.filter(
    (recommendation) =>
      recommendation.sharedEventIds.includes(
        eventId,
      ),
  )

  const attendeeIds = new Set(
    attendees.map(
      (recommendation) =>
        recommendation.person.id,
    ),
  )

  const mutuals = recommendations.filter(
    (recommendation) =>
      recommendation.sharedInterests.length >
      0 &&
      !attendeeIds.has(
        recommendation.person.id,
      ),
  )

  const displayedIds = new Set([
    ...attendees.map(
      (recommendation) =>
        recommendation.person.id,
    ),
    ...mutuals.map(
      (recommendation) =>
        recommendation.person.id,
    ),
  ])

  const nearby = recommendations.filter(
    (recommendation) =>
      !displayedIds.has(
        recommendation.person.id,
      ),
  )

  const start = page * PAGE_SIZE
  const end = start + PAGE_SIZE

  return {
    attendees: attendees
      .slice(start, end)
      .map((item) => item.person),

    mutuals: mutuals
      .slice(start, end)
      .map((item) => item.person),

    nearby: nearby
      .slice(start, end)
      .map((item) => item.person),

    statuses,
    matchIds,

    hasMore:
      end < attendees.length ||
      end < mutuals.length ||
      end < nearby.length,

    nextPage: page + 1,
  }
}

export async function getMatches() {
  const data = await apiRequest('/matches')

  const matches = data.matches.map(
    (match) => ({
      id: match.id,
      status: match.status,
      direction: match.direction,
      person: adaptPerson(
        match.otherUser,
      ),
    }),
  )

  cachePeople(
    matches.map((match) => match.person),
  )

  localStorage.setItem(
    MATCH_CACHE_KEY,
    JSON.stringify(matches),
  )

  window.dispatchEvent(
    new Event('eventmate-engagement-updated'),
  )

  return matches
}

export function getCachedMatchedConnections() {
  return readCache(MATCH_CACHE_KEY)
    .filter(
      (match) =>
        match.status === 'accepted',
    )
    .map((match) => match.person)
}

export async function requestConnection(
  personId,
) {
  const data = await apiRequest(
    '/matches/request',
    {
      method: 'POST',
      body: JSON.stringify({
        receiverId: personId,
      }),
    },
  )

  return data.match
}

export async function acceptConnection(
  matchId,
) {
  const data = await apiRequest(
    `/matches/${matchId}/accept`,
    {
      method: 'POST',
    },
  )

  return data.match
}

export async function cancelConnection(
  matchId,
) {
  await apiRequest(`/matches/${matchId}`, {
    method: 'DELETE',
  })
}

export async function getPersonById(
  personId,
) {
  return (
    readCache(PEOPLE_CACHE_KEY).find(
      (person) =>
        person.id === personId,
    ) ?? null
  )
}
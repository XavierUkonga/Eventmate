import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'

import Navigation from '../components/dashboard_components/Navigation'
import ConnectionSection from '../components/dashboard_components/ConnectionSection'
import FriendsSidebar from '../components/dashboard_components/FriendsSidebar'

import {
  acceptConnection,
  cancelConnection,
  getConnectionRecommendations,
  getMatches,
  requestConnection,
} from '../services/connectionsService'

import {
  getEvents,
} from '../services/eventsService'

const emptyRecommendations = {
  attendees: [],
  mutuals: [],
  nearby: [],
}

function mergePeople(current, additions) {
  const peopleById = new Map(
    current.map((person) => [
      person.id,
      person,
    ]),
  )

  additions.forEach((person) => {
    peopleById.set(person.id, person)
  })

  return Array.from(peopleById.values())
}

export default function ConnectionsPage() {
  const [events, setEvents] = useState([])
  const [eventId, setEventId] = useState('')

  const [radiusMiles, setRadiusMiles] =
    useState(15)

  const [
    recommendations,
    setRecommendations,
  ] = useState(emptyRecommendations)

  const [
    connectionStatuses,
    setConnectionStatuses,
  ] = useState({})

  const [matchIds, setMatchIds] =
    useState({})

  const [friends, setFriends] =
    useState([])

  const [
    updatingPersonIds,
    setUpdatingPersonIds,
  ] = useState([])

  const [page, setPage] = useState(0)
  const [loading, setLoading] =
    useState(false)

  const [initializing, setInitializing] =
    useState(true)

  const [hasMore, setHasMore] =
    useState(true)

  const [error, setError] = useState('')

  const observerRef = useRef(null)
  const loadingRef = useRef(false)
  const requestIdRef = useRef(0)

  async function refreshMatches() {
    const matches = await getMatches()

    const statuses = {}
    const ids = {}

    matches.forEach((match) => {
      ids[match.person.id] = match.id

      if (match.status === 'accepted') {
        statuses[match.person.id] =
          'matched'
      } else if (
        match.direction === 'incoming'
      ) {
        statuses[match.person.id] =
          'incoming'
      } else {
        statuses[match.person.id] =
          'pending'
      }
    })

    setConnectionStatuses((current) => ({
      ...current,
      ...statuses,
    }))

    setMatchIds((current) => ({
      ...current,
      ...ids,
    }))

    setFriends(
      matches
        .filter(
          (match) =>
            match.status === 'accepted',
        )
        .map((match) => match.person),
    )
  }

  useEffect(() => {
    let cancelled = false

    async function initializePage() {
      try {
        setInitializing(true)
        setError('')

        const [eventData] =
          await Promise.all([
            getEvents({
              city: 'Atlanta',
            }),
            refreshMatches(),
          ])

        if (!cancelled) {
          setEvents(eventData)

          setEventId(
            eventData[0]?.id || '',
          )
        }
      } catch (requestError) {
        if (!cancelled) {
          setError(requestError.message)
        }
      } finally {
        if (!cancelled) {
          setInitializing(false)
        }
      }
    }

    initializePage()

    return () => {
      cancelled = true
    }
  }, [])

  const loadRecommendations = useCallback(
    async (pageToLoad, replace = false) => {
      if (
        !eventId ||
        (!replace && loadingRef.current)
      ) {
        return
      }

      const requestId =
        requestIdRef.current + 1

      requestIdRef.current = requestId
      loadingRef.current = true

      try {
        setLoading(true)
        setError('')

        const result =
          await getConnectionRecommendations({
            eventId,
            radiusMiles,
            page: pageToLoad,
          })

        if (
          requestId !==
          requestIdRef.current
        ) {
          return
        }

        setRecommendations((current) => ({
          attendees: replace
            ? result.attendees
            : mergePeople(
                current.attendees,
                result.attendees,
              ),

          mutuals: replace
            ? result.mutuals
            : mergePeople(
                current.mutuals,
                result.mutuals,
              ),

          nearby: replace
            ? result.nearby
            : mergePeople(
                current.nearby,
                result.nearby,
              ),
        }))

        setConnectionStatuses(
          (current) => ({
            ...current,
            ...result.statuses,
          }),
        )

        setMatchIds((current) => ({
          ...current,
          ...result.matchIds,
        }))

        setPage(result.nextPage)
        setHasMore(result.hasMore)
      } catch (requestError) {
        if (
          requestId ===
          requestIdRef.current
        ) {
          setError(requestError.message)
        }
      } finally {
        if (
          requestId ===
          requestIdRef.current
        ) {
          loadingRef.current = false
          setLoading(false)
        }
      }
    },
    [eventId, radiusMiles],
  )

  useEffect(() => {
    if (!eventId) {
      return
    }

    const timerId = window.setTimeout(
      () => {
        loadRecommendations(0, true)
      },
      0,
    )

    return () => {
      window.clearTimeout(timerId)
    }
  }, [eventId, loadRecommendations])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          hasMore &&
          !loading
        ) {
          loadRecommendations(page)
        }
      },
      {
        rootMargin: '300px',
      },
    )

    const marker = observerRef.current

    if (marker) {
      observer.observe(marker)
    }

    return () => {
      observer.disconnect()
    }
  }, [
    hasMore,
    loading,
    page,
    loadRecommendations,
  ])

  function resetRecommendations() {
    setRecommendations(
      emptyRecommendations,
    )

    setPage(0)
    setHasMore(true)
  }

  function handleEventChange(event) {
    resetRecommendations()
    setEventId(event.target.value)
  }

  function handleRadiusChange(event) {
    resetRecommendations()

    setRadiusMiles(
      Number(event.target.value),
    )
  }

  function beginUpdating(personId) {
    setUpdatingPersonIds((current) => [
      ...current,
      personId,
    ])
  }

  function finishUpdating(personId) {
    setUpdatingPersonIds((current) =>
      current.filter(
        (id) => id !== personId,
      ),
    )
  }

  async function handleConnect(personId) {
    beginUpdating(personId)
    setError('')

    try {
      const match =
        await requestConnection(personId)

      setMatchIds((current) => ({
        ...current,
        [personId]: match.id,
      }))

      setConnectionStatuses(
        (current) => ({
          ...current,
          [personId]:
            match.status === 'accepted'
              ? 'matched'
              : 'pending',
        }),
      )

      await refreshMatches()
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      finishUpdating(personId)
    }
  }

  async function handleAccept(personId) {
    const matchId = matchIds[personId]

    if (!matchId) {
      setError(
        'Unable to locate this connection request.',
      )
      return
    }

    beginUpdating(personId)
    setError('')

    try {
      await acceptConnection(matchId)

      setConnectionStatuses(
        (current) => ({
          ...current,
          [personId]: 'matched',
        }),
      )

      await refreshMatches()
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      finishUpdating(personId)
    }
  }

  async function handleCancel(personId) {
    const matchId = matchIds[personId]

    if (!matchId) {
      setError(
        'Unable to locate this connection request.',
      )
      return
    }

    beginUpdating(personId)
    setError('')

    try {
      await cancelConnection(matchId)

      setConnectionStatuses(
        (current) => ({
          ...current,
          [personId]: 'none',
        }),
      )

      setMatchIds((current) => {
        const updated = {
          ...current,
        }

        delete updated[personId]

        return updated
      })

      await refreshMatches()
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      finishUpdating(personId)
    }
  }

  function connectionStatusFor(personId) {
    return (
      connectionStatuses[personId] ||
      'none'
    )
  }

  function openChat(personId) {
    window.dispatchEvent(
      new CustomEvent(
        'eventmate-open-chat',
        {
          detail: {
            personId,
          },
        },
      ),
    )
  }

  const friendIds = new Set(
    friends.map((friend) => friend.id),
  )

  function withoutFriends(people) {
    return people.filter(
      (person) =>
        !friendIds.has(person.id),
    )
  }

  const displayedRecommendations = [
    ...recommendations.attendees,
    ...recommendations.mutuals,
    ...recommendations.nearby,
  ]

  return (
    <div className="min-h-screen bg-gray-100">
      <Navigation />

      <main className="mx-auto max-w-7xl px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Discover connections
          </h1>

          <p className="mt-1 text-gray-600">
            Meet people who share your interests
            or selected events.
          </p>
        </header>

        <div className="grid items-start gap-8 lg:grid-cols-[260px_minmax(0,1fr)]">
          <FriendsSidebar
            friends={friends}
            onMessage={openChat}
          />

          <div className="min-w-0">
            <section className="mb-10 grid gap-5 rounded-xl border bg-white p-5 shadow-sm md:grid-cols-2">
              <label>
                <span className="mb-2 block font-semibold">
                  Selected event
                </span>

                <select
                  className="w-full rounded-lg border p-3 text-gray-900"
                  value={eventId}
                  disabled={initializing}
                  onChange={handleEventChange}
                >
                  {events.map((event) => (
                    <option
                      key={event.id}
                      value={event.id}
                    >
                      {event.title}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span className="mb-2 block font-semibold">
                  Preferred radius:{' '}
                  {radiusMiles} miles
                </span>

                <input
                  className="w-full accent-violet-600"
                  type="range"
                  min="1"
                  max="50"
                  value={radiusMiles}
                  onChange={
                    handleRadiusChange
                  }
                />

                <p className="mt-1 text-xs text-gray-500">
                  The backend does not calculate
                  geographic distance yet.
                </p>
              </label>
            </section>

            {error && (
              <p
                className="mb-6 rounded-lg bg-red-50 p-4 text-red-700"
                role="alert"
              >
                {error}
              </p>
            )}

            {initializing ? (
              <p className="py-12 text-center text-gray-500">
                Loading connections...
              </p>
            ) : (
              <div className="space-y-12">
                <ConnectionSection
                  title="Going to this event"
                  description="People interested in an event you also selected."
                  people={withoutFriends(
                    recommendations.attendees,
                  )}
                  getReason={() =>
                    'Shared event'
                  }
                  selectedEventId={eventId}
                  getConnectionStatus={
                    connectionStatusFor
                  }
                  updatingPersonIds={
                    updatingPersonIds
                  }
                  onConnect={handleConnect}
                  onCancel={handleCancel}
                  onAccept={handleAccept}
                />

                <ConnectionSection
                  title="People with shared interests"
                  description="People whose interests overlap with yours."
                  people={withoutFriends(
                    recommendations.mutuals,
                  )}
                  getReason={(person) =>
                    `${person.mutualCount} shared ${
                      person.mutualCount === 1
                        ? 'interest'
                        : 'interests'
                    }`
                  }
                  selectedEventId={eventId}
                  getConnectionStatus={
                    connectionStatusFor
                  }
                  updatingPersonIds={
                    updatingPersonIds
                  }
                  onConnect={handleConnect}
                  onCancel={handleCancel}
                  onAccept={handleAccept}
                />

                <ConnectionSection
                  title="Other connections"
                  description="Existing requests that do not currently share an event or interest."
                  people={withoutFriends(
                    recommendations.nearby,
                  )}
                  getReason={() =>
                    'Existing connection request'
                  }
                  selectedEventId={eventId}
                  getConnectionStatus={
                    connectionStatusFor
                  }
                  updatingPersonIds={
                    updatingPersonIds
                  }
                  onConnect={handleConnect}
                  onCancel={handleCancel}
                  onAccept={handleAccept}
                />

                {!loading &&
                  displayedRecommendations
                    .length === 0 && (
                    <div className="rounded-xl border bg-white p-10 text-center text-gray-500">
                      <h2 className="font-semibold text-gray-900">
                        No recommendations yet
                      </h2>

                      <p className="mt-2">
                        Register another account and
                        give both accounts at least one
                        matching interest.
                      </p>
                    </div>
                  )}
              </div>
            )}

            <div
              ref={observerRef}
              className="h-10"
              aria-hidden="true"
            />

            {loading && (
              <p className="py-8 text-center text-gray-500">
                Loading people...
              </p>
            )}

            {!loading &&
              !hasMore &&
              displayedRecommendations.length >
                0 && (
                <p className="py-8 text-center text-gray-500">
                  You have reached the end of the
                  recommendations.
                </p>
              )}
          </div>
        </div>
      </main>
    </div>
  )
}
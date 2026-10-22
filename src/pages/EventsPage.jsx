import {
  useEffect,
  useMemo,
  useState,
} from 'react'
import Navigation from '../components/dashboard_components/Navigation'
import EventCard from '../components/dashboard_components/EventCard'
import {
  getEvents,
  saveEventAttendance,
} from '../services/eventsService'
import {
  getInterestedEventIds,
  toggleEventInterest,
} from '../services/engagementService'

export default function EventsPage() {
  const [events, setEvents] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] =
    useState(true)

  const [error, setError] = useState('')
  const [actionError, setActionError] =
    useState('')

  const [
    interestedEventIds,
    setInterestedEventIds,
  ] = useState(getInterestedEventIds)

  const [
    updatingEventIds,
    setUpdatingEventIds,
  ] = useState([])

  useEffect(() => {
    let requestCancelled = false

    async function loadEvents() {
      try {
        setLoading(true)
        setError('')

        const eventData = await getEvents({
          city: 'Atlanta',
        })

        if (!requestCancelled) {
          setEvents(eventData)
        }
      } catch (requestError) {
        if (!requestCancelled) {
          setError(requestError.message)
        }
      } finally {
        if (!requestCancelled) {
          setLoading(false)
        }
      }
    }

    loadEvents()

    return () => {
      requestCancelled = true
    }
  }, [])

  useEffect(() => {
    function refreshInterests() {
      setInterestedEventIds(
        getInterestedEventIds(),
      )
    }

    window.addEventListener(
      'eventmate-engagement-updated',
      refreshInterests,
    )

    window.addEventListener(
      'storage',
      refreshInterests,
    )

    return () => {
      window.removeEventListener(
        'eventmate-engagement-updated',
        refreshInterests,
      )

      window.removeEventListener(
        'storage',
        refreshInterests,
      )
    }
  }, [])

  async function handleToggleInterest(
    eventId,
  ) {
    const currentlyInterested =
      interestedEventIds.includes(eventId)

    setActionError('')

    setUpdatingEventIds((current) => [
      ...current,
      eventId,
    ])

    try {
      await saveEventAttendance(
        eventId,
        currentlyInterested
          ? 'not_interested'
          : 'interested',
      )

      const updatedIds =
        toggleEventInterest(eventId)

      setInterestedEventIds(updatedIds)
    } catch (requestError) {
      setActionError(requestError.message)
    } finally {
      setUpdatingEventIds((current) =>
        current.filter(
          (id) => id !== eventId,
        ),
      )
    }
  }

  const visibleEvents = useMemo(() => {
    const normalizedSearch =
      search.trim().toLowerCase()

    if (!normalizedSearch) {
      return events
    }

    return events.filter((event) => {
      return (
        event.title
          .toLowerCase()
          .includes(normalizedSearch) ||
        event.category
          .toLowerCase()
          .includes(normalizedSearch) ||
        event.venue
          .toLowerCase()
          .includes(normalizedSearch)
      )
    })
  }, [events, search])

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      <main className="mx-auto max-w-7xl px-5 py-8">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Events near Atlanta
            </h1>

            <p className="mt-1 text-gray-600">
              Discover events happening in your
              area.
            </p>
          </div>

          <label className="w-full sm:max-w-sm">
            <span className="sr-only">
              Search events
            </span>

            <input
              className="w-full rounded-full border border-gray-300 px-5 py-3 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
              type="search"
              placeholder="Search events..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
            />
          </label>
        </div>

        {actionError && (
          <p
            className="mb-6 rounded-lg bg-red-50 p-4 text-red-700"
            role="alert"
          >
            {actionError}
          </p>
        )}

        {loading && (
          <p className="py-16 text-center text-gray-500">
            Loading local events...
          </p>
        )}

        {error && (
          <p
            className="rounded-lg bg-red-50 p-4 text-red-700"
            role="alert"
          >
            {error}
          </p>
        )}

        {!loading &&
          !error &&
          visibleEvents.length === 0 && (
            <p className="py-16 text-center text-gray-500">
              No matching events were found.
            </p>
          )}

        {!loading &&
          !error &&
          visibleEvents.length > 0 && (
            <section
              className="grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              aria-label="Local events"
            >
              {visibleEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  interested={interestedEventIds.includes(
                    event.id,
                  )}
                  updating={updatingEventIds.includes(
                    event.id,
                  )}
                  onToggleInterest={
                    handleToggleInterest
                  }
                />
              ))}
            </section>
          )}
      </main>
    </div>
  )
}
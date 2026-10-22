import {
  useEffect,
  useState,
} from 'react'
import {
  NavLink,
  useParams,
} from 'react-router-dom'
import Navigation from '../components/dashboard_components/Navigation'
import {
  getEventById,
  saveEventAttendance,
} from '../services/eventsService'
import {
  getInterestedEventIds,
  toggleEventInterest,
} from '../services/engagementService'

function formatDate(dateString) {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(dateString))
}

function formatPrice(priceCents) {
  if (priceCents === 0) {
    return 'Free'
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(priceCents / 100)
}

export default function EventDetailsPage() {
  const { eventId } = useParams()

  const [event, setEvent] = useState(null)
  const [loading, setLoading] =
    useState(true)

  const [saving, setSaving] =
    useState(false)

  const [error, setError] = useState('')

  const [interested, setInterested] =
    useState(() =>
      getInterestedEventIds().includes(
        eventId,
      ),
    )

  useEffect(() => {
    let cancelled = false

    async function loadEvent() {
      try {
        setLoading(true)
        setError('')

        const eventData =
          await getEventById(eventId)

        if (!cancelled) {
          setEvent(eventData)
        }
      } catch (requestError) {
        if (!cancelled) {
          setError(requestError.message)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadEvent()

    return () => {
      cancelled = true
    }
  }, [eventId])

  async function handleInterest() {
    try {
      setSaving(true)
      setError('')

      await saveEventAttendance(
        eventId,
        interested
          ? 'not_interested'
          : 'interested',
      )

      const updatedIds =
        toggleEventInterest(eventId)

      setInterested(
        updatedIds.includes(eventId),
      )
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navigation />

      <main className="mx-auto max-w-5xl px-4 py-8">
        <NavLink
          className="font-semibold text-violet-600"
          to="/events"
        >
          ← Back to events
        </NavLink>

        {loading ? (
          <p className="py-16 text-center text-gray-500">
            Loading event...
          </p>
        ) : error || !event ? (
          <p
            className="mt-8 rounded-lg bg-red-50 p-5 text-red-700"
            role="alert"
          >
            {error || 'Event not found.'}
          </p>
        ) : (
          <article className="mt-6 overflow-hidden rounded-2xl border bg-white shadow-sm">
            <img
              className="max-h-120 w-full object-cover"
              src={event.imageUrl}
              alt=""
            />

            <div className="p-7">
              {event.status && (
                <span className="rounded-md bg-violet-50 px-3 py-1 text-sm font-semibold text-violet-700">
                  {event.status}
                </span>
              )}

              <div className="mt-4 flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    {event.title}
                  </h1>

                  <p className="mt-3 font-semibold text-gray-800">
                    {formatDate(
                      event.startDate,
                    )}
                  </p>

                  <p className="mt-2 text-gray-600">
                    {event.venue}
                  </p>

                  <p className="text-gray-500">
                    {event.address},{' '}
                    {event.city}, {event.state}
                  </p>
                </div>

                <button
                  className={`shrink-0 rounded-full px-6 py-3 font-semibold text-white disabled:opacity-60 ${
                    interested
                      ? 'bg-red-600'
                      : 'bg-violet-600'
                  }`}
                  type="button"
                  disabled={saving}
                  onClick={handleInterest}
                >
                  {saving
                    ? 'Saving...'
                    : interested
                      ? 'Remove interest'
                      : 'Interested'}
                </button>
              </div>

              <section className="mt-8 border-t pt-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  About this event
                </h2>

                <p className="mt-3 leading-relaxed text-gray-700">
                  {event.description}
                </p>
              </section>

              <p className="mt-6 text-xl font-bold text-gray-900">
                {formatPrice(
                  event.priceCents,
                )}
              </p>
            </div>
          </article>
        )}
      </main>
    </div>
  )
}
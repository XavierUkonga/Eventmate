import { NavLink } from 'react-router-dom'

function formatDate(dateString) {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(dateString))
}

function formatPrice(priceCents) {
  if (priceCents === 0) {
    return 'Free'
  }

  return `From ${new Intl.NumberFormat(
    'en-US',
    {
      style: 'currency',
      currency: 'USD',
    },
  ).format(priceCents / 100)}`
}

export default function EventCard({
  event,
  interested,
  updating,
  onToggleInterest,
}) {
  return (
    <article className="group min-w-0">
      <div className="relative aspect-video overflow-hidden rounded-xl bg-gray-200">
        <NavLink to={`/events/${event.id}`}>
          <img
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            src={event.imageUrl}
            alt=""
          />
        </NavLink>

        <button
          className={`absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-full shadow-md transition disabled:cursor-wait disabled:opacity-60 ${
            interested
              ? 'bg-violet-600 text-white'
              : 'bg-white text-gray-700 hover:text-violet-600'
          }`}
          type="button"
          disabled={updating}
          aria-label={
            interested
              ? `Remove interest in ${event.title}`
              : `Mark interest in ${event.title}`
          }
          aria-pressed={interested}
          onClick={() =>
            onToggleInterest(event.id)
          }
        >
          <svg
            className="h-6 w-6"
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill={
              interested
                ? 'currentColor'
                : 'none'
            }
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" />
          </svg>
        </button>
      </div>

      <div className="px-3 py-3">
        {event.status && (
          <span className="inline-block rounded-md bg-violet-50 px-2 py-1 text-sm font-semibold text-violet-700">
            {event.status}
          </span>
        )}

        <NavLink
          className="block"
          to={`/events/${event.id}`}
          aria-label={`View details for ${event.title}`}
        >
          <h2 className="mt-2 text-lg font-semibold leading-snug text-gray-900">
            {event.title}
          </h2>
        </NavLink>

        <p className="mt-1 font-semibold text-gray-800">
          {formatDate(event.startDate)}
        </p>

        <p className="mt-1 text-sm text-gray-600">
          {event.venue}
        </p>

        <p className="mt-1 text-sm text-gray-500">
          {event.city}, {event.state}
        </p>

        <p className="mt-3 font-semibold text-gray-900">
          {formatPrice(event.priceCents)}
        </p>

        <p
          className={`mt-2 text-sm font-semibold ${
            interested
              ? 'text-violet-600'
              : 'text-gray-500'
          }`}
        >
          {updating
            ? 'Saving...'
            : interested
              ? 'Interested'
              : 'Not marked as interested'}
        </p>
      </div>
    </article>
  )
}